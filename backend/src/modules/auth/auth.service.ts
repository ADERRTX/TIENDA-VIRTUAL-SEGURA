import { Injectable, UnauthorizedException, ConflictException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from '@node-rs/argon2';
import { AuthRepository } from './auth.repository';
import { AuditService } from '../../audit/audit.service';
import { ClockService } from '../../common/clock.service';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterInput, LoginInput } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly clock: ClockService,
    private readonly prisma: PrismaService,
  ) {}

  async register(input: RegisterInput): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const existing = await this.authRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictException({ code: 'USER_EXISTS', message: 'El correo electrónico ya está registrado' });
    }
    const passwordHash = await hash(input.password);
    const user = await this.authRepo.create({ email: input.email, passwordHash, fullName: input.fullName });
    await this.auditService.log({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entity: 'user',
      entityId: user.id,
      payload: { email: user.email },
    });
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }

  async login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; fullName: string; role: string } }> {
    const user = await this.authRepo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' });
    }
    const now = this.clock.now();
    if (user.lockedUntil && user.lockedUntil > now) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / (60 * 1000));
      throw new HttpException({ code: 'ACCOUNT_LOCKED', message: `Cuenta bloqueada temporalmente. Intente nuevamente en ${minutesRemaining} minutos.` }, HttpStatus.LOCKED);
    }
    const passwordValid = await verify(user.passwordHash, input.password);
    if (!passwordValid) {
      const newFailed = user.failedLogins + 1;
      let lockDate: Date | null = null;
      if (newFailed >= 5) lockDate = this.clock.addMinutes(now, 15);
      await this.authRepo.recordFailedLogin(user.id, newFailed, lockDate);
      await this.auditService.log({
        actorId: user.id,
        action: newFailed >= 5 ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        entity: 'user',
        entityId: user.id,
        payload: { failedCount: newFailed },
      });
      if (newFailed >= 5) {
        throw new HttpException({ code: 'ACCOUNT_LOCKED', message: 'Cuenta bloqueada temporalmente por 15 minutos debido a múltiples intentos fallidos.' }, HttpStatus.LOCKED);
      }
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' });
    }
    if (user.failedLogins > 0 || user.lockedUntil) await this.authRepo.resetFailedLogins(user.id);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    await this.auditService.log({ actorId: user.id, action: 'LOGIN_SUCCESS', entity: 'user', entityId: user.id });
    return { token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } };
  }

  async forgotPassword(email: string): Promise<void> {
    const token = await this.generatePasswordResetToken(email);
    const user = await this.authRepo.findByEmail(email);
    await this.auditService.log({
      actorId: null,
      action: 'FORGOT_PASSWORD_REQUEST',
      entity: 'user',
      entityId: user?.id ?? '',
      payload: { email, token },
      ip: '',
      userAgent: '',
    });
  }

  async logout(userId: string): Promise<void> {
    await this.authRepo.revokeTokens(userId, this.clock.now());
    await this.auditService.log({ actorId: userId, action: 'LOGOUT', entity: 'user', entityId: userId });
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      await this.auditService.log({ actorId: null, action: 'FORGOT_PASSWORD_REQUEST', entity: 'user', entityId: '', payload: { email }, ip: '', userAgent: '' });
      throw new BadRequestException({ code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
    }
    const tokenPlain = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(tokenPlain).digest('hex');
    const expiresAt = this.clock.addMinutes(this.clock.now(), 15);
    await this.prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } });
    return tokenPlain;
  }

  async comparePassword(plain: string, hashValue: string): Promise<boolean> {
    return verify(hashValue, plain);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await this.prisma.passwordReset.findFirst({ where: { tokenHash } });
    if (!reset) throw new BadRequestException({ code: 'INVALID_TOKEN', message: 'Token inválido o expirado' });
    if (reset.expiresAt < this.clock.now()) {
      await this.prisma.passwordReset.delete({ where: { id: reset.id } });
      throw new BadRequestException({ code: 'TOKEN_EXPIRED', message: 'El token ha expirado' });
    }
    const passwordHash = await hash(newPassword);
    const now = this.clock.now();
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash, tokensValidAfter: now, failedLogins: 0, lockedUntil: null },
    });
    await this.prisma.passwordReset.deleteMany({ where: { userId: reset.userId } });
    await this.auditService.log({
      actorId: reset.userId,
      action: 'PASSWORD_RESET',
      entity: 'user',
      entityId: reset.userId,
      ip: '',
      userAgent: '',
    });
  }

  async getMe(userId: string): Promise<Record<string, unknown> | null> {
    const user = await this.authRepo.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      seller: (user as any)['seller'] || null,
      createdAt: user.createdAt,
    };
  }
}
