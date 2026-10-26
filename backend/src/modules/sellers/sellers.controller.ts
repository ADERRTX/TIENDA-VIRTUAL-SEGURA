import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UsePipes,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import {
  applySellerSchema,
  ApplySellerInput,
  updateSellerMeSchema,
  UpdateSellerMeInput,
} from './sellers.dto';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('apply')
  @UsePipes(new ZodPipe(applySellerSchema))
  async apply(
    @CurrentUser() user: RequestUser,
    @Body() body: ApplySellerInput,
  ): Promise<{ data: unknown }> {
    const seller = await this.sellersService.apply(user.id, body);
    return { data: seller };
  }

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser): Promise<{ data: unknown }> {
    const seller = await this.sellersService.getMe(user.id);
    return { data: seller };
  }

  @Patch('me')
  @UsePipes(new ZodPipe(updateSellerMeSchema))
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateSellerMeInput,
  ): Promise<{ data: unknown }> {
    const seller = await this.sellersService.updateMe(user.id, body);
    return { data: seller };
  }
}
