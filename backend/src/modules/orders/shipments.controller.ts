import { Controller, Get, Post, Param, Query, Body, UsePipes } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole } from '../../common/constants';
import { shipmentEventSchema, ShipmentEventInput } from './orders.dto';

@Controller('shipments')
@Roles(UserRole.ADMIN, UserRole.SUPPORT)
export class ShipmentsController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.ordersService.getShipmentOrders(p, ps);
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }
  @Post(':id/events')
  @UsePipes(new ZodPipe(shipmentEventSchema))
  async addEvent(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
    @Body() body: ShipmentEventInput,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.addShipmentEvent(subOrderId, user.id, body);
    return { data: result };
  }
}
