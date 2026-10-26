import { z } from 'zod';

export const processPaymentSchema = z.object({
  orderId: z.string().uuid('ID de pedido inválido'),
  token: z.string().min(1, 'Token de pago requerido'),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
