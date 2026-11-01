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
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { registerSchema, RegisterInput, loginSchema, LoginInput } from './auth.dto';
import { JWT_COOKIE_NAME } from '../../common/constants';

const ONE_MINUTE_MS = 60_000;
const AUTH_ATTEMPTS_PER_MINUTE = 5;
const authLimit = { default: { limit: AUTH_ATTEMPTS_PER_MINUTE, ttl: ONE_MINUTE_MS } };
const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(authLimit)
  @Post('register')
  @UsePipes(new ZodPipe(registerSchema))
  async register(@Body() body: RegisterInput): Promise<{ data: unknown }> {
    const user = await this.authService.register(body);
    return { data: user };
  }

  @Public()
  @Throttle(authLimit)
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
      secure: IS_PRODUCTION, // in development
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: result.user };
  }

    @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() currentUser: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: { ok: boolean } }> {
    await this.authService.logout(currentUser.id);
        res.clearCookie(JWT_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PRODUCTION,
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