import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':id/timeline')
  async getTimeline(
    @CurrentUser() user: RequestUser,
    @Param('id') orderId: string,
  ): Promise<{ data: unknown }> {
    const timeline = await this.trackingService.getOrderTimeline(user.id, orderId);
    return { data: timeline };
  }
}
