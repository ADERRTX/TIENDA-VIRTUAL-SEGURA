import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller()
export class PublicCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  async getCategories(): Promise<{ data: unknown }> {
    const categories = await this.catalogService.getCategories();
    return { data: categories };
  }

  @Get('products')
  async getProducts(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ data: unknown; meta: unknown }> {
    return this.catalogService.searchProducts({
      q,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
      pageSize,
    });
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string): Promise<{ data: unknown }> {
    const product = await this.catalogService.getProductDetail(id);
    return { data: product };
  }
}
