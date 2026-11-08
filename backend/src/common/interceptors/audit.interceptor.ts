import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { requestAsyncStorage } from '../async-context';

@Injectable()
export class AuditInterceptor implements NestInterceptor {


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const userAgent = request.headers?.['user-agent'] || null;
    // Store IP and User-Agent in async local storage for later retrieval
    requestAsyncStorage.enterWith({ ip, userAgent });
    // Also keep on request for any direct usage
    (request as any).auditMeta = { ip, userAgent };
    return next.handle();
  }
}
