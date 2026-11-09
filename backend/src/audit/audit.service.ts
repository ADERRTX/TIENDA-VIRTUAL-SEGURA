import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { requestAsyncStorage } from '../common/async-context';

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
      ip?: string;
      userAgent?: string;
    },
    db?: Prisma.TransactionClient,
  ): Promise<void> {
    // Retrieve IP/User-Agent from async local storage if not provided or empty
    const meta = requestAsyncStorage.getStore?.();
    const resolvedIp = (input.ip && input.ip.trim() !== '') ? input.ip.trim() : (meta?.ip ?? null);
    const resolvedUserAgent = (input.userAgent && input.userAgent.trim() !== '') ? input.userAgent.trim() : (meta?.userAgent ?? null);

    const client = db ?? this.prisma;
    await client.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload ?? Prisma.JsonNull,
        ip: resolvedIp,
        userAgent: resolvedUserAgent,
      },
    });
  }
}
