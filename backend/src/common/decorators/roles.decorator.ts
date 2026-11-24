// [REGLAS & FUNCIONES: Decorador @Roles] Asigna los roles autorizados (BUYER, SELLER, SUPPORT, ADMIN) a un controlador o método de endpoint.
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
