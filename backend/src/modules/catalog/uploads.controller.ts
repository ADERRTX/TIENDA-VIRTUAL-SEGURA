import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../../common/decorators/public.decorator';
import { getUploadsDir } from './file-validator';

@Public()
@Controller('uploads')
export class UploadsController {
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response): void {
    // Validate filename security
    const safeRegex = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i;
    if (!safeRegex.test(filename)) {
      throw new NotFoundException({
        code: 'FILE_NOT_FOUND',
        message: 'Archivo no encontrado',
      });
    }

    const filePath = path.join(getUploadsDir(), filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException({
        code: 'FILE_NOT_FOUND',
        message: 'Archivo no encontrado',
      });
    }

    res.sendFile(filePath);
  }
}
