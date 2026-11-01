import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

const MIN_SECRET_LENGTH = 32;

function readJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET') ?? config.get<string>('SESSION_SECRET');
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `Falta JWT_SECRET o SESSION_SECRET en .env, o tiene menos de ${MIN_SECRET_LENGTH} caracteres.`,
    );
  }
  return secret;
}

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: readJwtSecret(config),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, AuthRepository, JwtModule],
})
export class AuthModule {}