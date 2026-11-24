// [REGLAS & FUNCIONES: Configuración del Módulo de Administración] Agrupa servicios de configuración global, auditoría y métricas de plataforma.
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
