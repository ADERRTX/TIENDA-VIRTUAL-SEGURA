// [REGLAS & FUNCIONES: Decorador @CurrentUser] Extrae los datos del usuario autenticado (id, email, role) desde el objeto de petición Express.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, UserStatus } from '../constants';

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
