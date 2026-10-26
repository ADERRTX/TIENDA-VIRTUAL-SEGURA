import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JWT_COOKIE_NAME } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.[JWT_COOKIE_NAME] ||
      request.headers.authorization?.replace(/^Bearer\s+/i, '');

    // Simple CSRF check on mutating requests
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(request.method)) {
      const origin = request.headers['origin'];
      if (origin) {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
        ];
        if (!allowedOrigins.includes(origin)) {
          throw new ForbiddenException({
            code: 'CSRF_INVALID_ORIGIN',
            message: 'Origen no permitido para esta solicitud',
          });
        }
      }
    }

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Sesión no iniciada',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, status: true },
      });

      if (!user || user.status === 'BLOCKED') {
        if (isPublic) return true;
        throw new UnauthorizedException({
          code: 'USER_BLOCKED',
          message: 'Usuario bloqueado o no existe',
        });
      }

      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      if (isPublic) return true;
      throw new UnauthorizedException({
        code: 'TOKEN_INVALID',
        message: 'Token inválido o expirado',
      });
    }
  }
}
