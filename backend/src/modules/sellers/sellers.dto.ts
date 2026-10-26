import { z } from 'zod';

export const applySellerSchema = z.object({
  storeName: z.string().min(3, 'El nombre de la tienda debe tener al menos 3 caracteres'),
  description: z.string().optional(),
});

export type ApplySellerInput = z.infer<typeof applySellerSchema>;

export const updateSellerMeSchema = z.object({
  storeName: z.string().min(3, 'El nombre de la tienda debe tener al menos 3 caracteres').optional(),
  description: z.string().optional(),
});

export type UpdateSellerMeInput = z.infer<typeof updateSellerMeSchema>;

export const reasonActionSchema = z.object({
  reason: z.string().min(3, 'El motivo es obligatorio (mínimo 3 caracteres)'),
});

export type ReasonActionInput = z.infer<typeof reasonActionSchema>;
