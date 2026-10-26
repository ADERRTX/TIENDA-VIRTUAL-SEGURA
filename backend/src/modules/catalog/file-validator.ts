import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export function validateImageMagicBytes(buffer: Buffer): 'jpg' | 'png' | 'webp' {
  if (buffer.length < 12) {
    throw new BadRequestException({
      code: 'INVALID_FILE_TYPE',
      message: 'Archivo de imagen corrupto o demasiado pequeño',
    });
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WEBP: RIFF....WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'webp';
  }

  throw new BadRequestException({
    code: 'INVALID_FILE_TYPE',
    message: 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP reales.',
  });
}

export function getUploadsDir(): string {
  const dir = path.resolve(process.env['UPLOAD_DIR'] || './uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
