import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  UsePipes,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { createOrderSchema, CreateOrderInput } from './orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ZodPipe(createOrderSchema))
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateOrderInput,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<{ data: unknown }> {
    const order = await this.ordersService.createOrder(user.id, body.addressId, idempotencyKey);
    return { data: order };
  }

  @Get()
  async getMyOrders(
    @CurrentUser() user: RequestUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.ordersService.getBuyerOrders(user.id, p, ps);
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }

  @Get(':id')
  async getOrderDetail(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const order = await this.ordersService.getOrderDetail(user.id, id);
    return { data: order };
  }

  @Post(':id/cancel')
  async cancelSubOrder(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.cancelBuyerSubOrder(user.id, subOrderId);
    return { data: result };
  }

  @Post(':id/confirm-delivery')
  async confirmDelivery(
    @CurrentUser() user: RequestUser,
    @Param('id') subOrderId: string,
  ): Promise<{ data: unknown }> {
    const result = await this.ordersService.confirmDelivery(user.id, subOrderId);
    return { data: result };
  }
}
