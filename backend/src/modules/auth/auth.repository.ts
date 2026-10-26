import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { seller: true },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
  }): Promise<User> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.fullName,
        },
      });
      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });
      return user;
    });
  }

  async recordFailedLogin(id: string, failedCount: number, lockedUntil: Date | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        failedLogins: failedCount,
        lockedUntil,
      },
    });
  }

  async resetFailedLogins(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
      },
    });
  }
}
