import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { requestAsyncStorage } from '../async-context';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const xForwardedFor = request.headers?.['x-forwarded-for'];
    const forwardedIp = typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0]?.trim() : null;
    const ip = request.ip || forwardedIp || request.socket?.remoteAddress || null;
    const userAgent = request.headers?.['user-agent'] || null;

    // Store IP and User-Agent in async local storage for audit logs
    requestAsyncStorage.enterWith({ ip, userAgent });
    (request as any).auditMeta = { ip, userAgent };

    return next.handle();
  }
}
