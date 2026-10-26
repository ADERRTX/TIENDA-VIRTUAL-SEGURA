import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole, SellerStatus } from '../../common/constants';
import { reasonActionSchema, ReasonActionInput } from './sellers.dto';

@Controller('admin/sellers')
@Roles(UserRole.ADMIN)
export class AdminSellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get()
  async list(
    @Query('status') status?: SellerStatus,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.sellersService.adminList(status, p, ps);
    return { data: result.items, meta: result.meta };
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<{ data: unknown }> {
    const seller = await this.sellersService.adminApprove(id, user.id);
    return { data: seller };
  }

  @Patch(':id/reject')
  @UsePipes(new ZodPipe(reasonActionSchema))
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: ReasonActionInput,
  ): Promise<{ data: unknown }> {
    const seller = await this.sellersService.adminReject(id, user.id, body.reason);
    return { data: seller };
  }

  @Patch(':id/suspend')
  @UsePipes(new ZodPipe(reasonActionSchema))
  async suspend(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: ReasonActionInput,
  ): Promise<{ data: unknown }> {
    const seller = await this.sellersService.adminSuspend(id, user.id, body.reason);
    return { data: seller };
  }
}
