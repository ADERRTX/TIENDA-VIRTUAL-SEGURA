import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/clock.service';
import { AuditService } from '../../audit/audit.service';
import {
  PaymentStatus,
  OrderStatus,
  SubOrderStatus,
  OrderPaymentStatus,
  CustodyStatus,
  RefundStatus,
} from '../../common/constants';
import { ProcessPaymentInput } from './payments.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly ordersRepo: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly auditService: AuditService,
  ) {}

  async processPayment(
    userId: string,
    input: ProcessPaymentInput,
    idempotencyKey?: string,
  ): Promise<unknown> {
    if (idempotencyKey) {
      const cached = await this.ordersRepo.findIdempotency(idempotencyKey, userId);
      if (cached) return cached;
    }

    const order = await this.paymentsRepo.findOrderWithItems(input.orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    if (order.buyerId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    const existingApproved = await this.paymentsRepo.findApprovedPaymentByOrder(order.id);
    if (existingApproved) {
      throw new ConflictException({
        code: 'PAYMENT_ALREADY_APPROVED',
        message: 'El pedido ya cuenta con un pago aprobado',
      });
    }

    if (order.paymentExpires < this.clock.now()) {
      throw new BadRequestException({
        code: 'PAYMENT_EXPIRED',
        message: 'El plazo de pago para este pedido ha expirado',
      });
    }

    // Always calculate total on server
    let totalAmount = 0;
    const subOrderTotals = new Map<string, number>();

    for (const sub of order.subOrders) {
      let subTotal = 0;
      for (const item of sub.items) {
        subTotal += item.unitPrice * item.quantity;
      }
      subOrderTotals.set(sub.id, subTotal);
      totalAmount += subTotal;
    }

    const isSuccess = input.token === 'tok_ok';
    const status = isSuccess ? PaymentStatus.APROBADO : PaymentStatus.RECHAZADO;

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          subOrderId: null,
          amount: totalAmount,
          status,
        },
      });

      if (isSuccess) {
        for (const sub of order.subOrders) {
          const subTotal = subOrderTotals.get(sub.id) || 0;
          await tx.subOrder.update({
            where: { id: sub.id },
            data: { status: SubOrderStatus.PAGADO },
          });

          await tx.custody.create({
            data: {
              subOrderId: sub.id,
              amount: subTotal,
              status: CustodyStatus.RETENIDO,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAGADO,
            paymentStatus: OrderPaymentStatus.PAGADO,
          },
        });
      }

      const responsePayload = {
        paymentId: payment.id,
        orderId: order.id,
        amount: totalAmount,
        status: payment.status,
        cardLast4: '4242',
        cardBrand: 'Visa Simulator',
      };

      if (idempotencyKey) {
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            userId,
            response: responsePayload as unknown as Prisma.InputJsonValue,
          },
        });
      }

      await this.auditService.log(
        {
          actorId: userId,
          action: isSuccess ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
          entity: 'payment',
          entityId: payment.id,
          payload: { amount: totalAmount, status },
        },
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  async refundSubOrder(
    subOrderId: string,
    amount: number,
    reason: string,
    actorId: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<unknown> {
    const execute = async (tx: Prisma.TransactionClient) => {
      const subOrder = await tx.subOrder.findUnique({
        where: { id: subOrderId },
        include: { custody: true, refunds: true, order: true },
      });

      if (!subOrder || !subOrder.custody) {
        throw new NotFoundException({
          code: 'CUSTODY_NOT_FOUND',
          message: 'No existe registro de custodia para este sub-pedido',
        });
      }

      const alreadyRefunded = subOrder.refunds
        .filter((r) => r.status === RefundStatus.APROBADO)
        .reduce((sum, r) => sum + r.amount, 0);

      const maxRefundable = subOrder.custody.amount - alreadyRefunded;
      if (amount > maxRefundable) {
        throw new BadRequestException({
          code: 'REFUND_EXCEEDS_PAID',
          message: `El monto a reembolsar (${amount}) supera el saldo disponible (${maxRefundable})`,
        });
      }

      const refund = await tx.refund.create({
        data: {
          subOrderId,
          amount,
          reason,
          status: RefundStatus.APROBADO,
        },
      });

      const newTotalRefunded = alreadyRefunded + amount;
      if (newTotalRefunded >= subOrder.custody.amount) {
        await tx.custody.update({
          where: { subOrderId },
          data: { status: CustodyStatus.DEVUELTO },
        });
        await tx.subOrder.update({
          where: { id: subOrderId },
          data: { status: SubOrderStatus.REEMBOLSADO },
        });
      }

      await this.auditService.log(
        {
          actorId,
          action: 'REFUND_PROCESSED',
          entity: 'refund',
          entityId: refund.id,
          payload: { amount, reason },
        },
        tx,
      );

      return refund;
    };

    if (txClient) {
      return execute(txClient);
    }
    return this.prisma.$transaction(execute);
  }
}
