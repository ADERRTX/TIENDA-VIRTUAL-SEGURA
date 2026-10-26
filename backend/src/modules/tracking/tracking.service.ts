import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TimelineEntry {
  id: string;
  timestamp: Date;
  title: string;
  description?: string;
  type: string;
  actor?: string;
}

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderTimeline(userId: string, orderId: string): Promise<TimelineEntry[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        subOrders: {
          include: {
            seller: true,
            shipment: {
              include: {
                trackingEvents: { orderBy: { occurredAt: 'asc' } },
              },
            },
            claims: true,
          },
        },
        payments: true,
        buyer: true,
      },
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    const isBuyer = order.buyerId === userId;
    const isSeller = order.subOrders.some((s) => s.seller.userId === userId);

    if (!isBuyer && !isSeller) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    const timeline: TimelineEntry[] = [];

    // 1. Order created
    timeline.push({
      id: `order-created-${order.id}`,
      timestamp: order.createdAt,
      title: 'Pedido Creado',
      description: 'El pedido fue generado y se encuentra pendiente de pago',
      type: 'ORDER_CREATED',
      actor: order.buyer.fullName,
    });

    // 2. Payments
    for (const p of order.payments) {
      if (p.status === 'APROBADO') {
        timeline.push({
          id: `payment-${p.id}`,
          timestamp: p.createdAt,
          title: 'Pago Aprobado',
          description: `Pago procesado exitosamente por S/ ${(p.amount / 100).toFixed(2)}. Fondos retenidos en custodia protegida.`,
          type: 'PAYMENT_APPROVED',
        });
      } else {
        timeline.push({
          id: `payment-${p.id}`,
          timestamp: p.createdAt,
          title: 'Pago Rechazado',
          description: 'El intento de pago fue rechazado.',
          type: 'PAYMENT_REJECTED',
        });
      }
    }

    // 3. SubOrders & Shipments
    for (const sub of order.subOrders) {
      const storeName = sub.seller.storeName;

      if (sub.shipment) {
        for (const evt of sub.shipment.trackingEvents) {
          timeline.push({
            id: `evt-${evt.id}`,
            timestamp: evt.occurredAt,
            title: `Envío [${storeName}]: ${evt.type}`,
            description: evt.note || `Transportista: ${sub.shipment.carrier} - Guía: ${sub.shipment.trackingCode}`,
            type: evt.type,
            actor: sub.shipment.carrier,
          });
        }
      }

      for (const cl of sub.claims) {
        timeline.push({
          id: `claim-${cl.id}`,
          timestamp: cl.createdAt,
          title: `Reclamo abierto [${storeName}]`,
          description: `Motivo: ${cl.reason}`,
          type: 'CLAIM_OPENED',
        });
        if (cl.resolvedAt) {
          timeline.push({
            id: `claim-res-${cl.id}`,
            timestamp: cl.resolvedAt,
            title: `Reclamo resuelto [${storeName}]`,
            description: `Resolución: ${cl.resolution}`,
            type: 'CLAIM_RESOLVED',
          });
        }
      }
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return timeline;
  }
}
