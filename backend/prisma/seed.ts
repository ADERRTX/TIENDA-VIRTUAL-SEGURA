import 'dotenv/config';
import { hash } from '@node-rs/argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CustodyStatus,
  OrderStatus,
  OrderPaymentStatus,
  PaymentStatus,
  PrismaClient,
  ProductStatus,
  SellerStatus,
  SubOrderStatus,
  UserRole,
} from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL']! }),
});

const PASSWORD = 'Password12345';
const MIN = 60 * 1000;

interface ProductRef {
  variantId: string;
  price: number;
  name: string;
}

async function main(): Promise<void> {
  const passwordHash = await hash(PASSWORD);

  // Users (upsert by email)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tvs.pe' },
    update: {},
    create: {
      email: 'admin@tvs.pe',
      passwordHash,
      fullName: 'Admin General',
      role: UserRole.ADMIN,
    },
  });

  const soporte = await prisma.user.upsert({
    where: { email: 'soporte@tvs.pe' },
    update: {},
    create: {
      email: 'soporte@tvs.pe',
      passwordHash,
      fullName: 'Soporte TVS',
      role: UserRole.SUPPORT,
    },
  });

  const comprador1 = await prisma.user.upsert({
    where: { email: 'comprador1@tvs.pe' },
    update: {},
    create: {
      email: 'comprador1@tvs.pe',
      passwordHash,
      fullName: 'Comprador Uno',
      role: UserRole.BUYER,
    },
  });

  const comprador2 = await prisma.user.upsert({
    where: { email: 'comprador2@tvs.pe' },
    update: {},
    create: {
      email: 'comprador2@tvs.pe',
      passwordHash,
      fullName: 'Comprador Dos',
      role: UserRole.BUYER,
    },
  });

  const vendedor1User = await prisma.user.upsert({
    where: { email: 'vendedor1@tvs.pe' },
    update: {},
    create: {
      email: 'vendedor1@tvs.pe',
      passwordHash,
      fullName: 'Vendedor Uno',
      role: UserRole.SELLER,
    },
  });

  const vendedor2User = await prisma.user.upsert({
    where: { email: 'vendedor2@tvs.pe' },
    update: {},
    create: {
      email: 'vendedor2@tvs.pe',
      passwordHash,
      fullName: 'Vendedor Dos',
      role: UserRole.BUYER, // PENDING means hasn't been approved yet -> stays BUYER
    },
  });

  const vendedor3User = await prisma.user.upsert({
    where: { email: 'vendedor3@tvs.pe' },
    update: {},
    create: {
      email: 'vendedor3@tvs.pe',
      passwordHash,
      fullName: 'Vendedor Suspendido',
      role: UserRole.SELLER,
    },
  });

  // Sellers (upsert by storeName)
  const seller1 = await prisma.seller.upsert({
    where: { storeName: 'Tienda Uno' },
    update: {},
    create: {
      userId: vendedor1User.id,
      storeName: 'Tienda Uno',
      description: 'Productos diversos de electrónica y hogar',
      status: SellerStatus.ACTIVE,
    },
  });

  await prisma.seller.upsert({
    where: { storeName: 'Tienda Dos' },
    update: {},
    create: {
      userId: vendedor2User.id,
      storeName: 'Tienda Dos',
      description: 'Tienda en revisión',
      status: SellerStatus.PENDING,
    },
  });

  await prisma.seller.upsert({
    where: { storeName: 'Tienda Suspendida' },
    update: {},
    create: {
      userId: vendedor3User.id,
      storeName: 'Tienda Suspendida',
      description: 'Tienda suspendida por incumplimiento',
      status: SellerStatus.SUSPENDED,
      reason: 'Incumplimiento de políticas de venta',
    },
  });

  // Addresses
  for (const u of [admin, soporte, comprador1, comprador2]) {
    const existing = await prisma.address.findFirst({ where: { userId: u.id } });
    if (!existing) {
      await prisma.address.create({
        data: {
          userId: u.id,
          label: 'Casa',
          line1: 'Av. Example 123',
          city: 'Lima',
          province: 'Lima',
          isDefault: true,
        },
      });
    }
  }

  // Categories
  const catNames = ['Electrónica', 'Hogar', 'Deportes', 'Libros', 'Juguetes'];
  const cats: { id: string }[] = [];
  for (const name of catNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    cats.push(cat);
  }

  // SystemConfig
  const plazos: Record<string, string> = {
    PAYMENT_TIMEOUT_MINUTES: '30',
    SELLER_CONFIRM_HOURS: '48',
    DISPATCH_HOURS: '72',
    CLAIM_WINDOW_DAYS: '7',
    CLAIM_RESPONSE_HOURS: '72',
    APPEAL_DAYS: '3',
    RETURN_SHIP_DAYS: '7',
    FINALIZE_AFTER_DELIVERY_DAYS: '7',
  };
  for (const [key, value] of Object.entries(plazos)) {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Products (only if seller1 has no products)
  const existingProducts = await prisma.product.findMany({
    where: { sellerId: seller1.id },
    include: { variants: true },
  });

  const products: ProductRef[] = [];

  if (existingProducts.length === 0) {
    for (let i = 1; i <= 12; i++) {
      const cat = cats[i % cats.length];
      if (!cat) continue;
      const prod = await prisma.product.create({
        data: {
          sellerId: seller1.id,
          categoryId: cat.id,
          title: `Producto ${i}`,
          description: `Descripción del producto ${i}. Artículo de alta calidad.`,
          status: ProductStatus.ACTIVE,
        },
      });
      const price = 1000 + i * 500;
      const v = await prisma.variant.create({
        data: { productId: prod.id, name: 'Estándar', price, stock: 50 },
      });
      await prisma.priceHistory.create({ data: { variantId: v.id, price } });
      products.push({ variantId: v.id, price, name: `Producto ${i}` });
    }
  } else {
    for (const p of existingProducts) {
      const v = p.variants[0];
      if (v) {
        products.push({ variantId: v.id, price: v.price, name: p.title });
      }
    }
  }

  // Cart for comprador1
  const existingCart = await prisma.cart.findFirst({ where: { userId: comprador1.id } });
  if (!existingCart && products[0]) {
    const cart = await prisma.cart.create({ data: { userId: comprador1.id } });
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: products[0].variantId, quantity: 2 },
    });
  }

  // Demo orders (one per status, only create if buyer has fewer than 5 orders)
  const addr1 = await prisma.address.findFirstOrThrow({ where: { userId: comprador1.id } });
  const existingOrders = await prisma.order.count({ where: { buyerId: comprador1.id } });

  if (existingOrders === 0 && products.length > 0) {
    const buyers = [comprador1, comprador2];
    const subStatuses: SubOrderStatus[] = [
      SubOrderStatus.PAGADO,
      SubOrderStatus.CONFIRMADO,
      SubOrderStatus.EN_PREPARACION,
      SubOrderStatus.DESPACHADO,
      SubOrderStatus.ENTREGADO,
      SubOrderStatus.FINALIZADO,
    ];

    let idx = 0;
    for (const subStatus of subStatuses) {
      const buyer = buyers[idx % buyers.length]!;
      const selectedProduct = products[idx % products.length]!;
      const total = selectedProduct.price;

      const orderStatus =
        subStatus === SubOrderStatus.FINALIZADO
          ? OrderStatus.FINALIZADO
          : OrderStatus.EN_CURSO;

      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          addressId: addr1.id,
          status: orderStatus,
          paymentStatus: OrderPaymentStatus.PAGADO,
          paymentExpires: new Date(Date.now() + 30 * MIN),
          subOrders: {
            create: {
              sellerId: seller1.id,
              status: subStatus,
              items: {
                create: {
                  variantId: selectedProduct.variantId,
                  name: selectedProduct.name,
                  unitPrice: selectedProduct.price,
                  quantity: 1,
                },
              },
              custody: {
                create: {
                  amount: total,
                  status:
                    subStatus === SubOrderStatus.FINALIZADO
                      ? CustodyStatus.LIBERADO
                      : CustodyStatus.RETENIDO,
                },
              },
            },
          },
        },
      });

      const sub = await prisma.subOrder.findFirst({ where: { orderId: order.id } });
      if (sub) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            subOrderId: sub.id,
            amount: total,
            status: PaymentStatus.APROBADO,
          },
        });
      }
      idx++;
    }
  }

  console.log('✅ Seed completado. Contraseña de todos: ' + PASSWORD);
  console.log('Usuarios: admin@tvs.pe, soporte@tvs.pe, comprador1@tvs.pe, comprador2@tvs.pe');
  console.log('Vendedores: vendedor1@tvs.pe (ACTIVE), vendedor2@tvs.pe (PENDING), vendedor3@tvs.pe (SUSPENDED)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
