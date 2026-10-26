import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UsePipes,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { registerSchema, RegisterInput, loginSchema, LoginInput } from './auth.dto';
import { JWT_COOKIE_NAME } from '../../common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodPipe(registerSchema))
  async register(@Body() body: RegisterInput): Promise<{ data: unknown }> {
    const user = await this.authService.register(body);
    return { data: user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodPipe(loginSchema))
  async login(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: unknown }> {
    const result = await this.authService.login(body);
    res.cookie(JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // in development
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { data: { ok: boolean } } {
    res.clearCookie(JWT_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return { data: { ok: true } };
  }

  @Get('me')
  async me(@CurrentUser() currentUser: RequestUser): Promise<{ data: unknown }> {
    const user = await this.authService.getMe(currentUser.id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }
    return { data: user };
  }
}
