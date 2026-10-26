import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SellersRepository } from './sellers.repository';
import { AuditService } from '../../audit/audit.service';
import { ApplySellerInput, UpdateSellerMeInput } from './sellers.dto';
import { Seller, SellerStatus } from '../../generated/prisma/client';

@Injectable()
export class SellersService {
  constructor(
    private readonly sellersRepo: SellersRepository,
    private readonly auditService: AuditService,
  ) {}

  async apply(userId: string, input: ApplySellerInput): Promise<Seller> {
    const existingSeller = await this.sellersRepo.findByUserId(userId);
    if (existingSeller) {
      throw new ConflictException({
        code: 'SELLER_ALREADY_EXISTS',
        message: 'Ya tienes una solicitud de vendedor registrada',
      });
    }

    const nameTaken = await this.sellersRepo.findByStoreName(input.storeName);
    if (nameTaken) {
      throw new ConflictException({
        code: 'STORE_NAME_TAKEN',
        message: 'El nombre de tienda ya está en uso',
      });
    }

    const seller = await this.sellersRepo.create(userId, input);
    await this.auditService.log({
      actorId: userId,
      action: 'SELLER_APPLIED',
      entity: 'seller',
      entityId: seller.id,
      payload: { storeName: seller.storeName },
    });

    return seller;
  }

  async getMe(userId: string): Promise<Seller> {
    const seller = await this.sellersRepo.findByUserId(userId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'No tienes una cuenta o solicitud de vendedor',
      });
    }
    return seller;
  }

  async updateMe(userId: string, input: UpdateSellerMeInput): Promise<Seller> {
    const seller = await this.sellersRepo.findByUserId(userId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'Vendedor no encontrado',
      });
    }

    if (input.storeName && input.storeName !== seller.storeName) {
      const nameTaken = await this.sellersRepo.findByStoreName(input.storeName);
      if (nameTaken && nameTaken.id !== seller.id) {
        throw new ConflictException({
          code: 'STORE_NAME_TAKEN',
          message: 'El nombre de tienda ya está en uso',
        });
      }
    }

    const updated = await this.sellersRepo.update(seller.id, input);
    await this.auditService.log({
      actorId: userId,
      action: 'SELLER_UPDATED',
      entity: 'seller',
      entityId: seller.id,
      payload: { ...input },
    });

    return updated;
  }

  async adminList(status?: SellerStatus, page = 1, pageSize = 10): Promise<{
    items: Seller[];
    meta: { page: number; pageSize: number; total: number };
  }> {
    const { items, total } = await this.sellersRepo.list(status, page, pageSize);
    return {
      items,
      meta: { page, pageSize, total },
    };
  }

  async adminApprove(sellerId: string, adminId: string): Promise<Seller> {
    const seller = await this.sellersRepo.findById(sellerId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'Vendedor no encontrado',
      });
    }

    const approved = await this.sellersRepo.approve(sellerId);
    await this.auditService.log({
      actorId: adminId,
      action: 'SELLER_APPROVED',
      entity: 'seller',
      entityId: sellerId,
      payload: { previousStatus: seller.status, newStatus: SellerStatus.ACTIVE },
    });

    return approved;
  }

  async adminReject(sellerId: string, adminId: string, reason: string): Promise<Seller> {
    const seller = await this.sellersRepo.findById(sellerId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'Vendedor no encontrado',
      });
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException({
        code: 'REASON_REQUIRED',
        message: 'El motivo del rechazo es obligatorio',
      });
    }

    const rejected = await this.sellersRepo.updateStatusWithReason(sellerId, SellerStatus.SUSPENDED, reason);
    await this.auditService.log({
      actorId: adminId,
      action: 'SELLER_REJECTED',
      entity: 'seller',
      entityId: sellerId,
      payload: { reason },
    });

    return rejected;
  }

  async adminSuspend(sellerId: string, adminId: string, reason: string): Promise<Seller> {
    const seller = await this.sellersRepo.findById(sellerId);
    if (!seller) {
      throw new NotFoundException({
        code: 'SELLER_NOT_FOUND',
        message: 'Vendedor no encontrado',
      });
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException({
        code: 'REASON_REQUIRED',
        message: 'El motivo de la suspensión es obligatorio',
      });
    }

    const suspended = await this.sellersRepo.updateStatusWithReason(sellerId, SellerStatus.SUSPENDED, reason);
    await this.auditService.log({
      actorId: adminId,
      action: 'SELLER_SUSPENDED',
      entity: 'seller',
      entityId: sellerId,
      payload: { reason },
    });

    return suspended;
  }
}
