import { z } from 'zod';

export const updateConfigSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;

export const blockUserSchema = z.object({
  reason: z.string().trim().min(5, 'El motivo del bloqueo debe tener al menos 5 caracteres'),
});
export type BlockUserInput = z.infer<typeof blockUserSchema>;

export const unblockUserSchema = z.object({
  reason: z.string().trim().min(5, 'El motivo del desbloqueo debe tener al menos 5 caracteres'),
});
export type UnblockUserInput = z.infer<typeof unblockUserSchema>;
