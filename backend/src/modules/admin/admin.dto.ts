import { z } from 'zod';

export const updateConfigSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
