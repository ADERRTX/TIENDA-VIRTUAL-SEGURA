// [REGLAS & FUNCIONES: Configuración del Módulo de Reseñas] Registra endpoints y servicios de calificaciones de productos y vendedores.
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
