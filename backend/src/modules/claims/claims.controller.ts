import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { UserRole } from '../../common/constants';
import {
  createClaimSchema,
  CreateClaimInput,
  addClaimMessageSchema,
  AddClaimMessageInput,
  resolveClaimSchema,
  ResolveClaimInput,
} from './claims.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @UsePipes(new ZodPipe(createClaimSchema))
  async createClaim(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateClaimInput,
  ): Promise<{ data: unknown }> {
    const claim = await this.claimsService.createClaim(user.id, body);
    return { data: claim };
  }

  @Get()
  async listClaims(
    @CurrentUser() user: RequestUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.claimsService.listClaims(user.id, user.role, p, ps);
    return { data: result.items, meta: { page: p, pageSize: ps, total: result.total } };
  }

  @Get(':id')
  async getClaimDetail(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const claim = await this.claimsService.getClaimDetail(id, user.id, user.role);
    return { data: claim };
  }

  @Post(':id/messages')
  @UsePipes(new ZodPipe(addClaimMessageSchema))
  async addMessage(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: AddClaimMessageInput,
  ): Promise<{ data: unknown }> {
    const message = await this.claimsService.addMessage(id, user.id, user.role, body.body);
    return { data: message };
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @UsePipes(new ZodPipe(resolveClaimSchema))
  async resolve(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: ResolveClaimInput,
  ): Promise<{ data: unknown }> {
    const resolved = await this.claimsService.resolveClaim(id, user.id, body);
    return { data: resolved };
  }

  @Post(':id/appeal')
  async appeal(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: unknown }> {
    const result = await this.claimsService.appealClaim(id, user.id);
    return { data: result };
  }
}
