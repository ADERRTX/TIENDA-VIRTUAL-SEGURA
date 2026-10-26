import { Module } from '@nestjs/common';
import { PublicCatalogController } from './public-catalog.controller';
import { SellerCatalogController } from './seller-catalog.controller';
import { UploadsController } from './uploads.controller';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repository';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [SellersModule],
  controllers: [PublicCatalogController, SellerCatalogController, UploadsController],
  providers: [CatalogService, CatalogRepository],
  exports: [CatalogService, CatalogRepository],
})
export class CatalogModule {}
