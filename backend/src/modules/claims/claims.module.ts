import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { ClaimsRepository } from './claims.repository';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [PaymentsModule, OrdersModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsRepository],
  exports: [ClaimsService, ClaimsRepository],
})
export class ClaimsModule {}
