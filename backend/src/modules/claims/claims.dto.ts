import { z } from 'zod';
import { ClaimResolution } from '../../common/constants';

export const createClaimSchema = z.object({
  subOrderId: z.string().uuid('ID de sub-pedido inválido'),
  reason: z.string().min(10, 'El motivo del reclamo debe tener al menos 10 caracteres'),
  evidence: z.array(z.string()).default([]),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;

export const addClaimMessageSchema = z.object({
  body: z.string().min(2, 'El mensaje no puede estar vacío'),
});

export type AddClaimMessageInput = z.infer<typeof addClaimMessageSchema>;

export const resolveClaimSchema = z.object({
  resolution: z.nativeEnum(ClaimResolution),
  refundAmount: z.number().int().positive().optional(),
});

export type ResolveClaimInput = z.infer<typeof resolveClaimSchema>;
