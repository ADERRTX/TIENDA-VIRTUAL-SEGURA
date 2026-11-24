// [REGLAS & FUNCIONES: Decorador @Public] Marca rutas públicas que omiten la validación obligatoria del AuthGuard.
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
