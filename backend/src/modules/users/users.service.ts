import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuditService } from '../../audit/audit.service';
import { AddressInput, UpdateAddressInput, UpdateProfileInput } from './users.dto';
import { Address } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.usersRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      seller: (user as Record<string, unknown>)['seller'] || null,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Record<string, unknown>> {
    const user = await this.usersRepo.updateUser(userId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'PROFILE_UPDATED',
      entity: 'user',
      entityId: userId,
      payload: { ...input },
    });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.usersRepo.findAddressesByUserId(userId);
  }

  async createAddress(userId: string, input: AddressInput): Promise<Address> {
    const address = await this.usersRepo.createAddress(userId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'ADDRESS_CREATED',
      entity: 'address',
      entityId: address.id,
    });
    return address;
  }

  async updateAddress(id: string, userId: string, input: UpdateAddressInput): Promise<Address> {
    const existing = await this.usersRepo.findAddressById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Dirección no encontrada',
      });
    }

    const updated = await this.usersRepo.updateAddress(id, userId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'ADDRESS_UPDATED',
      entity: 'address',
      entityId: id,
    });
    return updated;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const existing = await this.usersRepo.findAddressById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Dirección no encontrada',
      });
    }

    await this.usersRepo.deleteAddress(id);
    await this.auditService.log({
      actorId: userId,
      action: 'ADDRESS_DELETED',
      entity: 'address',
      entityId: id,
    });
  }
}
