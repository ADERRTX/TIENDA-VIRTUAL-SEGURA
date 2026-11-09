import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { getUploadsDir } from '../catalog/file-validator';
import * as fs from 'fs';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<{ data: { status: string; timestamp: string } }> {
    let dbOk = false;
    let uploadsOk = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    try {
      const uploadDir = getUploadsDir();
      if (fs.existsSync(uploadDir)) {
        fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
        uploadsOk = true;
      }
    } catch {
      uploadsOk = false;
    }

    const isHealthy = dbOk && uploadsOk;
    if (!isHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      data: {
        status: isHealthy ? 'ok' : 'degradado',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
