import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20));
    const result = await this.notificationsService.list(user.id, p, ps);
    return {
      data: {
        items: result.items,
        unreadCount: result.unreadCount,
      },
      meta: { page: p, pageSize: ps, total: result.total },
    };
  }

  @Patch(':id/read')
  async markRead(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const updated = await this.notificationsService.markAsRead(user.id, id);
    return { data: updated };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: RequestUser): Promise<{ data: unknown }> {
    const result = await this.notificationsService.markAllAsRead(user.id);
    return { data: result };
  }
}
