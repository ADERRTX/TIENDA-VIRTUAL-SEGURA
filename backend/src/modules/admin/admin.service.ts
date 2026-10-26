import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { UserRole, UserStatus, Prisma } from '../../generated/prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listUsers(params: {
    q?: string;
    role?: UserRole;
    status?: UserStatus;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role;
    if (params.status) where.status = params.status;
    if (params.q) {
      where.OR = [
        { email: { contains: params.q, mode: 'insensitive' } },
        { fullName: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          seller: { select: { id: true, storeName: true, status: true } },
        },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async listAuditLogs(params: {
    actorId?: string;
    entity?: string;
    action?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.actorId) where.actorId = params.actorId;
    if (params.entity) where.entity = params.entity;
    if (params.action) where.action = { contains: params.action, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, email: true, fullName: true, role: true } },
        },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async getSystemConfig(): Promise<unknown[]> {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemConfig(key: string, value: string, adminId: string): Promise<unknown> {
    const config = await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'SYSTEM_CONFIG_UPDATED',
      entity: 'system_config',
      entityId: key,
      payload: { key, value },
    });

    return config;
  }

  async getSalesReport() {
    const payments = await this.prisma.payment.findMany({
      where: { status: 'APROBADO' },
      select: { amount: true, createdAt: true },
    });

    const totalSales = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;

    // Group by month
    const monthlyMap = new Map<string, number>();
    for (const p of payments) {
      const month = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + p.amount);
    }

    return {
      totalSales,
      approvedTransactions: count,
      byMonth: Array.from(monthlyMap.entries()).map(([month, amount]) => ({
        month,
        amount,
      })),
    };
  }

  async getOrdersReport() {
    const groups = await this.prisma.subOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return groups.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));
  }

  async getClaimsReport() {
    const [byStatus, byResolution, total] = await Promise.all([
      this.prisma.claim.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.claim.groupBy({
        by: ['resolution'],
        where: { resolution: { not: null } },
        _count: { id: true },
      }),
      this.prisma.claim.count(),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byResolution: byResolution.map((r) => ({
        resolution: r.resolution,
        count: r._count.id,
      })),
    };
  }

  async getTopProductsReport() {
    const items = await this.prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true, unitPrice: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const populated = await Promise.all(
      items.map(async (item) => {
        const variant = await this.prisma.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        return {
          variantId: item.variantId,
          productTitle: variant?.product.title || 'Producto',
          variantName: variant?.name || 'Estándar',
          quantitySold: item._sum.quantity || 0,
          revenue: (item._sum.unitPrice || 0) * (item._sum.quantity || 1),
        };
      }),
    );

    return populated;
  }
}
