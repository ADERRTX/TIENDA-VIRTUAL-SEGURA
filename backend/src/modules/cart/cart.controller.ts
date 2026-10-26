import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { addToCartSchema, AddToCartInput, updateCartItemSchema, UpdateCartItemInput } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: RequestUser): Promise<{ data: unknown }> {
    const cart = await this.cartService.getCart(user.id);
    return { data: cart };
  }

  @Post('items')
  @UsePipes(new ZodPipe(addToCartSchema))
  async addItem(
    @CurrentUser() user: RequestUser,
    @Body() body: AddToCartInput,
  ): Promise<{ data: unknown }> {
    const cart = await this.cartService.addItem(user.id, body);
    return { data: cart };
  }

  @Patch('items/:variantId')
  @UsePipes(new ZodPipe(updateCartItemSchema))
  async updateItem(
    @CurrentUser() user: RequestUser,
    @Param('variantId') variantId: string,
    @Body() body: UpdateCartItemInput,
  ): Promise<{ data: unknown }> {
    const cart = await this.cartService.updateItem(user.id, variantId, body);
    return { data: cart };
  }

  @Delete('items/:variantId')
  async removeItem(
    @CurrentUser() user: RequestUser,
    @Param('variantId') variantId: string,
  ): Promise<{ data: unknown }> {
    const cart = await this.cartService.removeItem(user.id, variantId);
    return { data: cart };
  }
}
