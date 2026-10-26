import { z } from 'zod';

export const createReviewSchema = z.object({
  orderItemId: z.string().uuid('ID de item de pedido inválido'),
  stars: z.number().int().min(1, 'Mínimo 1 estrella').max(5, 'Máximo 5 estrellas'),
  comment: z.string().max(500, 'El comentario no puede superar los 500 caracteres').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
