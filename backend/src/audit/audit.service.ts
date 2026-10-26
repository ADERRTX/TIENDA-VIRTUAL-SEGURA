import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    actorId: string | null;
    action: string;
    entity: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    this.logger.verbose(`${input.action} on ${input.entity}:${input.entityId}`);
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload ?? {},
      },
    });
  }
}