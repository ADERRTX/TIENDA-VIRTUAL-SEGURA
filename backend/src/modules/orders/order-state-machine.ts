import { ConflictException } from '@nestjs/common';
import { SubOrderStatus, OrderStatus } from '../../common/constants';

export type StateMachineActor =
  | 'SISTEMA'
  | 'COMPRADOR'
  | 'VENDEDOR'
  | 'TRANSPORTISTA'
  | 'SOPORTE_ADMIN';

export interface TransitionRule {
  from: SubOrderStatus;
  to: SubOrderStatus;
  actors: StateMachineActor[];
  condition?: string;
}

export const STATE_MACHINE_RULES: TransitionRule[] = [
  {
    from: SubOrderStatus.PENDIENTE_PAGO,
    to: SubOrderStatus.PAGADO,
    actors: ['SISTEMA'],
    condition: 'Evento PagoAprobado',
  },
  {
    from: SubOrderStatus.PENDIENTE_PAGO,
    to: SubOrderStatus.CANCELADO,
    actors: ['SISTEMA', 'COMPRADOR'],
    condition: 'Pago no confirmado en 30 min o cancelado por comprador. Libera stock',
  },
  {
    from: SubOrderStatus.PAGADO,
    to: SubOrderStatus.CONFIRMADO,
    actors: ['VENDEDOR'],
    condition: 'Confirma que tiene el producto',
  },
  {
    from: SubOrderStatus.PAGADO,
    to: SubOrderStatus.CANCELADO,
    actors: ['COMPRADOR', 'SISTEMA'],
    condition: 'Antes del despacho; el sistema cancela si vendedor no confirma en 48 h. Reembolso total',
  },
  {
    from: SubOrderStatus.CONFIRMADO,
    to: SubOrderStatus.EN_PREPARACION,
    actors: ['VENDEDOR'],
    condition: 'Inicia la preparación',
  },
  {
    from: SubOrderStatus.CONFIRMADO,
    to: SubOrderStatus.CANCELADO,
    actors: ['COMPRADOR', 'VENDEDOR'],
    condition: 'Antes del despacho; vendedor solo por falta de stock. Reembolso total',
  },
  {
    from: SubOrderStatus.EN_PREPARACION,
    to: SubOrderStatus.CANCELADO,
    actors: ['COMPRADOR', 'VENDEDOR'],
    condition: 'Antes del despacho; vendedor solo por falta de stock. Reembolso total',
  },
  {
    from: SubOrderStatus.EN_PREPARACION,
    to: SubOrderStatus.DESPACHADO,
    actors: ['VENDEDOR'],
    condition: 'Registra transportista, código de seguimiento y fecha estimada',
  },
  {
    from: SubOrderStatus.DESPACHADO,
    to: SubOrderStatus.EN_TRANSITO,
    actors: ['TRANSPORTISTA'],
    condition: 'Hito de envío',
  },
  {
    from: SubOrderStatus.EN_TRANSITO,
    to: SubOrderStatus.EN_REPARTO,
    actors: ['TRANSPORTISTA'],
    condition: 'Hito de envío',
  },
  {
    from: SubOrderStatus.EN_TRANSITO,
    to: SubOrderStatus.RECLAMADO,
    actors: ['COMPRADOR'],
    condition: 'Vencido sin entrega (7 días). Custodia pasa a CONGELADO',
  },
  {
    from: SubOrderStatus.EN_REPARTO,
    to: SubOrderStatus.ENTREGADO,
    actors: ['TRANSPORTISTA'],
    condition: 'Registro de entrega. Abre el plazo de reclamo (7 días)',
  },
  {
    from: SubOrderStatus.EN_REPARTO,
    to: SubOrderStatus.RECLAMADO,
    actors: ['COMPRADOR'],
    condition: 'Vencido sin entrega (7 días). Custodia pasa a CONGELADO',
  },
  {
    from: SubOrderStatus.ENTREGADO,
    to: SubOrderStatus.FINALIZADO,
    actors: ['COMPRADOR', 'SISTEMA'],
    condition: 'Confirmación del comprador o vencimiento del plazo de reclamo. Libera custodia',
  },
  {
    from: SubOrderStatus.ENTREGADO,
    to: SubOrderStatus.RECLAMADO,
    actors: ['COMPRADOR'],
    condition: 'Reclamo dentro del plazo. Custodia pasa a CONGELADO',
  },
  {
    from: SubOrderStatus.RECLAMADO,
    to: SubOrderStatus.FINALIZADO,
    actors: ['SOPORTE_ADMIN'],
    condition: 'Resolución SIN_FUNDAMENTO',
  },
  {
    from: SubOrderStatus.RECLAMADO,
    to: SubOrderStatus.DEVUELTO,
    actors: ['SOPORTE_ADMIN'],
    condition: 'Resolución DEVOLUCION',
  },
  {
    from: SubOrderStatus.RECLAMADO,
    to: SubOrderStatus.REEMBOLSADO,
    actors: ['SOPORTE_ADMIN'],
    condition: 'Resolución REEMBOLSO (total o parcial)',
  },
  {
    from: SubOrderStatus.RECLAMADO,
    to: SubOrderStatus.CONFIRMADO,
    actors: ['SOPORTE_ADMIN'],
    condition: 'Resolución REEMPLAZO',
  },
  {
    from: SubOrderStatus.DEVUELTO,
    to: SubOrderStatus.REEMBOLSADO,
    actors: ['SOPORTE_ADMIN', 'SISTEMA'],
    condition: 'Producto devuelto y revisado',
  },
  {
    from: SubOrderStatus.CANCELADO,
    to: SubOrderStatus.REEMBOLSADO,
    actors: ['SISTEMA'],
    condition: 'Solo si hubo pago',
  },
];

export function canTransition(
  from: SubOrderStatus,
  to: SubOrderStatus,
  actor: StateMachineActor,
): boolean {
  return STATE_MACHINE_RULES.some(
    (rule) => rule.from === from && rule.to === to && rule.actors.includes(actor),
  );
}

export function validateTransition(
  from: SubOrderStatus,
  to: SubOrderStatus,
  actor: StateMachineActor,
): void {
  if (!canTransition(from, to, actor)) {
    throw new ConflictException({
      code: 'ORDER_INVALID_TRANSITION',
      message: `Transición no permitida desde ${from} hacia ${to} por ${actor}`,
    });
  }
}

export function deriveOrderStatus(subOrderStatuses: SubOrderStatus[]): OrderStatus {
  if (subOrderStatuses.length === 0) return OrderStatus.PENDIENTE_PAGO;

  if (subOrderStatuses.every((s) => s === SubOrderStatus.PENDIENTE_PAGO)) {
    return OrderStatus.PENDIENTE_PAGO;
  }
  if (subOrderStatuses.every((s) => s === SubOrderStatus.CANCELADO)) {
    return OrderStatus.CANCELADO;
  }
  if (subOrderStatuses.every((s) => s === SubOrderStatus.FINALIZADO || s === SubOrderStatus.REEMBOLSADO)) {
    return OrderStatus.FINALIZADO;
  }
  if (subOrderStatuses.some((s) => s === SubOrderStatus.RECLAMADO)) {
    return OrderStatus.CON_RECLAMO;
  }
  if (subOrderStatuses.every((s) => s === SubOrderStatus.PAGADO)) {
    return OrderStatus.PAGADO;
  }
  return OrderStatus.EN_CURSO;
}
