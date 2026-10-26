import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, PaymentStatus, Prisma } from '../../generated/prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrderWithItems(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        subOrders: {
          include: {
            items: true,
            custody: true,
            refunds: true,
          },
        },
        payments: true,
      },
    });
  }

  async findApprovedPaymentByOrder(orderId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        orderId,
        status: PaymentStatus.APROBADO,
      },
    });
  }

  async createPayment(
    data: {
      orderId: string;
      subOrderId?: string | null;
      amount: number;
      status: PaymentStatus;
    },
    db?: Prisma.TransactionClient,
  ): Promise<Payment> {
    const client = db ?? this.prisma;
    return client.payment.create({
      data: {
        orderId: data.orderId,
        subOrderId: data.subOrderId ?? null,
        amount: data.amount,
        status: data.status,
      },
    });
  }
}
