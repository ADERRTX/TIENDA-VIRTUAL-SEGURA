import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Seller, SellerStatus, UserRole, Prisma } from '../../generated/prisma/client';
import { ApplySellerInput, UpdateSellerMeInput } from './sellers.dto';

@Injectable()
export class SellersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Seller | null> {
    return this.prisma.seller.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, fullName: true, role: true } } },
    });
  }

  async findById(id: string): Promise<Seller | null> {
    return this.prisma.seller.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true, role: true } } },
    });
  }

  async findByStoreName(storeName: string): Promise<Seller | null> {
    return this.prisma.seller.findUnique({
      where: { storeName },
    });
  }

  async create(userId: string, data: ApplySellerInput): Promise<Seller> {
    return this.prisma.seller.create({
      data: {
        userId,
        storeName: data.storeName,
        description: data.description,
        status: SellerStatus.PENDING,
      },
    });
  }

  async update(id: string, data: UpdateSellerMeInput): Promise<Seller> {
    return this.prisma.seller.update({
      where: { id },
      data,
    });
  }

  async list(status?: SellerStatus, page = 1, pageSize = 10): Promise<{ items: Seller[]; total: number }> {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        include: { user: { select: { id: true, email: true, fullName: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.seller.count({ where }),
    ]);
    return { items, total };
  }

  async approve(id: string): Promise<Seller> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const seller = await tx.seller.update({
        where: { id },
        data: {
          status: SellerStatus.ACTIVE,
          reason: null,
        },
      });

      await tx.user.update({
        where: { id: seller.userId },
        data: {
          role: UserRole.SELLER,
        },
      });

      return seller;
    });
  }

  async updateStatusWithReason(id: string, status: SellerStatus, reason: string): Promise<Seller> {
    return this.prisma.seller.update({
      where: { id },
      data: {
        status,
        reason,
      },
    });
  }
}
