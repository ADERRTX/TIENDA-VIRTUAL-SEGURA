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
import { JWT_COOKIE_NAME, getAllowedCorsOrigins } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

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
    const cookieToken = request.cookies?.[JWT_COOKIE_NAME];
    const token = cookieToken || request.headers.authorization?.replace(/^Bearer\s+/i, '');

    // CSRF: toda mutación con sesión por cookie debe venir de un origen permitido
    if (MUTATING_METHODS.includes(request.method) && cookieToken) {
      const allowedOrigins = getAllowedCorsOrigins();
      const origin = request.headers['origin'];
      if (!origin || !allowedOrigins.includes(origin)) {
        throw new ForbiddenException({
          code: 'CSRF_INVALID_ORIGIN',
          message: 'Origen no permitido para esta solicitud',
        });
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
        select: { id: true, email: true, role: true, status: true, tokensValidAfter: true },
      });

      if (!user || user.status === 'BLOCKED') {
        if (isPublic) return true;
        throw new UnauthorizedException({
          code: 'USER_BLOCKED',
          message: 'Usuario bloqueado o no existe',
        });
      }

      const revokedAt = user.tokensValidAfter;
      if (revokedAt && Math.floor(revokedAt.getTime() / 1000) > payload.iat) {
        throw new UnauthorizedException({
          code: 'TOKEN_REVOKED',
          message: 'Sesión cerrada. Inicia sesión de nuevo.',
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