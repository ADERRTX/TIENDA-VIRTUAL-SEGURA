import { SubPedidoEstado } from '@tvs/shared/enums';
import { OrderInvalidTransitionError } from '@tvs/shared/errors';

export type Actor = 'SISTEMA' | 'COMPRADOR' | 'VENDEDOR' | 'TRANSPORTISTA' | 'SOPORTE_ADMIN';

export type Transition = {
  from: SubPedidoEstado;
  to: SubPedidoEstado;
  actor: Actor;
  condition: (event?: string) => boolean;
};

export type EstadoDerivadoCompra = 'PENDIENTE_PAGO' | 'PAGADO' | 'EN_CURSO' | 'CON_RECLAMO' | 'FINALIZADO' | 'CANCELADO';

export class EstadoPedido {
  private readonly transiciones: Transition[];

  constructor() {
    this.transiciones = [
      { from: SubPedidoEstado.PENDIENTE_PAGO, to: SubPedidoEstado.PAGADO, actor: 'SISTEMA', condition: () => true },
      { from: SubPedidoEstado.PENDIENTE_PAGO, to: SubPedidoEstado.CANCELADO, actor: 'SISTEMA', condition: () => true },
      { from: SubPedidoEstado.PAGADO, to: SubPedidoEstado.CONFIRMADO, actor: 'VENDEDOR', condition: () => true },
      { from: SubPedidoEstado.PAGADO, to: SubPedidoEstado.CANCELADO, actor: 'COMPRADOR', condition: () => true },
      { from: SubPedidoEstado.PAGADO, to: SubPedidoEstado.CANCELADO, actor: 'SISTEMA', condition: () => true },
      { from: SubPedidoEstado.CONFIRMADO, to: SubPedidoEstado.EN_PREPARACION, actor: 'VENDEDOR', condition: () => true },
      { from: SubPedidoEstado.CONFIRMADO, to: SubPedidoEstado.CANCELADO, actor: 'COMPRADOR', condition: () => true },
      { from: SubPedidoEstado.CONFIRMADO, to: SubPedidoEstado.CANCELADO, actor: 'VENDEDOR', condition: () => true },
      { from: SubPedidoEstado.EN_PREPARACION, to: SubPedidoEstado.DESPACHADO, actor: 'VENDEDOR', condition: () => true },
      { from: SubPedidoEstado.EN_PREPARACION, to: SubPedidoEstado.CANCELADO, actor: 'COMPRADOR', condition: () => true },
      { from: SubPedidoEstado.EN_PREPARACION, to: SubPedidoEstado.CANCELADO, actor: 'VENDEDOR', condition: () => true },
      { from: SubPedidoEstado.DESPACHADO, to: SubPedidoEstado.EN_TRANSITO, actor: 'TRANSPORTISTA', condition: () => true },
      { from: SubPedidoEstado.DESPACHADO, to: SubPedidoEstado.EN_REPARTO, actor: 'TRANSPORTISTA', condition: () => true },
      { from: SubPedidoEstado.EN_TRANSITO, to: SubPedidoEstado.EN_REPARTO, actor: 'TRANSPORTISTA', condition: () => true },
      { from: SubPedidoEstado.EN_TRANSITO, to: SubPedidoEstado.RECLAMADO, actor: 'COMPRADOR', condition: () => this.vencidoSinEntrega(7) },
      { from: SubPedidoEstado.EN_REPARTO, to: SubPedidoEstado.ENTREGADO, actor: 'TRANSPORTISTA', condition: () => true },
      { from: SubPedidoEstado.EN_REPARTO, to: SubPedidoEstado.RECLAMADO, actor: 'COMPRADOR', condition: () => this.vencidoSinEntrega(7) },
      { from: SubPedidoEstado.ENTREGADO, to: SubPedidoEstado.FINALIZADO, actor: 'COMPRADOR', condition: () => true },
      { from: SubPedidoEstado.ENTREGADO, to: SubPedidoEstado.FINALIZADO, actor: 'SISTEMA', condition: () => this.vencidoSinEntrega(7) },
      { from: SubPedidoEstado.ENTREGADO, to: SubPedidoEstado.RECLAMADO, actor: 'COMPRADOR', condition: () => true },
      { from: SubPedidoEstado.RECLAMADO, to: SubPedidoEstado.FINALIZADO, actor: 'SOPORTE_ADMIN', condition: () => true },
      { from: SubPedidoEstado.RECLAMADO, to: SubPedidoEstado.DEVUELTO, actor: 'SOPORTE_ADMIN', condition: () => true },
      { from: SubPedidoEstado.RECLAMADO, to: SubPedidoEstado.REEMBOLSADO, actor: 'SOPORTE_ADMIN', condition: () => true },
      { from: SubPedidoEstado.RECLAMADO, to: SubPedidoEstado.CONFIRMADO, actor: 'SOPORTE_ADMIN', condition: () => true },
      { from: SubPedidoEstado.DEVUELTO, to: SubPedidoEstado.REEMBOLSADO, actor: 'SOPORTE_ADMIN', condition: () => true },
      { from: SubPedidoEstado.CANCELADO, to: SubPedidoEstado.REEMBOLSADO, actor: 'SISTEMA', condition: () => true },
    ];
  }

private vencidoSinEntrega(dias: number): boolean {
    return dias >= 7;
  }

