import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Claim, ClaimMessage, Prisma } from '../../generated/prisma/client';

@Injectable()
export class ClaimsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClaimById(id: string) {
    return this.prisma.claim.findUnique({
      where: { id },
      include: {
        claimant: { select: { id: true, email: true, fullName: true } },
        resolvedBy: { select: { id: true, email: true, fullName: true } },
        messages: {
          include: { author: { select: { id: true, email: true, fullName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        subOrder: {
          include: {
            order: { include: { buyer: true } },
            seller: { include: { user: true } },
            items: true,
            custody: true,
          },
        },
      },
    });
  }

  async findOpenClaimBySubOrder(subOrderId: string): Promise<Claim | null> {
    return this.prisma.claim.findFirst({
      where: {
        subOrderId,
        status: { in: ['ABIERTO', 'EN_RESPUESTA', 'APELADO'] },
      },
    });
  }

  async listClaimsForUser(userId: string, role: string, page = 1, pageSize = 10) {
    let where: Prisma.ClaimWhereInput = {};
    if (role === 'BUYER') {
      where = { claimantId: userId };
    } else if (role === 'SELLER') {
      where = { subOrder: { seller: { userId } } };
    }
    // ADMIN / SUPPORT sees all

    const [items, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        include: {
          subOrder: {
            include: {
              seller: { select: { storeName: true } },
              order: { select: { id: true } },
            },
          },
          claimant: { select: { fullName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);
    return { items, total };
  }

  async createClaim(
    data: {
      subOrderId: string;
      claimantId: string;
      reason: string;
      evidence: string[];
    },
    db?: Prisma.TransactionClient,
  ): Promise<Claim> {
    const client = db ?? this.prisma;
    return client.claim.create({
      data: {
        subOrderId: data.subOrderId,
        claimantId: data.claimantId,
        reason: data.reason,
        evidence: data.evidence,
      },
    });
  }

  async addMessage(claimId: string, authorId: string, body: string): Promise<ClaimMessage> {
    return this.prisma.claimMessage.create({
      data: {
        claimId,
        authorId,
        body,
      },
      include: {
        author: { select: { id: true, email: true, fullName: true, role: true } },
      },
    });
  }
}
