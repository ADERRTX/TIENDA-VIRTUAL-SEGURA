import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/clock.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  validateTransition,
} from './order-state-machine';
import {
  SubOrderStatus,
  OrderStatus,
  OrderPaymentStatus,
  CustodyStatus,
  ShipmentStatus,
  TrackingEventType,
  NotificationType,
} from '../../common/constants';
import { DispatchOrderInput, ShipmentEventInput } from './orders.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createOrder(userId: string, addressId: string, idempotencyKey?: string): Promise<unknown> {
    if (!idempotencyKey) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'La cabecera Idempotency-Key es obligatoria',
      });
    }

    const cached = await this.ordersRepo.findIdempotency(idempotencyKey, userId);
    if (cached) {
      return cached;
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { seller: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException({
        code: 'CART_EMPTY',
        message: 'El carrito está vacío',
      });
    }

    const address = await this.prisma.address.findFirst({
      where: { id: addressId, deletedAt: null },
    });
    if (!address) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Dirección no encontrada',
      });
    }
    if (address.userId !== userId) {
      // Dirección pertenece a otro usuario
      throw new BadRequestException({
        code: 'ADDRESS_NOT_OWNED',
        message: 'La dirección no pertenece al usuario',
      });
    }

    const variantIds = cart.items.map((i) => i.variantId);

    const orderResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // SELECT FOR UPDATE
        const lockedVariants: Array<{ id: string; stock: number; price: number }> =
          await tx.$queryRaw`
            SELECT id, stock, price
            FROM variant
            WHERE id = ANY(${variantIds}::uuid[])
            FOR UPDATE
          `;

        const variantMap = new Map(lockedVariants.map((v) => [v.id, v]));

        // Validate and deduct stock
        for (const item of cart.items) {
          const locked = variantMap.get(item.variantId);
          if (!locked || locked.stock < item.quantity) {
            throw new BadRequestException({
              code: 'OUT_OF_STOCK',
              message: `Stock insuficiente para ${item.variant.product.title}`,
            });
          }
        }

        for (const item of cart.items) {
          await tx.$executeRaw`
            UPDATE variant
            SET stock = stock - ${item.quantity}
            WHERE id = ${item.variantId}::uuid
          `;
        }

        // Group items by seller
        const itemsBySeller = new Map<string, typeof cart.items>();
        for (const item of cart.items) {
          const sId = item.variant.product.sellerId;
          const list = itemsBySeller.get(sId) || [];
          list.push(item);
          itemsBySeller.set(sId, list);
        }

        const paymentExpires = this.clock.addMinutes(this.clock.now(), 30);

        const order = await tx.order.create({
          data: {
            buyerId: userId,
            addressId,
            status: OrderStatus.PENDIENTE_PAGO,
            paymentStatus: OrderPaymentStatus.SIN_PAGO,
            paymentExpires,
            subOrders: {
              create: Array.from(itemsBySeller.entries()).map(([sellerId, sItems]) => ({
                sellerId,
                status: SubOrderStatus.PENDIENTE_PAGO,
                items: {
                  create: sItems.map((si) => ({
                    variantId: si.variantId,
                    name: `${si.variant.product.title} - ${si.variant.name}`,
                    unitPrice: si.variant.price,
                    quantity: si.quantity,
                  })),
                },
              })),
            },
          },
          include: {
            subOrders: {
              include: { items: true, seller: true },
            },
            address: true,
          },
        });

        // Empty cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        // Save idempotency key
        await tx.idempotencyKey.create({
          data: {
            key: idempotencyKey,
            userId,
            response: order as unknown as Prisma.InputJsonValue,
          },
        });

        return order;
      },
    );

    await this.auditService.log({
      actorId: userId,
      action: 'ORDER_CREATED',
      entity: 'order',
      entityId: orderResult.id,
    });

    return orderResult;
  }

  async getBuyerOrders(userId: string, page = 1, pageSize = 10) {
    return this.ordersRepo.findBuyerOrders(userId, page, pageSize);
  }

  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.ordersRepo.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    const orderObj = order as Record<string, unknown>;
    const buyerObj = orderObj['buyer'] as { id: string } | undefined;
    const subOrdersObj = (orderObj['subOrders'] || []) as Array<{ seller: { userId: string } }>;

    const isBuyer = buyerObj?.id === userId;
    const isSeller = subOrdersObj.some((s) => s.seller?.userId === userId);

    if (!isBuyer && !isSeller) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }
    return order;
  }

  async cancelBuyerSubOrder(userId: string, subOrderId: string) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.order.buyerId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.CANCELADO, 'COMPRADOR');

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Return stock
      const items = await tx.orderItem.findMany({ where: { subOrderId } });
      for (const it of items) {
        await tx.variant.update({
          where: { id: it.variantId },
          data: { stock: { increment: it.quantity } },
        });
      }

      // Check if refund needed
      const custody = await tx.custody.findUnique({ where: { subOrderId } });
      if (custody && custody.status === CustodyStatus.RETENIDO) {
        await tx.custody.update({
          where: { subOrderId },
          data: { status: CustodyStatus.DEVUELTO },
        });
        await tx.refund.create({
          data: {
            subOrderId,
            amount: custody.amount,
            reason: 'Cancelado por el comprador antes del despacho',
            status: 'APROBADO',
          },
        });
      }

      const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, SubOrderStatus.CANCELADO, tx);
      await this.auditService.log(
        {
          actorId: userId,
          action: 'SUBORDER_CANCELLED',
          entity: 'sub_order',
          entityId: subOrderId,
        },
        tx,
      );

      return updated;
    });

    try {
      await this.notificationsService.notify(
        subOrder.seller.userId,
        NotificationType.ORDER,
        'El comprador canceló su sub-pedido antes del despacho. El stock ha sido devuelto.',
      );
    } catch {}

    return result;
  }

  async confirmDelivery(userId: string, subOrderId: string) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.order.buyerId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Pedido no encontrado',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.FINALIZADO, 'COMPRADOR');

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Release custody to seller
      await tx.custody.updateMany({
        where: { subOrderId, status: CustodyStatus.RETENIDO },
        data: { status: CustodyStatus.LIBERADO },
      });

      const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, SubOrderStatus.FINALIZADO, tx);
      await this.auditService.log(
        {
          actorId: userId,
          action: 'ORDER_DELIVERY_CONFIRMED',
          entity: 'sub_order',
          entityId: subOrderId,
        },
        tx,
      );
      return updated;
    });

    try {
      await this.notificationsService.notify(
        userId,
        NotificationType.ORDER,
        'Has confirmado la entrega. Tu pedido ha finalizado exitosamente.',
      );
      await this.notificationsService.notify(
        subOrder.seller.userId,
        NotificationType.ORDER,
        'El comprador confirmó la entrega de su pedido. Los fondos en custodia han sido liberados.',
      );
    } catch {}

    return result;
  }

  // Seller methods
  async getSellerOrders(userId: string, status?: SubOrderStatus, page = 1, pageSize = 10) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'Vendedor no encontrado',
      });
    }
    return this.ordersRepo.findSellerOrders(seller.id, status, page, pageSize);
  }

  async confirmSellerSubOrder(userId: string, subOrderId: string) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.seller.userId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Sub-pedido no encontrado',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.CONFIRMADO, 'VENDEDOR');

    const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, SubOrderStatus.CONFIRMADO);
    await this.auditService.log({
      actorId: userId,
      action: 'SUBORDER_CONFIRMED',
      entity: 'sub_order',
      entityId: subOrderId,
    });

    try {
      await this.notificationsService.notify(
        subOrder.order.buyerId,
        NotificationType.ORDER,
        'El vendedor confirmó tu pedido y comenzará su preparación.',
      );
    } catch {}

    return updated;
  }

  async prepareSellerSubOrder(userId: string, subOrderId: string) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.seller.userId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Sub-pedido no encontrado',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.EN_PREPARACION, 'VENDEDOR');

    const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, SubOrderStatus.EN_PREPARACION);
    await this.auditService.log({
      actorId: userId,
      action: 'SUBORDER_PREPARING',
      entity: 'sub_order',
      entityId: subOrderId,
    });

    try {
      await this.notificationsService.notify(
        subOrder.order.buyerId,
        NotificationType.ORDER,
        'Tu pedido está siendo preparado para el despacho.',
      );
    } catch {}

    return updated;
  }

  async dispatchSellerSubOrder(userId: string, subOrderId: string, input: DispatchOrderInput) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.seller.userId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Sub-pedido no encontrado',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.DESPACHADO, 'VENDEDOR');

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const shipment = await tx.shipment.create({
        data: {
          subOrderId,
          carrier: input.carrier,
          trackingCode: input.trackingCode,
          estimatedDate: new Date(input.estimatedDate),
          status: ShipmentStatus.PENDIENTE,
        },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          type: TrackingEventType.DESPACHADO,
          note: `Despachado por el vendedor con transportista ${input.carrier}`,
          occurredAt: this.clock.now(),
        },
      });

      const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, SubOrderStatus.DESPACHADO, tx);
      await this.auditService.log(
        {
          actorId: userId,
          action: 'SUBORDER_DISPATCHED',
          entity: 'sub_order',
          entityId: subOrderId,
          payload: { trackingCode: input.trackingCode },
        },
        tx,
      );
      return updated;
    });

    try {
      await this.notificationsService.notify(
        subOrder.order.buyerId,
        NotificationType.ORDER,
        `Tu sub-pedido ha sido despachado con la empresa ${input.carrier}. Código de guía: ${input.trackingCode}.`,
      );
    } catch {}

    return result;
  }
  async getShipmentOrders(page: number, pageSize: number) {
    return this.ordersRepo.findShipmentOrders(page, pageSize);
  }
  async addShipmentEvent(subOrderId: string, actorId: string, input: ShipmentEventInput) {
    const subOrder = await this.ordersRepo.findSubOrderById(subOrderId);
    if (!subOrder || !subOrder.shipment) {
      throw new NotFoundException({
        code: 'SHIPMENT_NOT_FOUND',
        message: 'Envío no encontrado para este sub-pedido',
      });
    }

    let targetSubStatus: SubOrderStatus = SubOrderStatus.EN_TRANSITO;
    let targetShipmentStatus: ShipmentStatus = ShipmentStatus.EN_TRANSITO;

    if (input.type === TrackingEventType.EN_REPARTO) {
      targetSubStatus = SubOrderStatus.EN_REPARTO;
      targetShipmentStatus = ShipmentStatus.EN_REPARTO;
    } else if (input.type === TrackingEventType.ENTREGADO) {
      targetSubStatus = SubOrderStatus.ENTREGADO;
      targetShipmentStatus = ShipmentStatus.ENTREGADO;
    }

    validateTransition(subOrder.status, targetSubStatus, 'TRANSPORTISTA');

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.shipment.update({
        where: { id: subOrder.shipment!.id },
        data: { status: targetShipmentStatus },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: subOrder.shipment!.id,
          type: input.type,
          note: input.note,
          occurredAt: this.clock.now(),
        },
      });

      const updated = await this.ordersRepo.updateSubOrderStatus(subOrderId, targetSubStatus, tx);
      await this.auditService.log(
        {
          actorId,
          action: `SHIPMENT_${input.type}`,
          entity: 'shipment',
          entityId: subOrder.shipment!.id,
        },
        tx,
      );
      return updated;
    });

    try {
      if (input.type === TrackingEventType.ENTREGADO) {
        await this.notificationsService.notify(
          subOrder.order.buyerId,
          NotificationType.ORDER,
          'Tu pedido figura como entregado. Por favor ingresa a Mis Pedidos para confirmar la recepción.',
        );
        await this.notificationsService.notify(
          subOrder.seller.userId,
          NotificationType.ORDER,
          'El paquete ha sido entregado al comprador.',
        );
      }
    } catch {}

    return result;
  }
}
