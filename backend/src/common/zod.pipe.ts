import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, metadata?: ArgumentMetadata): unknown {
    // Solo se valida el cuerpo. Con @UsePipes a nivel de método, Nest también
    // pasa por aquí @CurrentUser() y @Param(), que no deben validarse con el esquema del body.
    if (metadata && metadata.type !== 'body') {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: issues || 'Error de validación de datos',
        });
      }
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
      });
    }
  }
}