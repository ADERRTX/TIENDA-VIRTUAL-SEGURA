import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';
import { seedTestDatabase, testPrisma } from './test-db-setup';
import {
  SubOrderStatus,
  CustodyStatus,
  ClaimResolution,
  ClaimStatus,
} from '../src/common/constants';

describe('FASE 5: Full Flow, Claims, Concurrency & Uploads Suite (Isolated DB)', () => {
  let app: INestApplication;
  const ORIGIN = 'http://localhost:5173';

  let buyer1Cookie: string;
  let buyer2Cookie: string;
  let seller1Cookie: string;
  let supportCookie: string;

  let seeded: Awaited<ReturnType<typeof seedTestDatabase>>;
  let buyer1AddressId: string;

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

    // Dirección para comprador 1
    const addr = await request(app.getHttpServer())
      .post('/api/v1/users/addresses')
      .set('Cookie', buyer1Cookie)
      .set('Origin', ORIGIN)
      .send({
        label: 'Casa Principal',
        line1: 'Calle Los Negocios 456',
        city: 'Lima',
        province: 'Lima',
      })
      .expect(201);
    buyer1AddressId = addr.body.data.id;
  });

  afterAll(async () => {
    await app.close();
    await testPrisma.$disconnect();
  });

  describe('1. Flujo Completo de Pedido, Pago, Despacho, Entrega y Reseña', () => {
    let orderId: string;
    let subOrderId: string;
    let orderItemId: string;

    it('A. Comprador crea pedido con Idempotency-Key', async () => {
      // 1. Limpiar carrito y agregar producto
      await testPrisma.cartItem.deleteMany({ where: { cart: { userId: seeded.buyer1.id } } });
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: seeded.variant1.id, quantity: 2 })
        .expect(201);

      // 2. Crear pedido
      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .set('Idempotency-Key', crypto.randomUUID())
        .send({ addressId: buyer1AddressId })
        .expect(201);

      orderId = orderRes.body.data.id;
      subOrderId = orderRes.body.data.subOrders[0].id;
      orderItemId = orderRes.body.data.subOrders[0].items[0].id;

      expect(orderId).toBeDefined();
      expect(subOrderId).toBeDefined();
    });

    it('B. Pago rechazado con tok_fail', async () => {
      const failRes = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          orderId,
          token: 'tok_fail',
          method: 'CARD',
        })
        .expect(201);

      expect(failRes.body.data.status).toBe('RECHAZADO');
    });

    it('C. Pago aprobado con tok_ok (genera custodia RETENIDO)', async () => {
      const payRes = await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          orderId,
          token: 'tok_ok',
          method: 'CARD',
        })
        .expect(201);

      expect(payRes.body.data.status).toBe('APROBADO');

      // Verificar en BD que la custodia del sub-pedido esté RETENIDO
      const custody = await testPrisma.custody.findUnique({ where: { subOrderId } });
      expect(custody?.status).toBe(CustodyStatus.RETENIDO);
      expect(custody?.amount).toBe(payRes.body.data.amount);
    });

    it('D. Vendedor confirma, prepara y despacha el sub-pedido', async () => {
      // 1. Confirmar
      const confRes = await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${subOrderId}/confirm`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .expect(201);
      expect(confRes.body.data.status).toBe(SubOrderStatus.CONFIRMADO);

      // 2. Preparar
      const prepRes = await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${subOrderId}/prepare`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .expect(201);
      expect(prepRes.body.data.status).toBe(SubOrderStatus.EN_PREPARACION);

      // 3. Despachar
      const dispRes = await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${subOrderId}/dispatch`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .send({
          carrier: 'Olva Courier',
          trackingCode: 'TRACK-' + crypto.randomUUID(),
          estimatedDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        })
        .expect(201);
      expect(dispRes.body.data.status).toBe(SubOrderStatus.DESPACHADO);
    });

    it('E. Registro de eventos de tracking hasta ENTREGADO', async () => {
      // 1. EN_TRANSITO
      await request(app.getHttpServer())
        .post(`/api/v1/shipments/${subOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({
          type: 'EN_TRANSITO',
          description: 'Paquete en tránsito hacia centro de distribución',
        })
        .expect(201);

      // 2. EN_REPARTO
      await request(app.getHttpServer())
        .post(`/api/v1/shipments/${subOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({
          type: 'EN_REPARTO',
          description: 'En camino con el repartidor local',
        })
        .expect(201);

      // 3. ENTREGADO
      const entRes = await request(app.getHttpServer())
        .post(`/api/v1/shipments/${subOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({
          type: 'ENTREGADO',
          description: 'Entregado al comprador con firma',
        })
        .expect(201);

      expect(entRes.body.data.status).toBe(SubOrderStatus.ENTREGADO);
    });

    it('F. Comprador califica el producto en estado ENTREGADO', async () => {
      const reviewRes = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          orderItemId,
          stars: 5,
          comment: 'Producto excelente y entrega rápida',
        })
        .expect(201);

      expect(reviewRes.body.data.stars).toBe(5);

      // Re-calificar el mismo artículo falla (409 REVIEW_ALREADY_EXISTS)
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          orderItemId,
          stars: 4,
          comment: 'Segunda calificación duplicada',
        })
        .expect(409);
    });
  });

  describe('2. Ciclo de Vida de Reclamos y Apelaciones', () => {
    let claimSubOrderId: string;
    let claimId: string;

    beforeAll(async () => {
      // Crear un sub-pedido que llegue a ENTREGADO para probar reclamos
      await testPrisma.cartItem.deleteMany({ where: { cart: { userId: seeded.buyer1.id } } });
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: seeded.variant1.id, quantity: 1 });

      const ord = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .set('Idempotency-Key', crypto.randomUUID())
        .send({ addressId: buyer1AddressId });

      claimSubOrderId = ord.body.data.subOrders[0].id;

      await request(app.getHttpServer())
        .post('/api/v1/payments')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ orderId: ord.body.data.id, token: 'tok_ok', method: 'CARD' });

      await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${claimSubOrderId}/confirm`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${claimSubOrderId}/prepare`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/seller/orders/${claimSubOrderId}/dispatch`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .send({
          carrier: 'Olva',
          trackingCode: 'TRK-CLAIM-' + crypto.randomUUID(),
          estimatedDate: new Date().toISOString(),
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/shipments/${claimSubOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({ type: 'EN_TRANSITO', description: 'En tránsito' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/shipments/${claimSubOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({ type: 'EN_REPARTO', description: 'En reparto' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/shipments/${claimSubOrderId}/events`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({ type: 'ENTREGADO', description: 'Entregado' })
        .expect(201);
    });

    it('A. Abrir reclamo congela la custodia en BD', async () => {
      const claimRes = await request(app.getHttpServer())
        .post('/api/v1/claims')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({
          subOrderId: claimSubOrderId,
          reason: 'DEFECTIVE_PRODUCT: El producto no enciende',
          evidence: ['El producto no enciende y vino con empaque roto'],
        })
        .expect(201);

      claimId = claimRes.body.data.id;
      expect(claimId).toBeDefined();

      // Verificar que la custodia pasó a CONGELADO
      const custody = await testPrisma.custody.findUnique({ where: { subOrderId: claimSubOrderId } });
      expect(custody?.status).toBe(CustodyStatus.CONGELADO);

      // Verificar que el sub-pedido pasó a RECLAMADO
      const sub = await testPrisma.subOrder.findUnique({ where: { id: claimSubOrderId } });
      expect(sub?.status).toBe(SubOrderStatus.RECLAMADO);
    });

    it('B. Mensajes en el reclamo entre comprador, vendedor y soporte', async () => {
      // Vendedor responde
      const msg1 = await request(app.getHttpServer())
        .post(`/api/v1/claims/${claimId}/messages`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .send({ body: 'Por favor envíame una foto del número de serie' })
        .expect(201);
      expect(msg1.body.data.body).toContain('número de serie');

      // Comprador responde
      const msg2 = await request(app.getHttpServer())
        .post(`/api/v1/claims/${claimId}/messages`)
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ body: 'Número de serie SN-99887766' })
        .expect(201);
      expect(msg2.body.data.body).toContain('SN-99887766');
    });

    it('C. Soporte resuelve el reclamo con REEMBOLSO (congelación -> devuelto)', async () => {
      const resRes = await request(app.getHttpServer())
        .post(`/api/v1/claims/${claimId}/resolve`)
        .set('Cookie', supportCookie)
        .set('Origin', ORIGIN)
        .send({
          resolution: ClaimResolution.REEMBOLSO,
          notes: 'Fallo comprobado de fábrica. Se dictamina reembolso total.',
        })
        .expect(201);

      expect(resRes.body.data.resolution).toBe(ClaimResolution.REEMBOLSO);

      // Custodia pasa a DEVUELTO y se genera un registro de refund
      const custody = await testPrisma.custody.findUnique({ where: { subOrderId: claimSubOrderId } });
      expect(custody?.status).toBe(CustodyStatus.DEVUELTO);

      const refund = await testPrisma.refund.findFirst({ where: { subOrderId: claimSubOrderId } });
      expect(refund?.status).toBe('APROBADO');
      expect(refund?.amount).toBe(custody?.amount);
    });

    it('D. Apelación: se puede apelar una sola vez; el segundo intento falla (409)', async () => {
      // Primera apelación por parte del vendedor
      const appRes = await request(app.getHttpServer())
        .post(`/api/v1/claims/${claimId}/appeal`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .expect(201);

      expect(appRes.body.data.status).toBe(ClaimStatus.APELADO);

      // Segunda apelación por la misma parte debe ser rechazada
      const secondAppeal = await request(app.getHttpServer())
        .post(`/api/v1/claims/${claimId}/appeal`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN);

      expect(secondAppeal.status).toBe(409);
    });
  });

  describe('3. Concurrencia y Control de Carrera', () => {
    it('Último Stock: Dos compras simultáneas de la última unidad (stock 1) -> exactamente una triunfa', async () => {
      // 1. Crear una variante con stock = 1
      const limitedVariant = await testPrisma.variant.create({
        data: {
          productId: seeded.product1.id,
          name: 'Edición Limitada 1 Unidad',
          price: 2500,
          stock: 1,
        },
      });

      // 2. Comprador 1 y Comprador 2 agregan la variante a su carrito
      await testPrisma.cartItem.deleteMany({ where: { cart: { userId: seeded.buyer1.id } } });
      await testPrisma.cartItem.deleteMany({ where: { cart: { userId: seeded.buyer2.id } } });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: limitedVariant.id, quantity: 1 })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: limitedVariant.id, quantity: 1 })
        .expect(201);

      // Dirección para comprador 2
      const addr2 = await request(app.getHttpServer())
        .post('/api/v1/users/addresses')
        .set('Cookie', buyer2Cookie)
        .set('Origin', ORIGIN)
        .send({
          label: 'Casa Comprador 2',
          line1: 'Av. Primavera 789',
          city: 'Lima',
          province: 'Lima',
        })
        .expect(201);

      // 3. Disparo simultáneo de checkout
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/orders')
          .set('Cookie', buyer1Cookie)
          .set('Origin', ORIGIN)
          .set('Idempotency-Key', crypto.randomUUID())
          .send({ addressId: buyer1AddressId }),
        request(app.getHttpServer())
          .post('/api/v1/orders')
          .set('Cookie', buyer2Cookie)
          .set('Origin', ORIGIN)
          .set('Idempotency-Key', crypto.randomUUID())
          .send({ addressId: addr2.body.data.id }),
      ]);

      const statuses = [res1.status, res2.status];
      // Exactamente una orden creada (201) y una rechazada (409 o 400 por INSUFFICIENT_STOCK)
      expect(statuses).toContain(201);
      expect(statuses.some((s) => s === 409 || s === 400)).toBe(true);

      // Verificar que el stock final en BD no sea negativo
      const finalVariant = await testPrisma.variant.findUnique({ where: { id: limitedVariant.id } });
      expect(finalVariant?.stock).toBe(0);
    });

    it('Doble pago concurrente con la misma Idempotency-Key no cobra dos veces', async () => {
      // 1. Crear una orden para Comprador 1
      await testPrisma.cartItem.deleteMany({ where: { cart: { userId: seeded.buyer1.id } } });
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .send({ variantId: seeded.variant1.id, quantity: 1 })
        .expect(201);

      const ord = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Cookie', buyer1Cookie)
        .set('Origin', ORIGIN)
        .set('Idempotency-Key', crypto.randomUUID())
        .send({ addressId: buyer1AddressId })
        .expect(201);

      const testOrderId = ord.body.data.id;
      const idempotencyKey = `pay_idem_${Date.now()}`;

      // 2. Disparo concurrente con la misma clave de idempotencia
      const [pay1, pay2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/payments')
          .set('Cookie', buyer1Cookie)
          .set('Origin', ORIGIN)
          .set('Idempotency-Key', idempotencyKey)
          .send({ orderId: testOrderId, token: 'tok_ok', method: 'CARD' }),
        request(app.getHttpServer())
          .post('/api/v1/payments')
          .set('Cookie', buyer1Cookie)
          .set('Origin', ORIGIN)
          .set('Idempotency-Key', idempotencyKey)
          .send({ orderId: testOrderId, token: 'tok_ok', method: 'CARD' }),
      ]);

      // Ambas respuestas deben ser exitosas y tener el mismo ID de transacción
      expect(pay1.status).toBe(201);
      expect(pay2.status).toBe(201);

      // En la base de datos debe existir UN SOLO pago para esta orden
      const payments = await testPrisma.payment.findMany({ where: { orderId: testOrderId } });
      expect(payments).toHaveLength(1);
    });
  });

  describe('4. Seguridad en Subida de Archivos', () => {
    it('Rechaza archivo con contenido no-imagen con extensión falsa .jpg (400 INVALID_FILE_TYPE)', async () => {
      const fakeJpgBuffer = Buffer.from('This is a text file masquerading as a JPG image');

      const res = await request(app.getHttpServer())
        .post(`/api/v1/seller/products/${seeded.product1.id}/images`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .attach('file', fakeJpgBuffer, 'fake.jpg');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('Rechaza archivo cuando la extensión no coincide con los magic bytes reales (400 INVALID_FILE_EXTENSION)', async () => {
      // Cabecera PNG real (89 50 4E 47 0D 0A 1A 0A) pero nombrado con extensión .jpg
      const realPngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/seller/products/${seeded.product1.id}/images`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .attach('file', realPngHeader, 'mismatch.jpg');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_EXTENSION');
    });

    it('Rechaza archivo mayor a 5 MB (400 FILE_TOO_LARGE)', async () => {
      // 5.5 MB de datos
      const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0xff);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/seller/products/${seeded.product1.id}/images`)
        .set('Cookie', seller1Cookie)
        .set('Origin', ORIGIN)
        .attach('file', largeBuffer, 'huge.jpg');

      expect([400, 413]).toContain(res.status);
    });
  });
});