  public puedeTransicionar(
    estadoActual: SubPedidoEstado,
    estadoNuevo: SubPedidoEstado,
    actor: Actor,
    evento?: string,
  ): boolean {
    const transicion = this.transiciones.find((t) => t.from === estadoActual && t.to === estadoNuevo && t.actor === actor);
    return transicion !== undefined && transicion.condition(evento);
  }

  public transicionar(
    estadoActual: SubPedidoEstado,
    estadoNuevo: SubPedidoEstado,
    actor: Actor,
    evento?: string,
  ): void {
    const transicion = this.transiciones.find((t) => t.from === estadoActual && t.to === estadoNuevo && t.actor === actor);
    if (!transicion || !transicion.condition(evento)) {
      throw new OrderInvalidTransitionError(estadoActual, estadoNuevo, actor);
    }
  }

  public derivarEstadoCompra(subPedidos: SubPedidoEstado[]): EstadoDerivadoCompra {
    const estadosFijos = subPedidos;
    if (estadosFijos.every((e) => e === SubPedidoEstado.PENDIENTE_PAGO)) {
      return 'PENDIENTE_PAGO';
    }
    // Estados donde el pago está confirmado
    const estadosConPagoConfirmado = [
      SubPedidoEstado.PAGADO,
      SubPedidoEstado.CONFIRMADO,
      SubPedidoEstado.EN_PREPARACION,
      SubPedidoEstado.DESPACHADO,
      SubPedidoEstado.EN_TRANSITO,
      SubPedidoEstado.EN_REPARTO,
      SubPedidoEstado.ENTREGADO,
    ];
    // Estados terminales
    const estadosTerminales = [
      SubPedidoEstado.FINALIZADO,
      SubPedidoEstado.CANCELADO,
      SubPedidoEstado.RECLAMADO,
      SubPedidoEstado.DEVUELTO,
      SubPedidoEstado.REEMBOLSADO,
    ];
    // Estados avanzados (preparación física en adelante)
    const estadosAvanzados = [
      SubPedidoEstado.EN_PREPARACION,
      SubPedidoEstado.DESPACHADO,
      SubPedidoEstado.EN_TRANSITO,
      SubPedidoEstado.EN_REPARTO,
      SubPedidoEstado.ENTREGADO,
    ];
    
    // "Todos pagados y ninguno finalizado" = todos tienen pago confirmado, ninguno terminal
    // Y todos en EL MISMO estado (no hay "mezcla")
    const todosMismoEstado = estadosFijos.every((e) => e === estadosFijos[0]);
    if (estadosFijos.every((e) => estadosConPagoConfirmado.includes(e)) && 
        !estadosFijos.some((e) => estadosTerminales.includes(e)) &&
        todosMismoEstado) {
      return 'PAGADO';
    }
    // "Alguno RECLAMADO" 
    if (estadosFijos.some((e) => e === SubPedidoEstado.RECLAMADO)) {
      return 'CON_RECLAMO';
    }
    // "Mezcla de estados avanzados" = hay al menos uno en estado avanzado
    // O hay mezcla de estados (no todos iguales) y algunos con pago confirmado
    if (estadosFijos.some((e) => estadosAvanzados.includes(e)) || 
        (!todosMismoEstado && estadosFijos.some((e) => estadosConPagoConfirmado.includes(e)))) {
      return 'EN_CURSO';
    }
    // "Todos FINALIZADO"
    if (estadosFijos.every((e) => e === SubPedidoEstado.FINALIZADO)) {
      return 'FINALIZADO';
    }
    // "Todos CANCELADO"
    if (estadosFijos.every((e) => e === SubPedidoEstado.CANCELADO)) {
      return 'CANCELADO';
    }
    return 'EN_CURSO';
  }
}