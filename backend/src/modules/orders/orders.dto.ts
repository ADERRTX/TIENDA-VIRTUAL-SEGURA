import { z } from 'zod';
import { TrackingEventType } from '../../common/constants';

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Dirección de entrega inválida'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const dispatchOrderSchema = z.object({
  carrier: z.string().min(2, 'Empresa de transporte requerida'),
  trackingCode: z.string().min(3, 'Código de seguimiento requerido'),
  estimatedDate: z.string().datetime('Fecha estimada inválida'),
});

export type DispatchOrderInput = z.infer<typeof dispatchOrderSchema>;

export const shipmentEventSchema = z.object({
  type: z.nativeEnum(TrackingEventType),
  note: z.string().optional(),
});

export type ShipmentEventInput = z.infer<typeof shipmentEventSchema>;
