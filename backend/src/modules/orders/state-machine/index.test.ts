import { EstadoPedido } from './index';
import { SubPedidoEstado } from '@tvs/shared/enums';
import { OrderInvalidTransitionError } from '@tvs/shared/errors';

describe('EstadoPedido', () => {
  let estado: EstadoPedido;

  beforeEach(() => {
    estado = new EstadoPedido();
  });

  // Transiciones válidas
  describe('transiciones válidas', () => {
    const validas: Array<[SubPedidoEstado, SubPedidoEstado, 'SISTEMA' | 'COMPRADOR' | 'VENDEDOR' | 'TRANSPORTISTA' | 'SOPORTE_ADMIN']> = [
      [SubPedidoEstado.PENDIENTE_PAGO, SubPedidoEstado.PAGADO, 'SISTEMA'],
      [SubPedidoEstado.PENDIENTE_PAGO, SubPedidoEstado.CANCELADO, 'SISTEMA'],
      [SubPedidoEstado.PAGADO, SubPedidoEstado.CONFIRMADO, 'VENDEDOR'],
      [SubPedidoEstado.PAGADO, SubPedidoEstado.CANCELADO, 'COMPRADOR'],
      [SubPedidoEstado.PAGADO, SubPedidoEstado.CANCELADO, 'SISTEMA'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.EN_PREPARACION, 'VENDEDOR'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.CANCELADO, 'COMPRADOR'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.CANCELADO, 'VENDEDOR'],
      [SubPedidoEstado.EN_PREPARACION, SubPedidoEstado.DESPACHADO, 'VENDEDOR'],
      [SubPedidoEstado.EN_PREPARACION, SubPedidoEstado.CANCELADO, 'COMPRADOR'],
      [SubPedidoEstado.EN_PREPARACION, SubPedidoEstado.CANCELADO, 'VENDEDOR'],
      [SubPedidoEstado.DESPACHADO, SubPedidoEstado.EN_TRANSITO, 'TRANSPORTISTA'],
      [SubPedidoEstado.DESPACHADO, SubPedidoEstado.EN_REPARTO, 'TRANSPORTISTA'],
      [SubPedidoEstado.EN_TRANSITO, SubPedidoEstado.EN_REPARTO, 'TRANSPORTISTA'],
      [SubPedidoEstado.EN_TRANSITO, SubPedidoEstado.RECLAMADO, 'COMPRADOR'],
      [SubPedidoEstado.EN_REPARTO, SubPedidoEstado.ENTREGADO, 'TRANSPORTISTA'],
      [SubPedidoEstado.EN_REPARTO, SubPedidoEstado.RECLAMADO, 'COMPRADOR'],
      [SubPedidoEstado.ENTREGADO, SubPedidoEstado.FINALIZADO, 'COMPRADOR'],
      [SubPedidoEstado.ENTREGADO, SubPedidoEstado.FINALIZADO, 'SISTEMA'],
      [SubPedidoEstado.ENTREGADO, SubPedidoEstado.RECLAMADO, 'COMPRADOR'],
      [SubPedidoEstado.RECLAMADO, SubPedidoEstado.FINALIZADO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.RECLAMADO, SubPedidoEstado.DEVUELTO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.RECLAMADO, SubPedidoEstado.REEMBOLSADO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.RECLAMADO, SubPedidoEstado.CONFIRMADO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.DEVUELTO, SubPedidoEstado.REEMBOLSADO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.CANCELADO, SubPedidoEstado.REEMBOLSADO, 'SISTEMA'],
    ];

    for (const [from, to, actor] of validas) {
      it(`permite ${from} → ${to} con actor ${actor}`, () => {
        expect(estado.puedeTransicionar(from, to, actor)).toBe(true);
      });
    }
  });

  // Transiciones inválidas
  describe('transiciones inválidas', () => {
    const invalidas: Array<[SubPedidoEstado, SubPedidoEstado, 'SISTEMA' | 'COMPRADOR' | 'VENDEDOR' | 'TRANSPORTISTA' | 'SOPORTE_ADMIN']> = [
      [SubPedidoEstado.PAGADO, SubPedidoEstado.PENDIENTE_PAGO, 'COMPRADOR'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.PAGADO, 'VENDEDOR'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.EN_PREPARACION, 'COMPRADOR'],
      [SubPedidoEstado.CONFIRMADO, SubPedidoEstado.EN_PREPARACION, 'SISTEMA'],
      [SubPedidoEstado.DESPACHADO, SubPedidoEstado.CONFIRMADO, 'VENDEDOR'],
      [SubPedidoEstado.DESPACHADO, SubPedidoEstado.PAGADO, 'COMPRADOR'],
      [SubPedidoEstado.EN_TRANSITO, SubPedidoEstado.DESPACHADO, 'TRANSPORTISTA'],
      [SubPedidoEstado.EN_REPARTO, SubPedidoEstado.EN_TRANSITO, 'TRANSPORTISTA'],
      [SubPedidoEstado.ENTREGADO, SubPedidoEstado.PAGADO, 'COMPRADOR'],
      [SubPedidoEstado.ENTREGADO, SubPedidoEstado.PENDIENTE_PAGO, 'COMPRADOR'],
      [SubPedidoEstado.FINALIZADO, SubPedidoEstado.ENTREGADO, 'COMPRADOR'],
      [SubPedidoEstado.CANCELADO, SubPedidoEstado.ENTREGADO, 'COMPRADOR'],
      [SubPedidoEstado.RECLAMADO, SubPedidoEstado.EN_PREPARACION, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.REEMBOLSADO, SubPedidoEstado.FINALIZADO, 'SOPORTE_ADMIN'],
      [SubPedidoEstado.PAGADO, SubPedidoEstado.PAGADO, 'VENDEDOR'],
      [SubPedidoEstado.EN_PREPARACION, SubPedidoEstado.EN_PREPARACION, 'VENDEDOR'],
    ];

    for (const [from, to, actor] of invalidas) {
      it(`rechaza ${from} → ${to} con actor ${actor}`, () => {
        expect(estado.puedeTransicionar(from, to, actor)).toBe(false);
      });
    }
  });

  // Actor incorrecto
  describe('actor incorrecto', () => {
    it('rechaza COMPRADOR intentando PAGADO → CONFIRMADO', () => {
      expect(estado.puedeTransicionar(SubPedidoEstado.PAGADO, SubPedidoEstado.CONFIRMADO, 'COMPRADOR')).toBe(false);
    });

    it('rechaza TRANSPORTISTA intentando CONFIRMADO → EN_PREPARACION', () => {
      expect(estado.puedeTransicionar(SubPedidoEstado.CONFIRMADO, SubPedidoEstado.EN_PREPARACION, 'TRANSPORTISTA')).toBe(false);
    });
  });

  // transicionar()
  describe('transicionar()', () => {
    it('ejecuta PENDIENTE_PAGO → PAGADO con SISTEMA sin error', () => {
      expect(() => estado.transicionar(SubPedidoEstado.PENDIENTE_PAGO, SubPedidoEstado.PAGADO, 'SISTEMA')).not.toThrow();
    });

    it('lanza OrderInvalidTransitionError para PAGADO → CONFIRMADO con COMPRADOR', () => {
      expect(() => estado.transicionar(SubPedidoEstado.PAGADO, SubPedidoEstado.CONFIRMADO, 'COMPRADOR')).toThrow(OrderInvalidTransitionError);
    });
  });

  // Derivación del estado de la compra
  describe('derivarEstadoCompra()', () => {
    it('PENDIENTE_PAGO → PENDIENTE_PAGO cuando todos están PENDIENTE_PAGO', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.PENDIENTE_PAGO])).toBe('PENDIENTE_PAGO');
    });

    it('PAGADO cuando todos están pagados', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.PAGADO, SubPedidoEstado.CONFIRMADO])).toBe('PAGADO');
    });

    it('EN_CURSO cuando hay mezcla de estados avanzados', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.PAGADO, SubPedidoEstado.DESPACHADO])).toBe('EN_CURSO');
    });

    it('CON_RECLAMO cuando alguno está RECLAMADO', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.PAGADO, SubPedidoEstado.RECLAMADO])).toBe('CON_RECLAMO');
    });

    it('FINALIZADO cuando todos están FINALIZADO', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.FINALIZADO, SubPedidoEstado.FINALIZADO])).toBe('FINALIZADO');
    });

    it('CANCELADO cuando todos están CANCELADO', () => {
      expect(estado.derivarEstadoCompra([SubPedidoEstado.CANCELADO, SubPedidoEstado.CANCELADO])).toBe('CANCELADO');
    });
  });
});