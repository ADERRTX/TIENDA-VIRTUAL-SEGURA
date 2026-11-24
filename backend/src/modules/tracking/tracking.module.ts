// [REGLAS & FUNCIONES: Configuración del Módulo de Rastreo] Registra el seguimiento de paquetes y eventos de logística.
import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
