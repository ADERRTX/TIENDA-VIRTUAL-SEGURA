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
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PASSWORD = 'Password12345';
const MIN = 60 * 1000;

async function main(): Promise<void> {
  const passwordHash = await hash(PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tvs.pe',
      passwordHash,
      fullName: 'Admin General',
      role: UserRole.ADMIN,
    },
  });
  const soporte = await prisma.user.create({
    data: {
      email: 'soporte@tvs.pe',
      passwordHash,
      fullName: 'Soporte TVS',
      role: UserRole.SUPPORT,
    },
  });
  const comprador1 = await prisma.user.create({
    data: {
      email: 'comprador1@tvs.pe',
      passwordHash,
      fullName: 'Comprador Uno',
      role: UserRole.BUYER,
    },
  });
  const comprador2 = await prisma.user.create({
    data: {
      email: 'comprador2@tvs.pe',
      passwordHash,
      fullName: 'Comprador Dos',
      role: UserRole.BUYER,
    },
  });

  const sellerUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'vendedor1@tvs.pe',
        passwordHash,
        fullName: 'Vendedor Uno',
        role: UserRole.SELLER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vendedor2@tvs.pe',
        passwordHash,
        fullName: 'Vendedor Dos',
        role: UserRole.SELLER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vendedor3@tvs.pe',
        passwordHash,
        fullName: 'Vendedor Suspendido',
        role: UserRole.SELLER,
      },
    }),
  ]);

  const sellers = await Promise.all([
    prisma.seller.create({
      data: {
        userId: sellerUsers[0].id,
        storeName: 'Tienda Uno',
        description: 'Productos diversos',
        status: SellerStatus.ACTIVE,
      },
    }),
    prisma.seller.create({
      data: {
        userId: sellerUsers[1].id,
        storeName: 'Tienda Dos',
        status: SellerStatus.PENDING,
      },
    }),
    prisma.seller.create({
      data: {
        userId: sellerUsers[2].id,
        storeName: 'Tienda Suspendida',
        status: SellerStatus.SUSPENDED,
      },
    }),
  ]);

  for (const u of [admin, soporte, comprador1, comprador2]) {
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

  const catNames = ['Electrónica', 'Hogar', 'Deportes', 'Libros', 'Juguetes'];
  const cats = [] as { id: string }[];
  for (const name of catNames) {
    cats.push(await prisma.category.create({ data: { name } }));
  }

  const products: { variantId: string; price: number; name: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const activeSeller = i <= 12 ? sellers[0] : sellers[1];
    const status = i <= 12 ? ProductStatus.ACTIVE : ProductStatus.DRAFT;
    const cat = cats[i % cats.length]!;
    const prod = await prisma.product.create({
      data: {
        sellerId: activeSeller.id,
        categoryId: cat.id,
        title: `Producto ${i}`,
        description: `Descripción del producto ${i}`,
        status,
      },
    });
    const price = 1000 + i * 500;
    const v = await prisma.variant.create({
      data: {
        productId: prod.id,
        name: 'Estándar',
        price,
        stock: 50,
      },
    });
    await prisma.priceHistory.create({
      data: { variantId: v.id, price },
    });
    products.push({ variantId: v.id, price, name: `Producto ${i}` });
  }

  const plazos: Record<string, string> = {
    PAYMENT_TIMEOUT_MINUTES: '30',
    SELLER_CONFIRM_HOURS: '48',
    DISPATCH_HOURS: '72',
    CLAIM_WINDOW_DAYS: '7',
    CLAIM_RESPONSE_HOURS: '72',
    APPEAL_DAYS: '3',
    RETURN_SHIP_DAYS: '7',
  };
  for (const [key, value] of Object.entries(plazos)) {
    await prisma.systemConfig.create({ data: { key, value } });
  }

  const addr1 = await prisma.address.findFirstOrThrow({
    where: { userId: comprador1.id },
  });

  const cart = await prisma.cart.create({ data: { userId: comprador1.id } });
  await prisma.cartItem.create({
    data: { cartId: cart.id, variantId: products[0]!.variantId, quantity: 2 },
  });

  const buyers = [comprador1, comprador2, admin, soporte];

  let idx = 0;
  for (const subStatus of [
    SubOrderStatus.PENDIENTE_PAGO,
    SubOrderStatus.PAGADO,
    SubOrderStatus.CONFIRMADO,
    SubOrderStatus.EN_PREPARACION,
    SubOrderStatus.DESPACHADO,
    SubOrderStatus.EN_TRANSITO,
    SubOrderStatus.EN_REPARTO,
    SubOrderStatus.ENTREGADO,
    SubOrderStatus.FINALIZADO,
    SubOrderStatus.CANCELADO,
    SubOrderStatus.RECLAMADO,
    SubOrderStatus.DEVUELTO,
    SubOrderStatus.REEMBOLSADO,
  ]) {
    const buyer = buyers[idx % buyers.length]!;
    const selectedProduct = products[idx % products.length]!;
    const total = selectedProduct.price * 1;
    const orderStatus =
      subStatus === SubOrderStatus.CANCELADO
        ? OrderStatus.CANCELADO
        : subStatus === SubOrderStatus.REEMBOLSADO
          ? OrderStatus.FINALIZADO
          : subStatus === SubOrderStatus.RECLAMADO
            ? OrderStatus.CON_RECLAMO
            : subStatus === SubOrderStatus.DEVUELTO
              ? OrderStatus.FINALIZADO
              : OrderStatus.EN_CURSO;
    const paymentStatus =
      subStatus === SubOrderStatus.CANCELADO
        ? OrderPaymentStatus.REEMBOLSADO_TOTAL
        : subStatus === SubOrderStatus.REEMBOLSADO
          ? OrderPaymentStatus.REEMBOLSADO_TOTAL
          : OrderPaymentStatus.PAGADO;
    const custodyStatus =
      subStatus === SubOrderStatus.DEVUELTO
        ? CustodyStatus.DEVUELTO
        : subStatus === SubOrderStatus.REEMBOLSADO
          ? CustodyStatus.LIBERADO
          : subStatus === SubOrderStatus.RECLAMADO
            ? CustodyStatus.CONGELADO
            : subStatus === SubOrderStatus.ENTREGADO
              ? CustodyStatus.LIBERADO
              : CustodyStatus.RETENIDO;
    const withClaim = subStatus === SubOrderStatus.RECLAMADO || subStatus === SubOrderStatus.DEVUELTO;
    const withPayment =
      subStatus !== SubOrderStatus.PENDIENTE_PAGO &&
      subStatus !== SubOrderStatus.CANCELADO;

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        addressId: addr1.id,
        status: orderStatus,
        paymentStatus,
        paymentExpires: new Date(Date.now() + 30 * MIN),
        subOrders: {
          create: {
            sellerId: sellers[0].id,
            status: subStatus,
            items: {
              create: {
                variantId: selectedProduct.variantId,
                name: selectedProduct.name,
                unitPrice: selectedProduct.price,
                quantity: 1,
              },
            },
            ...(custodyStatus
              ? {
                  custody: {
                    create: { amount: total, status: custodyStatus },
                  },
                }
              : {}),
            ...(withClaim
              ? {
                  claims: {
                    create: {
                      claimantId: buyer.id,
                      reason: 'Producto no llegó',
                      evidence: [],
                    },
                  },
                }
              : {}),
          },
        },
      },
    });

    if (withPayment) {
      const sub = await prisma.subOrder.findFirst({
        where: { orderId: order.id },
      });
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
    }
    idx++;
  }

  console.log('Seed completado. Contraseña de todos: ' + PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
