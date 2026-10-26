import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Address, User, Prisma } from '../../generated/prisma/client';
import { AddressInput, UpdateAddressInput } from './users.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { seller: true },
    });
  }

  async updateUser(id: string, data: { fullName?: string }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAddressesByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findAddressById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async createAddress(userId: string, data: AddressInput): Promise<Address> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingAddresses = await tx.address.count({ where: { userId } });
      const makeDefault = data.isDefault || existingAddresses === 0;

      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          label: data.label,
          line1: data.line1,
          city: data.city,
          province: data.province,
          country: data.country ?? 'PE',
          isDefault: makeDefault,
        },
      });
    });
  }

  async updateAddress(
    id: string,
    userId: string,
    data: UpdateAddressInput,
  ): Promise<Address> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data,
      });
    });
  }

  async deleteAddress(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }
}
