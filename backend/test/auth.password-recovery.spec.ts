// Password recovery tests for Tienda Virtual Segura
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';

describe('Auth Password Recovery (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    const { hash } = await import('@node-rs/argon2');
    await prisma.user.upsert({
      where: { email: knownUserEmail },
      update: { passwordHash: await hash('Password12345') },
      create: {
        email: knownUserEmail,
        passwordHash: await hash('Password12345'),
        fullName: 'Recovery Tester',
        role: 'BUYER',
      },
    });
    // Clean up any previous password reset rows
    await prisma.passwordReset.deleteMany({});
  });

  afterAll(async () => {
    await prisma.passwordReset.deleteMany({});
    await app.close();
  });

  const knownUserEmail = 'recovery_test@tvs.pe';
  const unknownUserEmail = 'noexiste@tvs.pe';

  it('/auth/forgot-password (POST) with known email creates reset row and returns ok', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: knownUserEmail })
      .expect(200);
    expect(response.body).toEqual({ data: { ok: true } });
    const userRecord = await prisma.user.findUnique({ where: { email: knownUserEmail } });
    expect(userRecord).not.toBeNull();
    const resetRow = await prisma.passwordReset.findFirst({ where: { userId: userRecord!.id } });
    expect(resetRow).toBeDefined();
  });

  it('/auth/forgot-password (POST) with unknown email throws error or creates no row', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: unknownUserEmail })
      .expect(400);
    const unknownUser = await prisma.user.findUnique({ where: { email: unknownUserEmail } });
    const resetRowUnknown = unknownUser ? await prisma.passwordReset.findFirst({ where: { userId: unknownUser.id } }) : null;
    expect(resetRowUnknown).toBeNull();
  });

  it('/auth/reset-password (POST) with valid token updates password and revokes sessions', async () => {
    // First, generate reset token via service directly
    const token = await authService.generatePasswordResetToken(knownUserEmail);
    // Call endpoint
    const newPassword = 'NewPassword123!';
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token, newPassword })
      .expect(200);
    expect(response.body).toEqual({ data: { ok: true } });
    // Verify password is changed
    const user = await prisma.user.findUnique({ where: { email: knownUserEmail } });
    expect(user).not.toBeNull();
    const isMatch = await authService.comparePassword(newPassword, user!.passwordHash);
    expect(isMatch).toBeTruthy();
    // Verify password reset rows deleted for this user
    const rows = await prisma.passwordReset.findMany({ where: { userId: user!.id } });
    expect(rows.length).toBe(0);
  });

  it('/auth/reset-password (POST) with invalid token throws BadRequestException', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalid-token', newPassword: 'Whatever123' })
      .expect(400);
  });

  it('/auth/me (GET) returns 401 when unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(401);
  });

  it('/auth/me (GET) returns user data with role when authenticated', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: knownUserEmail, password: 'NewPassword123!' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie']!;
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(meRes.body.data).toHaveProperty('id');
    expect(meRes.body.data.email).toBe(knownUserEmail);
    expect(meRes.body.data).toHaveProperty('role');
  });

  it('/auth/change-password (POST) returns 401 when unauthenticated', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .send({ currentPassword: 'NewPassword123!', newPassword: 'UpdatedPassword123!' })
      .expect(401);
  });

  it('/auth/change-password (POST) validates same password rejection and accepts valid change', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: knownUserEmail, password: 'NewPassword123!' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie']!;

    // Cannot change to same password
    await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:5173')
      .send({ currentPassword: 'NewPassword123!', newPassword: 'NewPassword123!' })
      .expect(400);

    // Incorrect current password
    await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:5173')
      .send({ currentPassword: 'WrongPassword123!', newPassword: 'UpdatedPassword123!' })
      .expect(400);

    // Wait 1 second so that JWT iat (second-precision) is strictly before tokensValidAfter
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Valid change password
    const changeRes = await request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:5173')
      .send({ currentPassword: 'NewPassword123!', newPassword: 'UpdatedPassword123!' })
      .expect(200);

    expect(changeRes.body).toEqual({ data: { ok: true } });

    // Verify old session cookie is now revoked due to tokensValidAfter
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(401);

    // Verify login with new password works
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: knownUserEmail, password: 'UpdatedPassword123!' })
      .expect(200);
  });
});
