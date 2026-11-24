// [REGLAS & FUNCIONES: Módulo Común Global] Registra de manera global PrismaService, ClockService y servicios transversales de infraestructura.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ClockService } from './clock.service';

@Global()
@Module({
  providers: [PrismaService, AuditService, ClockService],
  exports: [PrismaService, AuditService, ClockService],
})
export class CommonModule {}
