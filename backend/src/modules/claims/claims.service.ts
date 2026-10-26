import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ClaimsRepository } from './claims.repository';
import { PaymentsService } from '../payments/payments.service';
import { OrdersRepository } from '../orders/orders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ClockService } from '../../common/clock.service';
import { AuditService } from '../../audit/audit.service';
import {
  ClaimStatus,
  ClaimResolution,
  SubOrderStatus,
  CustodyStatus,
} from '../../common/constants';
import { CreateClaimInput, ResolveClaimInput } from './claims.dto';
import { validateTransition } from '../orders/order-state-machine';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class ClaimsService {
  constructor(
    private readonly claimsRepo: ClaimsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly ordersRepo: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly auditService: AuditService,
  ) {}

  async createClaim(userId: string, input: CreateClaimInput): Promise<unknown> {
    const subOrder = await this.ordersRepo.findSubOrderById(input.subOrderId);
    if (!subOrder || subOrder.order.buyerId !== userId) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Sub-pedido no encontrado',
      });
    }

    // Allowed from ENTREGADO, EN_TRANSITO, EN_REPARTO (see docs/maquina-estados.md)
    const allowedStatuses: SubOrderStatus[] = [
      SubOrderStatus.ENTREGADO,
      SubOrderStatus.EN_TRANSITO,
      SubOrderStatus.EN_REPARTO,
    ];
    if (!allowedStatuses.includes(subOrder.status)) {
      throw new ConflictException({
        code: 'CLAIM_NOT_ALLOWED',
        message: `No se puede abrir un reclamo para un pedido en estado ${subOrder.status}`,
      });
    }

    const openClaim = await this.claimsRepo.findOpenClaimBySubOrder(input.subOrderId);
    if (openClaim) {
      throw new ConflictException({
        code: 'CLAIM_ALREADY_OPEN',
        message: 'Ya existe un reclamo abierto para este sub-pedido',
      });
    }

    validateTransition(subOrder.status, SubOrderStatus.RECLAMADO, 'COMPRADOR');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Freeze custody
      await tx.custody.updateMany({
        where: { subOrderId: input.subOrderId },
        data: { status: CustodyStatus.CONGELADO },
      });

      // Update suborder status to RECLAMADO
      await this.ordersRepo.updateSubOrderStatus(input.subOrderId, SubOrderStatus.RECLAMADO, tx);

      const claim = await this.claimsRepo.createClaim(
        {
          subOrderId: input.subOrderId,
          claimantId: userId,
          reason: input.reason,
          evidence: input.evidence,
        },
        tx,
      );

      await this.auditService.log(
        {
          actorId: userId,
          action: 'CLAIM_CREATED',
          entity: 'claim',
          entityId: claim.id,
          payload: { reason: input.reason },
        },
        tx,
      );

      return claim;
    });
  }

  async getClaimDetail(id: string, userId: string, role: string) {
    const claim = await this.claimsRepo.findClaimById(id);
    if (!claim) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    const isClaimant = claim.claimantId === userId;
    const isSeller = claim.subOrder.seller.userId === userId;
    const isAdminOrSupport = role === 'ADMIN' || role === 'SUPPORT';

    if (!isClaimant && !isSeller && !isAdminOrSupport) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    return claim;
  }

  async listClaims(userId: string, role: string, page = 1, pageSize = 10) {
    return this.claimsRepo.listClaimsForUser(userId, role, page, pageSize);
  }

  async addMessage(claimId: string, userId: string, role: string, body: string) {
    const claim = await this.claimsRepo.findClaimById(claimId);
    if (!claim) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    const isClaimant = claim.claimantId === userId;
    const isSeller = claim.subOrder.seller.userId === userId;
    const isAdminOrSupport = role === 'ADMIN' || role === 'SUPPORT';

    if (!isClaimant && !isSeller && !isAdminOrSupport) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    const message = await this.claimsRepo.addMessage(claimId, userId, body);
    if (claim.status === ClaimStatus.ABIERTO && isSeller) {
      await this.prisma.claim.update({
        where: { id: claimId },
        data: { status: ClaimStatus.EN_RESPUESTA },
      });
    }

    return message;
  }

  async resolveClaim(claimId: string, resolverId: string, input: ResolveClaimInput) {
    const claim = await this.claimsRepo.findClaimById(claimId);
    if (!claim) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    // Resolver cannot be a party
    if (claim.claimantId === resolverId || claim.subOrder.seller.userId === resolverId) {
      throw new ForbiddenException({
        code: 'CANNOT_RESOLVE_OWN_CLAIM',
        message: 'No puedes resolver un reclamo en el cual eres parte interesada',
      });
    }

    const subOrderId = claim.subOrderId;
    const subOrder = claim.subOrder;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let targetStatus: SubOrderStatus = SubOrderStatus.FINALIZADO;

      if (input.resolution === ClaimResolution.SIN_FUNDAMENTO) {
        validateTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.FINALIZADO, 'SOPORTE_ADMIN');
        targetStatus = SubOrderStatus.FINALIZADO;
        await tx.custody.updateMany({
          where: { subOrderId },
          data: { status: CustodyStatus.LIBERADO },
        });
      } else if (input.resolution === ClaimResolution.DEVOLUCION) {
        validateTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.DEVUELTO, 'SOPORTE_ADMIN');
        targetStatus = SubOrderStatus.DEVUELTO;
      } else if (input.resolution === ClaimResolution.REEMBOLSO) {
        validateTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.REEMBOLSADO, 'SOPORTE_ADMIN');
        targetStatus = SubOrderStatus.REEMBOLSADO;
        const refundAmount = input.refundAmount || subOrder.custody?.amount || 0;
        await this.paymentsService.refundSubOrder(
          subOrderId,
          refundAmount,
          'Reembolso dictaminado por resolución de reclamo',
          resolverId,
          tx,
        );
      } else if (input.resolution === ClaimResolution.REEMPLAZO) {
        validateTransition(SubOrderStatus.RECLAMADO, SubOrderStatus.CONFIRMADO, 'SOPORTE_ADMIN');
        targetStatus = SubOrderStatus.CONFIRMADO;
        await tx.custody.updateMany({
          where: { subOrderId },
          data: { status: CustodyStatus.RETENIDO },
        });
      }

      await this.ordersRepo.updateSubOrderStatus(subOrderId, targetStatus, tx);

      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: {
          status: ClaimStatus.RESUELTO,
          resolution: input.resolution,
          resolvedById: resolverId,
          resolvedAt: this.clock.now(),
        },
      });

      await this.auditService.log(
        {
          actorId: resolverId,
          action: 'CLAIM_RESOLVED',
          entity: 'claim',
          entityId: claimId,
          payload: { resolution: input.resolution },
        },
        tx,
      );

      return updatedClaim;
    });
  }

  async appealClaim(claimId: string, userId: string) {
    const claim = await this.claimsRepo.findClaimById(claimId);
    if (!claim) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    const isClaimant = claim.claimantId === userId;
    const isSeller = claim.subOrder.seller.userId === userId;
    if (!isClaimant && !isSeller) {
      throw new NotFoundException({
        code: 'CLAIM_NOT_FOUND',
        message: 'Reclamo no encontrado',
      });
    }

    if (claim.status !== ClaimStatus.RESUELTO) {
      throw new ConflictException({
        code: 'CLAIM_CANNOT_APPEAL',
        message: 'Solo se puede apelar un reclamo en estado RESUELTO',
      });
    }

    if (claim.apelatedAt) {
      throw new ConflictException({
        code: 'CLAIM_ALREADY_APPEALED',
        message: 'Este reclamo ya ha sido apelado',
      });
    }

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.APELADO,
        apelatedAt: this.clock.now(),
      },
    });

    await this.auditService.log({
      actorId: userId,
      action: 'CLAIM_APPEALED',
      entity: 'claim',
      entityId: claimId,
    });

    return updated;
  }
}
