import { z } from 'zod';
import { ProductStatus } from '../../common/constants';

export const createProductSchema = z.object({
  categoryId: z.string().uuid('Categoría inválida'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  variantName: z.string().default('Estándar'),
  price: z.number().int().positive('El precio debe ser un número entero positivo en céntimos'),
  stock: z.number().int().nonnegative('El stock debe ser 0 o positivo'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createVariantSchema = z.object({
  name: z.string().min(1, 'El nombre de variante es requerido'),
  price: z.number().int().positive('El precio debe ser en céntimos'),
  stock: z.number().int().nonnegative('El stock debe ser 0 o positivo'),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
