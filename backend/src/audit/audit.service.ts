import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    input: {
      actorId: string | null;
      action: string;
      entity: string;
      entityId: string;
      payload?: Prisma.InputJsonValue;
    },
    db?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = db ?? this.prisma;
    await client.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload ?? Prisma.JsonNull,
      },
    });
  }
}
