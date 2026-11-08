import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ----- Password recovery schemas -----
export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  newPassword: z
    .string()
    .min(12, 'La nueva contraseña debe tener al menos 12 caracteres')
    .refine((val) => /[A-Z]/.test(val), { message: 'Debe incluir al menos una letra mayúscula' })
    .refine((val) => /[a-z]/.test(val), { message: 'Debe incluir al menos una letra minúscula' })
    .refine((val) => /[0-9]/.test(val), { message: 'Debe incluir al menos un número' })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Debe incluir al menos un carácter especial' }),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
