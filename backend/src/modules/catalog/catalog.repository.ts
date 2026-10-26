import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Category,
  Product,
  Variant,
  ProductImage,
  ProductStatus,
  Prisma,
} from '../../generated/prisma/client';
import { CreateProductInput, UpdateProductInput, CreateVariantInput, UpdateVariantInput } from './catalog.dto';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findProductById(id: string): Promise<(Product & {
    variants: Variant[];
    images: ProductImage[];
    category: Category;
    seller: { id: string; storeName: string; status: string };
  }) | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { isMain: 'desc' } },
        category: true,
        seller: { select: { id: true, storeName: true, status: true } },
      },
    });
  }

  async findPublicProducts(params: {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: unknown[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      seller: { status: 'ACTIVE' },
    };

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const variantWhere: Prisma.VariantListRelationFilter = {};
    const conditions: Prisma.VariantWhereInput = {};

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      conditions.price = {};
      if (params.minPrice !== undefined) conditions.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) conditions.price.lte = params.maxPrice;
    }

    if (params.inStock) {
      conditions.stock = { gt: 0 };
    }

    if (Object.keys(conditions).length > 0) {
      variantWhere.some = conditions;
      where.variants = variantWhere;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: true,
          images: true,
          seller: { select: { id: true, storeName: true } },
          category: { select: { id: true, name: true } },
        },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Apply sort by price in memory if requested
    if (params.sort === 'price_asc') {
      items.sort((a, b) => {
        const pA = Math.min(...a.variants.map((v) => v.price), Infinity);
        const pB = Math.min(...b.variants.map((v) => v.price), Infinity);
        return pA - pB;
      });
    } else if (params.sort === 'price_desc') {
      items.sort((a, b) => {
        const pA = Math.max(...a.variants.map((v) => v.price), -Infinity);
        const pB = Math.max(...b.variants.map((v) => v.price), -Infinity);
        return pB - pA;
      });
    }

    return { items, total };
  }

  async findSellerProducts(sellerId: string, page = 1, pageSize = 20): Promise<{ items: unknown[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      sellerId,
      status: { not: ProductStatus.REMOVED },
    };
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: true,
          images: true,
          category: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  async createProductWithVariant(
    sellerId: string,
    data: CreateProductInput,
  ): Promise<Product & { variants: Variant[] }> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.create({
        data: {
          sellerId,
          categoryId: data.categoryId,
          title: data.title,
          description: data.description,
          status: ProductStatus.ACTIVE,
        },
      });

      const variant = await tx.variant.create({
        data: {
          productId: product.id,
          name: data.variantName || 'Estándar',
          price: data.price,
          stock: data.stock,
        },
      });

      await tx.priceHistory.create({
        data: {
          variantId: variant.id,
          price: data.price,
        },
      });

      return { ...product, variants: [variant] };
    });
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async addProductImage(productId: string, fileName: string, isMain = false): Promise<ProductImage> {
    return this.prisma.productImage.create({
      data: {
        productId,
        fileName,
        isMain,
      },
    });
  }

  async deleteProductImage(id: string): Promise<void> {
    await this.prisma.productImage.delete({
      where: { id },
    });
  }

  async findImageById(id: string): Promise<ProductImage | null> {
    return this.prisma.productImage.findUnique({
      where: { id },
    });
  }

  async createVariant(productId: string, data: CreateVariantInput): Promise<Variant> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const variant = await tx.variant.create({
        data: {
          productId,
          name: data.name,
          price: data.price,
          stock: data.stock,
        },
      });
      await tx.priceHistory.create({
        data: {
          variantId: variant.id,
          price: data.price,
        },
      });
      return variant;
    });
  }

  async updateVariant(variantId: string, data: UpdateVariantInput): Promise<Variant> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.variant.findUniqueOrThrow({ where: { id: variantId } });

      const updated = await tx.variant.update({
        where: { id: variantId },
        data: {
          name: data.name,
          price: data.price,
          stock: data.stock,
        },
      });

      if (data.price !== undefined && data.price !== current.price) {
        await tx.priceHistory.create({
          data: {
            variantId,
            price: data.price,
          },
        });
      }

      return updated;
    });
  }

  async findVariantById(id: string): Promise<(Variant & { product: Product }) | null> {
    return this.prisma.variant.findUnique({
      where: { id },
      include: { product: true },
    });
  }
}
