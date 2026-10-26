import {
  canTransition,
  validateTransition,
  deriveOrderStatus,
} from '../src/modules/orders/order-state-machine';
import { SubOrderStatus, OrderStatus } from '../src/common/constants';
import { ConflictException } from '@nestjs/common';

describe('Order State Machine', () => {
  describe('Transiciones válidas', () => {
    it('SISTEMA puede transicionar PENDIENTE_PAGO -> PAGADO', () => {
      expect(canTransition(SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.PAGADO, 'SISTEMA')).toBe(true);
    });

    it('COMPRADOR o SISTEMA puede transicionar PENDIENTE_PAGO -> CANCELADO', () => {
      expect(canTransition(SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.CANCELADO, 'COMPRADOR')).toBe(true);
      expect(canTransition(SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.CANCELADO, 'SISTEMA')).toBe(true);
    });

    it('VENDEDOR puede confirmar un sub-pedido PAGADO', () => {
      expect(canTransition(SubOrderStatus.PAGADO, SubOrderStatus.CONFIRMADO, 'VENDEDOR')).toBe(true);
    });

    it('VENDEDOR puede pasar CONFIRMADO -> EN_PREPARACION -> DESPACHADO', () => {
      expect(canTransition(SubOrderStatus.CONFIRMADO, SubOrderStatus.EN_PREPARACION, 'VENDEDOR')).toBe(true);
      expect(canTransition(SubOrderStatus.EN_PREPARACION, SubOrderStatus.DESPACHADO, 'VENDEDOR')).toBe(true);
    });

    it('TRANSPORTISTA puede transicionar DESPACHADO -> EN_TRANSITO -> EN_REPARTO -> ENTREGADO', () => {
      expect(canTransition(SubOrderStatus.DESPACHADO, SubOrderStatus.EN_TRANSITO, 'TRANSPORTISTA')).toBe(true);
      expect(canTransition(SubOrderStatus.EN_TRANSITO, SubOrderStatus.EN_REPARTO, 'TRANSPORTISTA')).toBe(true);
      expect(canTransition(SubOrderStatus.EN_REPARTO, SubOrderStatus.ENTREGADO, 'TRANSPORTISTA')).toBe(true);
    });

    it('COMPRADOR puede finalizar un pedido ENTREGADO o reclamarlo', () => {
      expect(canTransition(SubOrderStatus.ENTREGADO, SubOrderStatus.FINALIZADO, 'COMPRADOR')).toBe(true);
      expect(canTransition(SubOrderStatus.ENTREGADO, SubOrderStatus.RECLAMADO, 'COMPRADOR')).toBe(true);
    });

    it('SOPORTE_ADMIN puede resolver un RECLAMADO', () => {
      expect(canTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.FINALIZADO, 'SOPORTE_ADMIN')).toBe(true);
      expect(canTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.DEVUELTO, 'SOPORTE_ADMIN')).toBe(true);
      expect(canTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.REEMBOLSADO, 'SOPORTE_ADMIN')).toBe(true);
      expect(canTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.CONFIRMADO, 'SOPORTE_ADMIN')).toBe(true);
    });
  });

  describe('Transiciones inválidas', () => {
    it('VENDEDOR no puede saltar de PENDIENTE_PAGO a ENTREGADO', () => {
      expect(canTransition(SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.ENTREGADO, 'VENDEDOR')).toBe(false);
      expect(() =>
        validateTransition(SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.ENTREGADO, 'VENDEDOR'),
      ).toThrow(ConflictException);
    });

    it('COMPRADOR no puede confirmar un sub-pedido', () => {
      expect(canTransition(SubOrderStatus.PAGADO, SubOrderStatus.CONFIRMADO, 'COMPRADOR')).toBe(false);
    });

    it('No se puede cancelar un pedido ya DESPACHADO', () => {
      expect(canTransition(SubOrderStatus.DESPACHADO, SubOrderStatus.CANCELADO, 'COMPRADOR')).toBe(false);
      expect(canTransition(SubOrderStatus.DESPACHADO, SubOrderStatus.CANCELADO, 'VENDEDOR')).toBe(false);
    });

    it('No se puede despachar directamente sin preparar', () => {
      expect(canTransition(SubOrderStatus.PAGADO, SubOrderStatus.DESPACHADO, 'VENDEDOR')).toBe(false);
    });
  });

  describe('Estado derivado de la orden', () => {
    it('Todos PENDIENTE_PAGO => PENDIENTE_PAGO', () => {
      expect(deriveOrderStatus([SubOrderStatus.PENDIENTE_PAGO, SubOrderStatus.PENDIENTE_PAGO])).toBe(
        OrderStatus.PENDIENTE_PAGO,
      );
    });

    it('Todos PAGADO => PAGADO', () => {
      expect(deriveOrderStatus([SubOrderStatus.PAGADO, SubOrderStatus.PAGADO])).toBe(OrderStatus.PAGADO);
    });

    it('Todos FINALIZADO => FINALIZADO', () => {
      expect(deriveOrderStatus([SubOrderStatus.FINALIZADO, SubOrderStatus.FINALIZADO])).toBe(
        OrderStatus.FINALIZADO,
      );
    });

    it('Todos CANCELADO => CANCELADO', () => {
      expect(deriveOrderStatus([SubOrderStatus.CANCELADO, SubOrderStatus.CANCELADO])).toBe(
        OrderStatus.CANCELADO,
      );
    });

    it('Cualquiera con RECLAMADO => CON_RECLAMO', () => {
      expect(
        deriveOrderStatus([SubOrderStatus.ENTREGADO, SubOrderStatus.RECLAMADO, SubOrderStatus.PAGADO]),
      ).toBe(OrderStatus.CON_RECLAMO);
    });

    it('Estados mixtos avanzados => EN_CURSO', () => {
      expect(deriveOrderStatus([SubOrderStatus.CONFIRMADO, SubOrderStatus.EN_PREPARACION])).toBe(
        OrderStatus.EN_CURSO,
      );
    });
  });
});
