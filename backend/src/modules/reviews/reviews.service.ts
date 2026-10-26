import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { CreateReviewInput } from './reviews.dto';
import { SubOrderStatus } from '../../common/constants';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createReview(userId: string, input: CreateReviewInput) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: input.orderItemId },
      include: {
        subOrder: {
          include: {
            order: true,
            seller: true,
          },
        },
        review: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException({
        code: 'ORDER_ITEM_NOT_FOUND',
        message: 'Item de pedido no encontrado',
      });
    }

    if (orderItem.subOrder.order.buyerId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_ITEM_NOT_FOUND',
        message: 'Item de pedido no encontrado',
      });
    }

    // Buyer distinct from seller
    if (orderItem.subOrder.seller.userId === userId) {
      throw new ForbiddenException({
        code: 'CANNOT_REVIEW_OWN_PRODUCT',
        message: 'No puedes calificar tus propios productos',
      });
    }

    // Must be ENTREGADO or FINALIZADO
    const validStatuses: SubOrderStatus[] = [SubOrderStatus.ENTREGADO, SubOrderStatus.FINALIZADO];
    if (!validStatuses.includes(orderItem.subOrder.status)) {
      throw new ConflictException({
        code: 'REVIEW_NOT_ELIGIBLE',
        message: 'Solo se pueden calificar pedidos entregados o finalizados',
      });
    }

    if (orderItem.review) {
      throw new ConflictException({
        code: 'REVIEW_ALREADY_EXISTS',
        message: 'Ya has calificado este artículo',
      });
    }

    const review = await this.prisma.review.create({
      data: {
        orderItemId: input.orderItemId,
        buyerId: userId,
        stars: input.stars,
        comment: input.comment,
      },
      include: {
        buyer: { select: { fullName: true } },
      },
    });

    await this.auditService.log({
      actorId: userId,
      action: 'REVIEW_CREATED',
      entity: 'review',
      entityId: review.id,
      payload: { stars: input.stars },
    });

    return review;
  }

  async getProductReviews(productId: string, page = 1, pageSize = 10) {
    const where = {
      orderItem: {
        variant: {
          productId,
        },
      },
    };

    const [items, total, aggregate] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          buyer: { select: { fullName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where,
        _avg: { stars: true },
        _count: { stars: true },
      }),
    ]);

    return {
      items,
      total,
      average: aggregate._avg.stars ? Number(aggregate._avg.stars.toFixed(1)) : 0,
      count: aggregate._count.stars,
    };
  }
}
