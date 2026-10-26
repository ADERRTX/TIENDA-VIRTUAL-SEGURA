import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogService } from './catalog.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole } from '../../common/constants';
import {
  createProductSchema,
  CreateProductInput,
  updateProductSchema,
  UpdateProductInput,
  createVariantSchema,
  CreateVariantInput,
  updateVariantSchema,
  UpdateVariantInput,
} from './catalog.dto';

@Controller('seller/products')
@Roles(UserRole.SELLER)
export class SellerCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20));
    return this.catalogService.getSellerProducts(user.id, p, ps);
  }

  @Post()
  @UsePipes(new ZodPipe(createProductSchema))
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateProductInput,
  ): Promise<{ data: unknown }> {
    const product = await this.catalogService.createProduct(user.id, body);
    return { data: product };
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const product = await this.catalogService.getProductDetail(id);
    return { data: product };
  }

  @Patch(':id')
  @UsePipes(new ZodPipe(updateProductSchema))
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateProductInput,
  ): Promise<{ data: unknown }> {
    const updated = await this.catalogService.updateProduct(user.id, id, body);
    return { data: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: { ok: boolean } }> {
    await this.catalogService.deleteProduct(user.id, id);
    return { data: { ok: true } };
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ data: unknown }> {
    const image = await this.catalogService.uploadProductImage(user.id, id, file);
    return { data: image };
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  async deleteImage(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<{ data: { ok: boolean } }> {
    await this.catalogService.deleteProductImage(user.id, id, imageId);
    return { data: { ok: true } };
  }

  @Post(':id/variants')
  @UsePipes(new ZodPipe(createVariantSchema))
  async createVariant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: CreateVariantInput,
  ): Promise<{ data: unknown }> {
    const variant = await this.catalogService.createVariant(user.id, id, body);
    return { data: variant };
  }

  @Patch(':id/variants/:variantId')
  @UsePipes(new ZodPipe(updateVariantSchema))
  async updateVariant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: UpdateVariantInput,
  ): Promise<{ data: unknown }> {
    const variant = await this.catalogService.updateVariant(user.id, id, variantId, body);
    return { data: variant };
  }
}
