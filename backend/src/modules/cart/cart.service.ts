import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartInput, UpdateCartItemInput } from './cart.dto';

interface CartGroupedSeller {
  sellerId: string;
  storeName: string;
  subtotal: number;
  items: unknown[];
}

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getCart(userId: string): Promise<{
    groups: CartGroupedSeller[];
    total: number;
    totalItems: number;
    warnings: string[];
  }> {
    const cart = await this.cartRepo.getCartWithItems(userId);
    if (!cart) {
      return { groups: [], total: 0, totalItems: 0, warnings: [] };
    }

    const sellerMap = new Map<string, CartGroupedSeller>();
    const warnings: string[] = [];
    let total = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant.product;
      const seller = product.seller;

      const itemTotal = variant.price * item.quantity;
      total += itemTotal;
      totalItems += item.quantity;

      if (variant.stock < item.quantity) {
        warnings.push(
          `Stock insuficiente para "${product.title} (${variant.name})". Disponible: ${variant.stock}, solicitado: ${item.quantity}`,
        );
      }

      if (!sellerMap.has(seller.id)) {
        sellerMap.set(seller.id, {
          sellerId: seller.id,
          storeName: seller.storeName,
          subtotal: 0,
          items: [],
        });
      }

      const group = sellerMap.get(seller.id)!;
      group.subtotal += itemTotal;
      group.items.push({
        id: item.id,
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        variantName: variant.name,
        price: variant.price,
        stock: variant.stock,
        quantity: item.quantity,
        total: itemTotal,
        image: product.images[0]?.fileName || null,
      });
    }

    return {
      groups: Array.from(sellerMap.values()),
      total,
      totalItems,
      warnings,
    };
  }

  async addItem(userId: string, input: AddToCartInput): Promise<unknown> {
    const variant = await this.prisma.variant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    });

    if (!variant || variant.product.status === 'REMOVED') {
      throw new NotFoundException({
        code: 'VARIANT_NOT_FOUND',
        message: 'Producto o variante no encontrado',
      });
    }

    if (variant.stock < 1) {
      throw new BadRequestException({
        code: 'OUT_OF_STOCK',
        message: 'La variante seleccionada no cuenta con stock disponible',
      });
    }

    const cart = await this.cartRepo.findOrCreateCart(userId);
    await this.cartRepo.addItem(cart.id, input.variantId, input.quantity);

    return this.getCart(userId);
  }

  async updateItem(userId: string, variantId: string, input: UpdateCartItemInput): Promise<unknown> {
    const cart = await this.cartRepo.findOrCreateCart(userId);
    await this.cartRepo.updateItemQuantity(cart.id, variantId, input.quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, variantId: string): Promise<unknown> {
    const cart = await this.cartRepo.findOrCreateCart(userId);
    await this.cartRepo.removeItem(cart.id, variantId);
    return this.getCart(userId);
  }
}
