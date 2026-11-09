import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { seedTestDatabase, testPrisma } from './test-db-setup';
import { UserRole, SellerStatus } from '../src/common/constants';

describe('FASE 5: Authorization Matrix & IDOR Suite (Isolated DB)', () => {
  let app: INestApplication;
  const ORIGIN = 'http://localhost:5173';

  let buyer1Cookie: string;
  let buyer2Cookie: string;
  let seller1Cookie: string;
  let seller2Cookie: string;
  let supportCookie: string;
  let adminCookie: string;

  let seeded: Awaited<ReturnType<typeof seedTestDatabase>>;

  beforeAll(async () => {
    seeded = await seedTestDatabase();

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

    // Helper login
    const getCookie = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', ORIGIN)
        .send({ email, password: 'Password12345' });
      return (res.headers['set-cookie'] as unknown as string[])[0]!;
    };

    buyer1Cookie = await getCookie(seeded.buyer1.email);
    buyer2Cookie = await getCookie(seeded.buyer2.email);
    seller1Cookie = await getCookie(seeded.seller1User.email);
    supportCookie = await getCookie(seeded.support.email);
    adminCookie = await getCookie(seeded.admin.email);

    // Crear un segundo vendedor para pruebas de IDOR entre vendedores
    const { hash } = await import('@node-rs/argon2');
    const seller2User = await testPrisma.user.upsert({
      where: { email: 'vendedor2_test@tvs.pe' },
      update: {},
      create: {
        email: 'vendedor2_test@tvs.pe',
        passwordHash: await hash('Password12345'),
        fullName: 'Vendedor Dos Test',
        role: UserRole.SELLER,
      },
    });
    await testPrisma.seller.upsert({
      where: { storeName: 'Tienda Dos Test' },
      update: {},
      create: {
        userId: seller2User.id,
        storeName: 'Tienda Dos Test',
        description: 'Segunda tienda para pruebas',
        status: SellerStatus.ACTIVE,
      },
    });
    seller2Cookie = await getCookie('vendedor2_test@tvs.pe');
  });

  afterAll(async () => {
    await app.close();
    await testPrisma.$disconnect();
  });

  describe('1. Matriz de Autorización por Roles (RBAC)', () => {
    it('Anónimo: rutas públicas responden 200, rutas protegidas devuelven 401', async () => {
      // Públicas
      await request(app.getHttpServer()).get('/api/v1/health').expect(200);
      await request(app.getHttpServer()).get('/api/v1/categories').expect(200);
      await request(app.getHttpServer()).get('/api/v1/products').expect(200);

      // Protegidas
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
      await request(app.getHttpServer()).get('/api/v1/cart').expect(401);
      await request(app.getHttpServer()).get('/api/v1/orders').expect(401);
      await request(app.getHttpServer()).get('/api/v1/seller/orders').expect(401);
      await request(app.getHttpServer()).get('/api/v1/admin/users').expect(401);
    });

    it('BUYER: accede a carrito y pedidos (200), pero recibe 403 en seller, shipments y admin', async () => {
      await request(app.getHttpServer()).get('/api/v1/cart').set('Cookie', buyer1Cookie).expect(200);
      await request(app.getHttpServer()).get('/api/v1/orders').set('Cookie', buyer1Cookie).expect(200);

      await request(app.getHttpServer()).get('/api/v1/seller/orders').set('Cookie', buyer1Cookie).expect(403);
      await request(app.getHttpServer()).get('/api/v1/seller/products').set('Cookie', buyer1Cookie).expect(403);
      await request(app.getHttpServer()).get('/api/v1/shipments').set('Cookie', buyer1Cookie).expect(403);
      await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', buyer1Cookie).expect(403);
    });

    it('SELLER: accede a catálogo y pedidos de vendedor (200), pero recibe 403 en shipments y admin', async () => {
      await request(app.getHttpServer()).get('/api/v1/seller/orders').set('Cookie', seller1Cookie).expect(200);
      await request(app.getHttpServer()).get('/api/v1/seller/products').set('Cookie', seller1Cookie).expect(200);

      await request(app.getHttpServer()).get('/api/v1/shipments').set('Cookie', seller1Cookie).expect(403);
      await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', seller1Cookie).expect(403);
    });

    it('SUPPORT: accede a envíos (200), pero no puede acceder a administración de usuarios ni a seller (403)', async () => {
      await request(app.getHttpServer()).get('/api/v1/shipments').set('Cookie', supportCookie).expect(200);

      await request(app.getHttpServer()).get('/api/v1/seller/orders').set('Cookie', supportCookie).expect(403);
      await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', supportCookie).expect(403);
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${seeded.buyer1.id}/block`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({ reason: 'Intento de bloqueo por soporte' })
        .expect(403);
    });

    it('ADMIN: tiene acceso a endpoints administrativos y de supervisión de envíos (200)', async () => {
      await request(app.getHttpServer()).get('/api/v1/admin/users').set('Cookie', adminCookie).expect(200);
      await request(app.getHttpServer()).get('/api/v1/admin/sellers').set('Cookie', adminCookie).expect(200);
      await request(app.getHttpServer()).get('/api/v1/shipments').set('Cookie', adminCookie).expect(200);
    });
  });

  describe('2. Auditoría IDOR / BOLA (Inseguridad de Referencia Directa a Objetos)', () => {
    let buyer1AddressId: string;

    beforeAll(async () => {
      // Crear dirección para Comprador 1
      const addrRes = await request(app.getHttpServer())
        .post('/api/v1/users/addresses')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          label: 'Casa Comprador 1',
          line1: 'Av. Las Palmeras 123',
          city: 'Lima',
          province: 'Lima',
        })
        .expect(201);
      buyer1AddressId = addrRes.body.data.id;
    });

    it('IDOR Direcciones: Comprador 2 no puede modificar ni borrar dirección de Comprador 1 (404)', async () => {
      // Actualizar dirección ajena
      await request(app.getHttpServer())
        .patch(`/api/v1/users/addresses/${buyer1AddressId}`)
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .send({ label: 'Hackeado por Comprador 2' })
        .expect(404);

      // Eliminar dirección ajena
      await request(app.getHttpServer())
        .delete(`/api/v1/users/addresses/${buyer1AddressId}`)
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .expect(404);
    });

    it('IDOR Notificaciones: Comprador 2 no puede marcar como leída notificación de Comprador 1 (404)', async () => {
      const notif = await testPrisma.notification.create({
        data: {
          userId: seeded.buyer1.id,
          type: 'ORDER',
          message: 'Notificación confidencial de Comprador 1',
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${notif.id}/read`)
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .expect(404);
    });

    it('IDOR Pedidos: Comprador 2 no puede ver ni cancelar pedidos de Comprador 1 (404)', async () => {
      // 1. Comprador 1 agrega producto al carrito y crea orden
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: seeded.variant1.id, quantity: 1 })
        .expect(201);

      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .set('Idempotency-Key', crypto.randomUUID())
        .send({ addressId: buyer1AddressId })
        .expect(201);

      const orderId = orderRes.body.data.id;
      const subOrderId = orderRes.body.data.subOrders[0].id;

      // 2. Comprador 2 intenta ver el detalle de la orden de Comprador 1
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Cookie', buyer2Cookie)
        .expect(404);

      // 3. Comprador 2 intenta cancelar el subpedido de Comprador 1
      await request(app.getHttpServer())
        .post(`/api/v1/orders/${subOrderId}/cancel`)
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .expect(404);

      // 4. Comprador 2 intenta consultar el pago del pedido de Comprador 1
      await request(app.getHttpServer())
        .get(`/api/v1/payments/${orderId}`)
        .set('Cookie', buyer2Cookie)
        .expect(404);
    });

    it('IDOR Catálogo de Vendedor: Vendedor 2 no puede ver ni modificar productos de Vendedor 1 vía /seller/products/:id (404)', async () => {
      // Vendedor 2 intenta consultar el producto de Vendedor 1 en su panel privado
      await request(app.getHttpServer())
        .get(`/api/v1/seller/products/${seeded.product1.id}`)
        .set('Cookie', seller2Cookie)
        .expect(404);

      // Vendedor 2 intenta modificar el producto de Vendedor 1
      await request(app.getHttpServer())
        .patch(`/api/v1/seller/products/${seeded.product1.id}`)
        .set('Cookie', seller2Cookie)
        .set('Origin', ORIGIN)
        .send({ title: 'Título alterado por Vendedor 2' })
        .expect(404);

      // Vendedor 2 intenta crear variante en producto de Vendedor 1
      await request(app.getHttpServer())
        .post(`/api/v1/seller/products/${seeded.product1.id}/variants`)
        .set('Cookie', seller2Cookie)
        .set('Origin', ORIGIN)
        .send({ name: 'Variante maliciosa', price: 1000, stock: 10 })
        .expect(404);
    });
  });
});
