import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/clock.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  OrderStatus,
  SubOrderStatus,
  CustodyStatus,
  RefundStatus,
  TrackingEventType,
  NotificationType,
} from '../../common/constants';
import { deriveOrderStatus } from '../orders/order-state-machine';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getConfigValue(key: string, defaultValue: string): Promise<string> {
    try {
      const item = await this.prisma.systemConfig.findUnique({ where: { key } });
      return item?.value ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cancelExpiredPayments(): Promise<{ cancelledOrders: number }> {
    try {
      const now = this.clock.now();
      const expiredOrders = await this.prisma.order.findMany({
        where: {
          status: OrderStatus.PENDIENTE_PAGO,
          paymentExpires: { lt: now },
        },
        include: {
          subOrders: {
            include: { items: true },
          },
        },
      });

      let count = 0;
      for (const order of expiredOrders) {
        await this.prisma.$transaction(async (tx) => {
          // Return stock
          for (const sub of order.subOrders) {
            for (const item of sub.items) {
              await tx.variant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
            await tx.subOrder.update({
              where: { id: sub.id },
              data: { status: SubOrderStatus.CANCELADO },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELADO },
          });

          await this.auditService.log(
            {
              actorId: null,
              action: 'ORDER_EXPIRED_PAYMENT_CANCELLED',
              entity: 'order',
              entityId: order.id,
            },
            tx,
          );
        });

        try {
          await this.notificationsService.notify(
            order.buyerId,
            NotificationType.ORDER,
            `Tu pedido #${order.id.slice(0, 8)} fue cancelado porque expiró el plazo para completar el pago.`,
          );
        } catch {}

        count++;
      }

      await this.auditService.log({
        actorId: null,
        action: 'JOB_CANCEL_EXPIRED_PAYMENTS_EXECUTED',
        entity: 'cron_job',
        entityId: 'cancel_expired_payments',
        payload: { cancelledOrders: count },
      });

      if (count > 0) {
        this.logger.log(`Cancelados ${count} pedidos por vencimiento de pago`);
      }
      return { cancelledOrders: count };
    } catch (error) {
      this.logger.error(
        `Error al ejecutar cron cancelExpiredPayments: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { cancelledOrders: 0 };
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cancelUnconfirmedSellerOrders(): Promise<{ cancelledSubOrders: number }> {
    try {
      const hoursStr = await this.getConfigValue('SELLER_CONFIRM_HOURS', '48');
      const hours = parseInt(hoursStr, 10) || 48;
      const threshold = new Date(this.clock.now().getTime() - hours * 3600 * 1000);

      const unconfirmed = await this.prisma.subOrder.findMany({
        where: {
          status: SubOrderStatus.PAGADO,
          createdAt: { lt: threshold },
        },
        include: {
          items: true,
          custody: true,
          order: { select: { buyerId: true } },
          seller: { select: { userId: true } },
        },
      });

      let count = 0;
      for (const sub of unconfirmed) {
        await this.prisma.$transaction(async (tx) => {
          // Return stock
          for (const item of sub.items) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }

          if (sub.custody && sub.custody.status === CustodyStatus.RETENIDO) {
            await tx.custody.update({
              where: { subOrderId: sub.id },
              data: { status: CustodyStatus.DEVUELTO },
            });
            await tx.refund.create({
              data: {
                subOrderId: sub.id,
                amount: sub.custody.amount,
                reason: 'Vendedor no confirmó dentro del plazo de 48 horas',
                status: RefundStatus.APROBADO,
              },
            });
          }

          await tx.subOrder.update({
            where: { id: sub.id },
            data: { status: SubOrderStatus.CANCELADO },
          });

          const allSubOrders = await tx.subOrder.findMany({
            where: { orderId: sub.orderId },
            select: { status: true },
          });
          const derived = deriveOrderStatus(allSubOrders.map((s) => s.status));
          await tx.order.update({
            where: { id: sub.orderId },
            data: { status: derived },
          });

          await this.auditService.log(
            {
              actorId: null,
              action: 'SUBORDER_EXPIRED_CONFIRMATION_CANCELLED',
              entity: 'sub_order',
              entityId: sub.id,
            },
            tx,
          );
        });

        try {
          await this.notificationsService.notify(
            sub.order.buyerId,
            NotificationType.ORDER,
            `Tu pedido #${sub.id.slice(0, 8)} fue cancelado y reembolsado por falta de confirmación del vendedor.`,
          );
          await this.notificationsService.notify(
            sub.seller.userId,
            NotificationType.ORDER,
            `El pedido #${sub.id.slice(0, 8)} fue cancelado por expirar el plazo límite de confirmación.`,
          );
        } catch {}

        count++;
      }

      await this.auditService.log({
        actorId: null,
        action: 'JOB_CANCEL_UNCONFIRMED_SELLER_ORDERS_EXECUTED',
        entity: 'cron_job',
        entityId: 'cancel_unconfirmed_seller_orders',
        payload: { cancelledSubOrders: count },
      });

      if (count > 0) {
        this.logger.log(`Cancelados ${count} sub-pedidos por falta de confirmación del vendedor`);
      }
      return { cancelledSubOrders: count };
    } catch (error) {
      this.logger.error(
        `Error al ejecutar cron cancelUnconfirmedSellerOrders: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { cancelledSubOrders: 0 };
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async finalizeDeliveredOrders(): Promise<{ finalizedSubOrders: number }> {
    try {
      const daysStr = await this.getConfigValue('FINALIZE_AFTER_DELIVERY_DAYS', '7');
      const days = parseInt(daysStr, 10) || 7;
      const threshold = new Date(this.clock.now().getTime() - days * 24 * 3600 * 1000);

      const deliveredSubOrders = await this.prisma.subOrder.findMany({
        where: {
          status: SubOrderStatus.ENTREGADO,
          shipment: {
            trackingEvents: {
              some: {
                type: TrackingEventType.ENTREGADO,
                occurredAt: { lt: threshold },
              },
            },
          },
        },
        include: {
          custody: true,
          order: { select: { buyerId: true } },
          seller: { select: { userId: true } },
        },
      });

      let count = 0;
      for (const sub of deliveredSubOrders) {
        await this.prisma.$transaction(async (tx) => {
          if (sub.custody && sub.custody.status === CustodyStatus.RETENIDO) {
            await tx.custody.update({
              where: { subOrderId: sub.id },
              data: { status: CustodyStatus.LIBERADO },
            });
          }

          await tx.subOrder.update({
            where: { id: sub.id },
            data: { status: SubOrderStatus.FINALIZADO },
          });

          const allSubOrders = await tx.subOrder.findMany({
            where: { orderId: sub.orderId },
            select: { status: true },
          });
          const derived = deriveOrderStatus(allSubOrders.map((s) => s.status));
          await tx.order.update({
            where: { id: sub.orderId },
            data: { status: derived },
          });

          await this.auditService.log(
            {
              actorId: null,
              action: 'SUBORDER_AUTO_FINALIZED',
              entity: 'sub_order',
              entityId: sub.id,
            },
            tx,
          );
        });

        try {
          await this.notificationsService.notify(
            sub.order.buyerId,
            NotificationType.ORDER,
            `Tu pedido #${sub.id.slice(0, 8)} ha finalizado automáticamente tras expirar el periodo de reclamos.`,
          );
          await this.notificationsService.notify(
            sub.seller.userId,
            NotificationType.ORDER,
            `El pedido #${sub.id.slice(0, 8)} ha finalizado automáticamente y la custodia fue liberada a tu cuenta.`,
          );
        } catch {}

        count++;
      }

      await this.auditService.log({
        actorId: null,
        action: 'JOB_FINALIZE_DELIVERED_ORDERS_EXECUTED',
        entity: 'cron_job',
        entityId: 'finalize_delivered_orders',
        payload: { finalizedSubOrders: count },
      });

      if (count > 0) {
        this.logger.log(`Finalizados ${count} sub-pedidos tras expirar plazo de reclamo`);
      }
      return { finalizedSubOrders: count };
    } catch (error) {
      this.logger.error(
        `Error al ejecutar cron finalizeDeliveredOrders: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { finalizedSubOrders: 0 };
    }
  }

  async runAllJobs(): Promise<{
    expiredPayments: number;
    unconfirmedSeller: number;
    autoFinalized: number;
  }> {
    const p1 = await this.cancelExpiredPayments();
    const p2 = await this.cancelUnconfirmedSellerOrders();
    const p3 = await this.finalizeDeliveredOrders();

    return {
      expiredPayments: p1.cancelledOrders,
      unconfirmedSeller: p2.cancelledSubOrders,
      autoFinalized: p3.finalizedSubOrders,
    };
  }
}
