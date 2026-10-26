import { z } from 'zod';

export const addToCartSchema = z.object({
  variantId: z.string().uuid('Variante inválida'),
  quantity: z.number().int().positive('La cantidad debe ser al menos 1'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('La cantidad debe ser al menos 1'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
