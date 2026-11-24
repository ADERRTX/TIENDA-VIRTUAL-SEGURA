// [REGLAS & FUNCIONES: Configuración del Módulo de Notificaciones] Registra servicios de alertas internas en la plataforma.
import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
