import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CatalogRepository } from './catalog.repository';
import { SellersRepository } from '../sellers/sellers.repository';
import { AuditService } from '../../audit/audit.service';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from './catalog.dto';
import { validateImageMagicBytes, getUploadsDir } from './file-validator';
import { ProductStatus, SellerStatus } from '../../common/constants';

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalogRepo: CatalogRepository,
    private readonly sellersRepo: SellersRepository,
    private readonly auditService: AuditService,
  ) {}

  async getCategories(): Promise<unknown[]> {
    return this.catalogRepo.findAllCategories();
  }

  async searchProducts(query: {
    q?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }): Promise<{ data: unknown[]; meta: unknown }> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(query.pageSize || '12', 10) || 12));
    const minPrice = query.minPrice ? parseInt(query.minPrice, 10) : undefined;
    const maxPrice = query.maxPrice ? parseInt(query.maxPrice, 10) : undefined;
    const inStock = query.inStock === 'true';

    const allowedSorts = ['newest', 'price_asc', 'price_desc', 'relevance'];
    const sort = allowedSorts.includes(query.sort || '') ? query.sort : 'newest';

    const { items, total } = await this.catalogRepo.findPublicProducts({
      q: query.q,
      categoryId: query.categoryId,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
      pageSize,
    });

    return {
      data: items,
      meta: { page, pageSize, total },
    };
  }

  async getProductDetail(id: string): Promise<unknown> {
    const product = await this.catalogRepo.findProductById(id);
    if (!product || product.status === ProductStatus.REMOVED) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }
    return product;
  }

  private async getActiveSellerOrThrow(userId: string) {
    const seller = await this.sellersRepo.findByUserId(userId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'No tienes una cuenta de vendedor',
      });
    }
    if (seller.status !== SellerStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'SELLER_NOT_ACTIVE',
        message: 'Tu cuenta de vendedor no está activa',
      });
    }
    return seller;
  }

  async getSellerProducts(userId: string, page = 1, pageSize = 20): Promise<{ data: unknown[]; meta: unknown }> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const { items, total } = await this.catalogRepo.findSellerProducts(seller.id, page, pageSize);
    return { data: items, meta: { page, pageSize, total } };
  }

  async createProduct(userId: string, input: CreateProductInput): Promise<unknown> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.createProductWithVariant(seller.id, input);
    await this.auditService.log({
      actorId: userId,
      action: 'PRODUCT_CREATED',
      entity: 'product',
      entityId: product.id,
      payload: { title: product.title },
    });
    return product;
  }

  async updateProduct(userId: string, productId: string, input: UpdateProductInput): Promise<unknown> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    const updated = await this.catalogRepo.updateProduct(productId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'PRODUCT_UPDATED',
      entity: 'product',
      entityId: productId,
      payload: { ...input },
    });
    return updated;
  }

  async deleteProduct(userId: string, productId: string): Promise<void> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    await this.catalogRepo.updateProduct(productId, { status: ProductStatus.REMOVED });
    await this.auditService.log({
      actorId: userId,
      action: 'PRODUCT_REMOVED',
      entity: 'product',
      entityId: productId,
    });
  }

  async uploadProductImage(userId: string, productId: string, file: Express.Multer.File): Promise<unknown> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    if (!file || !file.buffer) {
      throw new BadRequestException({
        code: 'NO_FILE_PROVIDED',
        message: 'No se subió ningún archivo',
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: 'La imagen excede el límite de 5 MB',
      });
    }

    const ext = validateImageMagicBytes(file.buffer);
    const filename = `${crypto.randomUUID()}.${ext}`;
    const targetDir = getUploadsDir();
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const isMain = product.images.length === 0;
    const image = await this.catalogRepo.addProductImage(productId, filename, isMain);

    await this.auditService.log({
      actorId: userId,
      action: 'IMAGE_UPLOADED',
      entity: 'product_image',
      entityId: image.id,
      payload: { filename },
    });

    return image;
  }

  async deleteProductImage(userId: string, productId: string, imageId: string): Promise<void> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    const image = await this.catalogRepo.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundException({
        code: 'IMAGE_NOT_FOUND',
        message: 'Imagen no encontrada',
      });
    }

    await this.catalogRepo.deleteProductImage(imageId);

    // Delete file from disk silently
    const filePath = path.join(getUploadsDir(), image.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore disk delete error
      }
    }
  }

  async createVariant(userId: string, productId: string, input: CreateVariantInput): Promise<unknown> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    const variant = await this.catalogRepo.createVariant(productId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'VARIANT_CREATED',
      entity: 'variant',
      entityId: variant.id,
      payload: { price: variant.price, stock: variant.stock },
    });
    return variant;
  }

  async updateVariant(userId: string, productId: string, variantId: string, input: UpdateVariantInput): Promise<unknown> {
    const seller = await this.getActiveSellerOrThrow(userId);
    const product = await this.catalogRepo.findProductById(productId);
    if (!product || product.sellerId !== seller.id) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado',
      });
    }

    const variant = await this.catalogRepo.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException({
        code: 'VARIANT_NOT_FOUND',
        message: 'Variante no encontrada',
      });
    }

    const updated = await this.catalogRepo.updateVariant(variantId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'VARIANT_UPDATED',
      entity: 'variant',
      entityId: variantId,
      payload: { ...input },
    });
    return updated;
  }
}
