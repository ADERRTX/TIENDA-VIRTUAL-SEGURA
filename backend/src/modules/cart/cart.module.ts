// [REGLAS & FUNCIONES: Configuración del Módulo de Carrito] Registra endpoints y lógica de gestión de carritos de compra persistentes.
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
