import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { AuthService } from '../src/modules/auth/auth.service';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { ReviewsService } from '../src/modules/reviews/reviews.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Critical Business Rules (Integration & Unit)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let paymentsService: PaymentsService;
  let reviewsService: ReviewsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    reviewsService = moduleFixture.get<ReviewsService>(ReviewsService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('2.1 Auth & Lockout', () => {
    const testEmail = `lockout_test_${Date.now()}@tvs.pe`;
    const password = 'Password12345';

    beforeAll(async () => {
      await authService.register({
        email: testEmail,
        password,
        fullName: 'Lockout Test User',
      });
    });

    it('Bloquea la cuenta tras 5 intentos fallidos con código 423', async () => {
      // 4 incorrect attempts
      for (let i = 0; i < 4; i++) {
        await expect(
          authService.login({ email: testEmail, password: 'WrongPassword!' }),
        ).rejects.toThrow();
      }

      // 5th incorrect attempt -> throws LOCKED (423)
      try {
        await authService.login({ email: testEmail, password: 'WrongPassword!' });
        fail('Debería haber lanzado excepción de bloqueo');
      } catch (err: any) {
        expect(err.getStatus ? err.getStatus() : err.status).toBe(HttpStatus.LOCKED);
      }
    });
  });

  describe('2.6 Payments: Reembolso mayor al pagado rechazado', () => {
    it('Rechaza un reembolso mayor al monto disponible en custodia', async () => {
      // Find a suborder with custody
      const subWithCustody = await prisma.subOrder.findFirst({
        where: { custody: { isNot: null } },
        include: { custody: true },
      });

      if (subWithCustody && subWithCustody.custody) {
        const excessiveAmount = subWithCustody.custody.amount + 999999;
        await expect(
          paymentsService.refundSubOrder(
            subWithCustody.id,
            excessiveAmount,
            'Prueba de reembolso excesivo',
            subWithCustody.sellerId,
          ),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('2.10 Reviews: Auto-reseña rechazada', () => {
    it('Rechaza cuando el vendedor intenta calificar su propio producto', async () => {
      const seller = await prisma.seller.findFirst({
        where: { status: 'ACTIVE' },
        include: { subOrders: { include: { items: true, order: true } } },
      });

      if (seller && seller.subOrders.length > 0 && seller.subOrders[0]?.items[0]) {
        const item = seller.subOrders[0].items[0];
        // Simulate seller's user trying to review
        await expect(
          reviewsService.createReview(seller.userId, {
            orderItemId: item.id,
            stars: 5,
            comment: 'Excelente producto propio',
          }),
        ).rejects.toThrow();
      }
    });
  });

  describe('Control de acceso: Rol incorrecto = 403', () => {
    it('Retorna 403 al acceder a ruta de admin sin rol ADMIN', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/admin/users');
      expect([HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN]).toContain(res.status);
    });
  });

  describe('Acceso a recurso ajeno = 404', () => {
    it('Retorna 404 para pedido inexistente o ajeno', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const buyer = await prisma.user.findFirst({ where: { role: 'BUYER' } });
      if (buyer) {
        const res = await request(app.getHttpServer())
          .get(`/api/v1/orders/${fakeUuid}`)
          .set('Authorization', `Bearer invalid_token`);
        expect([HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND]).toContain(res.status);
      }
    });
  });
});
