import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SearchModule } from './modules/search/search.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SecurityModule } from './modules/security/security.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ContentReportsModule } from './modules/content-reports/content-reports.module';
import { BillingModule } from './modules/billing/billing.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthController } from './controllers/health.controller';
import { ApiConfigService } from './config/api-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.${NODE_ENV}'],
    }),
    AuthModule,
    UsersModule,
    SellersModule,
    CatalogModule,
    SearchModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ShipmentsModule,
    TrackingModule,
    ReputationModule,
    ClaimsModule,
    ReturnsModule,
    SecurityModule,
    AdminModule,
    ReportsModule,
    WishlistModule,
    ContentReportsModule,
    BillingModule,
    PromotionsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}