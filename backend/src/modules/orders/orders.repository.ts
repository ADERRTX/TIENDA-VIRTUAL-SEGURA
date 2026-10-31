import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Order,
  SubOrder,
  SubOrderStatus,
  Prisma,
} from '../../generated/prisma/client';
import { deriveOrderStatus } from './order-state-machine';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findIdempotency(key: string, userId: string): Promise<unknown | null> {
    const record = await this.prisma.idempotencyKey.findFirst({
      where: { key, userId },
    });
    return record?.response || null;
  }

  async saveIdempotency(
    key: string,
    userId: string,
    response: Prisma.InputJsonValue,
    db?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = db ?? this.prisma;
    await client.idempotencyKey.create({
      data: { key, userId, response },
    });
  }

  async findBuyerOrders(buyerId: string, page = 1, pageSize = 10) {
    const where = { buyerId };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          subOrders: {
            include: {
              seller: { select: { id: true, storeName: true } },
              items: true,
              shipment: true,
            },
          },
          address: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true, fullName: true } },
        address: true,
        payments: true,
        subOrders: {
          include: {
            seller: { select: { id: true, storeName: true, userId: true } },
            items: {
              include: {
                review: true,
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { where: { isMain: true }, take: 1 },
                      },
                    },
                  },
                },
              },
            },
            shipment: {
              include: {
                trackingEvents: { orderBy: { occurredAt: 'asc' } },
              },
            },
            custody: true,
            claims: {
              include: {
                messages: true,
              },
            },
          },
        },
      },
    });
  }

  async findSellerOrders(sellerId: string, status?: SubOrderStatus, page = 1, pageSize = 10) {
    const where: Prisma.SubOrderWhereInput = { sellerId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.subOrder.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: { select: { id: true, email: true, fullName: true } },
              address: true,
            },
          },
          items: true,
          shipment: true,
          custody: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subOrder.count({ where }),
    ]);
    return { items, total };
  }
  async findShipmentOrders(page = 1, pageSize = 10) {
    const where: Prisma.SubOrderWhereInput = {
      status: { in: ['DESPACHADO', 'EN_TRANSITO', 'EN_REPARTO'] },
      shipment: { isNot: null },
    };

    const [items, total] = await Promise.all([
      this.prisma.subOrder.findMany({
        where,
        include: {
          seller: { select: { id: true, storeName: true } },
          order: {
            include: {
              buyer: { select: { id: true, email: true, fullName: true } },
              address: true,
            },
          },
          items: true,
          shipment: {
            include: { trackingEvents: { orderBy: { occurredAt: 'asc' } } },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.subOrder.count({ where }),
    ]);
    return { items, total };
  }
  async findSubOrderById(id: string) {
    return this.prisma.subOrder.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            buyer: true,
            address: true,
          },
        },
        seller: true,
        items: true,
        shipment: {
          include: { trackingEvents: { orderBy: { occurredAt: 'asc' } } },
        },
        custody: true,
        claims: true,
      },
    });
  }

  async updateSubOrderStatus(
    subOrderId: string,
    newStatus: SubOrderStatus,
    db?: Prisma.TransactionClient,
  ): Promise<SubOrder> {
    const client = db ?? this.prisma;
    const updated = await client.subOrder.update({
      where: { id: subOrderId },
      data: { status: newStatus },
      include: { order: { include: { subOrders: true } } },
    });

    // Recalculate parent order derived status
    const allSubOrders = await client.subOrder.findMany({
      where: { orderId: updated.orderId },
      select: { status: true },
    });
    const derivedStatus = deriveOrderStatus(allSubOrders.map((s) => s.status));

    await client.order.update({
      where: { id: updated.orderId },
      data: { status: derivedStatus },
    });

    return updated;
  }
}
