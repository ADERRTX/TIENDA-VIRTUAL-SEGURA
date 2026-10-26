import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cart, CartItem, Prisma } from '../../generated/prisma/client';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCart(userId: string): Promise<Cart> {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getCartWithItems(userId: string) {
    const cart = await this.findOrCreateCart(userId);
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    seller: { select: { id: true, storeName: true } },
                    images: { where: { isMain: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { variantId: 'asc' },
        },
      },
    });
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        variantId,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      data: {
        quantity,
      },
    });
  }

  async removeItem(cartId: string, variantId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId,
        variantId,
      },
    });
  }

  async clearCart(cartId: string, db?: Prisma.TransactionClient): Promise<void> {
    const client = db ?? this.prisma;
    await client.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
