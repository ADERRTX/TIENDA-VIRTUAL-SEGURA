import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { seedTestDatabase, testPrisma } from './test-db-setup';
import { Public } from '../src/common/decorators/public.decorator';
import { JWT_COOKIE_NAME } from '../src/common/constants';

describe('FASE 5: Auth & Security Suite (Isolated DB)', () => {
  let app: INestApplication;
  const ORIGIN = 'http://localhost:5173';

  beforeAll(async () => {
    await seedTestDatabase();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await testPrisma.$disconnect();
  });

  describe('1. Registro y Autenticación', () => {
    const uniqueEmail = `reg_test_${Date.now()}@tvs.pe`;

    it('POST /auth/register - Registra nuevo comprador con Argon2id', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: uniqueEmail,
          password: 'Password12345!',
          fullName: 'Usuario Registro Test',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(uniqueEmail);
      expect(res.body.data.role).toBe('BUYER');

      // Verifica en BD que passwordHash use Argon2id ($argon2id$)
      const userInDb = await testPrisma.user.findUnique({ where: { email: uniqueEmail } });
      expect(userInDb?.passwordHash).toMatch(/^\$argon2id\$/);
    });

    it('POST /auth/login - Login exitoso devuelve cookie httpOnly y datos de usuario', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({
          email: uniqueEmail,
          password: 'Password12345!',
        })
        .expect(200);

      expect(res.body.data.email).toBe(uniqueEmail);
      const cookies = res.headers['set-cookie'] as string[] | undefined;
      expect(cookies).toBeDefined();
      expect(cookies?.some((c) => c.includes(JWT_COOKIE_NAME))).toBe(true);
    });

    it('Bloqueo tras 5 intentos fallidos (423 Locked)', async () => {
      const lockEmail = `lock_test_${Date.now()}@tvs.pe`;
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: lockEmail,
          password: 'Password12345!',
          fullName: 'Lockout Test',
        })
        .expect(201);

      // 4 intentos fallidos
      for (let i = 0; i < 4; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .set('Origin', ORIGIN)
          .send({ email: lockEmail, password: 'WrongPassword!' })
          .expect(401);
      }

      // 5to intento fallido activa bloqueo temporal
      const fifthRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: lockEmail, password: 'WrongPassword!' });

      expect(fifthRes.status).toBe(423);
      expect(fifthRes.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('Usuario con status BLOCKED no puede iniciar sesión ni acceder (401 USER_BLOCKED)', async () => {
      const blockedEmail = `blocked_test_${Date.now()}@tvs.pe`;
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: blockedEmail,
          password: 'Password12345!',
          fullName: 'Blocked User Test',
        })
        .expect(201);

      // Bloquear usuario en BD
      await testPrisma.user.update({
        where: { email: blockedEmail },
        data: { status: 'BLOCKED' },
      });

      // Intento de login rechazado de inmediato
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: blockedEmail, password: 'Password12345!' })
        .expect(401);

      expect(loginRes.body.error.code).toBe('USER_BLOCKED');
    });
  });

  describe('2. Seguridad de Sesión, CSRF y Revocación', () => {
    const sessionEmail = `session_test_${Date.now()}@tvs.pe`;
    let userCookie: string;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: sessionEmail,
          password: 'Password12345!',
          fullName: 'Session User',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: sessionEmail, password: 'Password12345!' })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      userCookie = cookies[0]!;
    });

    it('CSRF: Rechaza petición mutante (POST) con cookie sin cabecera Origin (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', userCookie)
        // Sin Origin
        .expect(403);

      expect(res.body.error.code).toBe('CSRF_INVALID_ORIGIN');
    });

    it('CSRF: Rechaza petición mutante con Origin malicioso (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', userCookie)
        .set('Origin', 'http://malicious-site.com')
        .expect(403);

      expect(res.body.error.code).toBe('CSRF_INVALID_ORIGIN');
    });

    it('Token manipulado o con firma inválida es rechazado (401)', async () => {
      const fakeCookie = `${JWT_COOKIE_NAME}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature`;
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', fakeCookie)
        .expect(401);
    });

    it('POST /auth/change-password - Valida complejidad, rechaza contraseña idéntica y revoca sesiones previas', async () => {
      // 1. Contraseña menor a 12 caracteres -> rechazada por Zod
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Cookie', userCookie)
        .set('Origin', ORIGIN)
        .send({
          currentPassword: 'Password12345!',
          newPassword: 'Short1!',
        })
        .expect(400);

      // 2. Contraseña idéntica a la actual -> rechazada por ZodPipe (400 VALIDATION_ERROR)
      const sameRes = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Cookie', userCookie)
        .set('Origin', ORIGIN)
        .send({
          currentPassword: 'Password12345!',
          newPassword: 'Password12345!',
        })
        .expect(400);

      expect(sameRes.body.error.code).toBe('VALIDATION_ERROR');

      // Esperar 1.1s para asegurar timestamp strictly greater en tokensValidAfter vs iat
      await new Promise((r) => setTimeout(r, 1100));

      // 3. Cambio exitoso
      const changeRes = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Cookie', userCookie)
        .set('Origin', ORIGIN)
        .send({
          currentPassword: 'Password12345!',
          newPassword: 'NewPassword12345!',
        })
        .expect(200);

      expect(changeRes.body.data.ok).toBe(true);

      // 4. La sesión anterior (userCookie) ahora debe estar revocada (401)
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', userCookie)
        .expect(401);

      // 5. La cookie nueva emitida en change-password sí debe ser válida
      const newCookies = changeRes.headers['set-cookie'] as unknown as string[];
      expect(newCookies).toBeDefined();
      const newCookie = newCookies[0]!;

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', newCookie)
        .expect(200);

      expect(meRes.body.data.email).toBe(sessionEmail);
    });

    it('POST /auth/logout - Revoca la sesión y limpia la cookie', async () => {
      // Login con nueva contraseña
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: sessionEmail, password: 'NewPassword12345!' })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const activeCookie = cookies[0]!;

      // Esperar 1.1s para granularidad de iat
      await new Promise((r) => setTimeout(r, 1100));

      // Logout
      const logoutRes = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', activeCookie)
        .set('Origin', ORIGIN)
        .expect(200);

      expect(logoutRes.body.data.ok).toBe(true);

      // El token antiguo queda revocado
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', activeCookie)
        .expect(401);
    });
  });

  describe('3. Recuperación de Contraseña', () => {
    const recoveryEmail = `recovery_test_${Date.now()}@tvs.pe`;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: recoveryEmail,
          password: 'Password12345!',
          fullName: 'Recovery User',
        })
        .expect(201);
    });

    it('Flujo completo de forgot-password y reset-password', async () => {
      // 1. forgot-password no revela si el correo existe
      const forgotRes = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .set('Origin', ORIGIN)
        .send({ email: recoveryEmail })
        .expect(200);

      expect(forgotRes.body.data.ok).toBe(true);

      // 2. Extraer token de reset desde la BD (tabla PasswordReset)
      const resetRecord = await testPrisma.passwordReset.findFirst({
        where: { user: { email: recoveryEmail } },
        orderBy: { createdAt: 'desc' },
      });
      expect(resetRecord).toBeDefined();

      // El token en BD está hasheado con SHA-256 (64 hex chars)
      expect(resetRecord?.tokenHash).toHaveLength(64);

      // 3. Simular reset usando el token generado en el test
      // Para probar reset-password con token válido, usamos el AuthService directamente
      const authService = app.get(require('../src/modules/auth/auth.service').AuthService);
      const rawToken = await authService.generatePasswordResetToken(recoveryEmail);

      const resetRes = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .set('Origin', ORIGIN)
        .send({
          token: rawToken,
          newPassword: 'BrandNewPassword123!',
        })
        .expect(200);

      expect(resetRes.body.data.ok).toBe(true);

      // 4. Re-uso del mismo token debe ser rechazado (400 o 404)
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .set('Origin', ORIGIN)
        .send({
          token: rawToken,
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);

      // 5. Login con la nueva contraseña funciona
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email: recoveryEmail, password: 'BrandNewPassword123!' })
        .expect(200);
    });
  });

  describe('4. ZodPipe Validation', () => {
    it('Rechaza payload con campos requeridos faltantes o tipos incorrectos (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Origin', ORIGIN)
        .send({
          email: 'not-an-email',
          password: '123', // Muy corta
        })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('5. Throttling Security (Rate Limiting)', () => {
    let throttledApp: INestApplication;

    beforeAll(async () => {
      const { Controller, Get } = await import('@nestjs/common');
      const { Throttle } = await import('@nestjs/throttler');

      @Controller('throttle-check')
      class ThrottleCheckController {
        @Public()
        @Throttle({ default: { limit: 2, ttl: 60000 } })
        @Get()
        check() {
          return { ok: true };
        }
      }

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        controllers: [ThrottleCheckController],
      }).compile();

      throttledApp = moduleRef.createNestApplication();
      throttledApp.setGlobalPrefix('api/v1');
      throttledApp.useGlobalFilters(new AllExceptionsFilter());
      await throttledApp.init();
    });

    afterAll(async () => {
      await throttledApp.close();
    });

    it('Bloquea con 429 Too Many Requests tras superar el límite establecido', async () => {
      // Peticiones 1 y 2 permitidas
      await request(throttledApp.getHttpServer()).get('/api/v1/throttle-check').expect(200);
      await request(throttledApp.getHttpServer()).get('/api/v1/throttle-check').expect(200);

      // 3ra petición supera el límite de 2 por minuto
      const third = await request(throttledApp.getHttpServer()).get('/api/v1/throttle-check');
      expect(third.status).toBe(429);
    });
  });
});
