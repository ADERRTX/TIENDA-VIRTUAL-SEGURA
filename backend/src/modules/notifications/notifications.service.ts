import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/clock.service';
import { NotificationType } from '../../common/constants';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async list(userId: string, page = 1, pageSize = 20) {
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return { items, total, unreadCount };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notificación no encontrada',
      });
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: this.clock.now() },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: this.clock.now() },
    });
    return { count: result.count };
  }

  async notify(userId: string, type: NotificationType, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });
  }
}
