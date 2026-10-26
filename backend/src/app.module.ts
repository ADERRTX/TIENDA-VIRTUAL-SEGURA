import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuditService } from './audit/audit.service';
import { ClockService } from './common/clock.service';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
  providers: [PrismaService, AuditService, ClockService],
  exports: [PrismaService, AuditService, ClockService],
})
export class AppModule {}
