import { Controller, Post, Param, Body, UsePipes } from '@nestjs/common';
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
