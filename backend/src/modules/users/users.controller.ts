import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import {
  updateProfileSchema,
  UpdateProfileInput,
  addressSchema,
  AddressInput,
  updateAddressSchema,
  UpdateAddressInput,
} from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: RequestUser): Promise<{ data: unknown }> {
    const profile = await this.usersService.getProfile(user.id);
    return { data: profile };
  }

  @Patch('profile')
  @UsePipes(new ZodPipe(updateProfileSchema))
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateProfileInput,
  ): Promise<{ data: unknown }> {
    const updated = await this.usersService.updateProfile(user.id, body);
    return { data: updated };
  }

  @Get('addresses')
  async getAddresses(@CurrentUser() user: RequestUser): Promise<{ data: unknown }> {
    const addresses = await this.usersService.getAddresses(user.id);
    return { data: addresses };
  }

  @Post('addresses')
  @UsePipes(new ZodPipe(addressSchema))
  async createAddress(
    @CurrentUser() user: RequestUser,
    @Body() body: AddressInput,
  ): Promise<{ data: unknown }> {
    const address = await this.usersService.createAddress(user.id, body);
    return { data: address };
  }

  @Patch('addresses/:id')
  @UsePipes(new ZodPipe(updateAddressSchema))
  async updateAddress(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: UpdateAddressInput,
  ): Promise<{ data: unknown }> {
    const address = await this.usersService.updateAddress(id, user.id, body);
    return { data: address };
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<{ data: { ok: boolean } }> {
    await this.usersService.deleteAddress(id, user.id);
    return { data: { ok: true } };
  }
}
