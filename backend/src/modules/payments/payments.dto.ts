// [REGLAS & FUNCIONES: Esquemas DTO de Pago] Validaciones Zod para método de pago (tarjeta/simulado), monto exacto y clave de idempotencia.
import { z } from 'zod';

export const processPaymentSchema = z.object({
  orderId: z.string().uuid('ID de pedido inválido'),
  token: z.string().min(1, 'Token de pago requerido'),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
