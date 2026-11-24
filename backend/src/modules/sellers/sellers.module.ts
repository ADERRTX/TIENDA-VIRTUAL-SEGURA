// [REGLAS & FUNCIONES: Configuración del Módulo de Vendedores] Agrupa controladores de postulación de vendedores y panel administrativo de aprobación.
import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { AdminSellersController } from './admin-sellers.controller';
import { SellersService } from './sellers.service';
import { SellersRepository } from './sellers.repository';

@Module({
  controllers: [SellersController, AdminSellersController],
  providers: [SellersService, SellersRepository],
  exports: [SellersService, SellersRepository],
})
export class SellersModule {}
