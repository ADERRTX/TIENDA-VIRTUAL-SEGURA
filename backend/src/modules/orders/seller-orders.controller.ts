import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole, SubOrderStatus } from '../../common/constants';
import { dispatchOrderSchema, DispatchOrderInput } from './orders.dto';

@Controller('seller/orders')
@Roles(UserRole.SELLER)
export class SellerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getSellerOrders(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: SubOrderStatus,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.ordersService.getSellerOrders(user.id, status, p, ps);
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }

  @Post(':id/confirm')
  async confirm(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.confirmSellerSubOrder(user.id, subOrderId);
    return { data: result };
  }

  @Post(':id/prepare')
  async prepare(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.prepareSellerSubOrder(user.id, subOrderId);
    return { data: result };
  }

  @Post(':id/dispatch')
  @UsePipes(new ZodPipe(dispatchOrderSchema))
  async dispatch(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
    @Body() body: DispatchOrderInput,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.dispatchSellerSubOrder(user.id, subOrderId, body);
    return { data: result };
  }
}
