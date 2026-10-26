import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const res = exception.getResponse() as {
      message?: string | string[];
      code?: string;
    };
    this.logger.error(
      `${exception.name} ${status}: ${JSON.stringify(res)}`,
    );
    response.status(status).json({
      error: {
        code: res.code ?? 'HTTP_ERROR',
        message: Array.isArray(res.message)
          ? res.message.join('; ')
          : res.message ?? exception.message,
        request_id: crypto.randomUUID(),
      },
    });
  }
}