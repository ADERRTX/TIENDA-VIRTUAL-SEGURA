import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole, UserStatus } from '../../common/constants';
import { updateConfigSchema, UpdateConfigInput } from './admin.dto';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async listUsers(
    @Query('q') q?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.adminService.listUsers({ q, role, status, page: p, pageSize: ps });
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }

  @Get('audit')
  async listAudit(
    @Query('actorId') actorId?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const result = await this.adminService.listAuditLogs({ actorId, entity, action, page: p, pageSize: ps });
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }

  @Get('config')
  async getConfig(): Promise<{ data: unknown }> {
    const config = await this.adminService.getSystemConfig();
    return { data: config };
  }

  @Patch('config')
  @UsePipes(new ZodPipe(updateConfigSchema))
  async updateConfig(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateConfigInput,
  ): Promise<{ data: unknown }> {
    const updated = await this.adminService.updateSystemConfig(body.key, body.value, user.id);
    return { data: updated };
  }

  @Get('reports/sales')
  async getSalesReport(): Promise<{ data: unknown }> {
    const report = await this.adminService.getSalesReport();
    return { data: report };
  }

  @Get('reports/orders')
  async getOrdersReport(): Promise<{ data: unknown }> {
    const report = await this.adminService.getOrdersReport();
    return { data: report };
  }

  @Get('reports/claims')
  async getClaimsReport(): Promise<{ data: unknown }> {
    const report = await this.adminService.getClaimsReport();
    return { data: report };
  }

  @Get('reports/top-products')
  async getTopProductsReport(): Promise<{ data: unknown }> {
    const report = await this.adminService.getTopProductsReport();
    return { data: report };
  }
}
