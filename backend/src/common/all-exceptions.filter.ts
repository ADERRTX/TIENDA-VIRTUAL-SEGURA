import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = crypto.randomUUID();
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as {
        message?: string | string[];
        code?: string;
      };
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} → ${status}: ${JSON.stringify(res)}`,
      );

      // In production, server errors (>= 500) must not leak internal details
      const message =
        isProduction && status >= 500
          ? 'Ocurrió un error interno en el servidor.'
          : Array.isArray(res.message)
            ? res.message.join('; ')
            : (res.message ?? exception.message);

      response.status(status).json({
        error: {
          code: isProduction && status >= 500 ? 'ERROR_INTERNO' : (res.code ?? 'ERROR_HTTP'),
          message,
          request_id: requestId,
        },
      });
      return;
    }

    // Unhandled exception: stack is sent strictly to the server log, never in response
    this.logger.error(
      `[${requestId}] Error inesperado en ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(500).json({
      error: {
        code: 'ERROR_INTERNO',
        message: 'Ocurrió un error interno. Por favor intenta más tarde.',
        request_id: requestId,
      },
    });
  }
}
