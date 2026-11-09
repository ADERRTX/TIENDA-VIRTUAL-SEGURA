import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  SellerStatus,
  ProductStatus,
} from '../src/generated/prisma/client';
import { hash } from '@node-rs/argon2';

const TEST_DB_URL =
  process.env['DATABASE_URL'] ||
  'postgresql://tvs_user:tvs_dev_password_2026@127.0.0.1:5433/tienda_virtual_segura_test?schema=public';

export const testPrisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: TEST_DB_URL }),
});

export async function seedTestDatabase(): Promise<{
  admin: { id: string; email: string };
  support: { id: string; email: string };
  buyer1: { id: string; email: string };
  buyer2: { id: string; email: string };
  seller1User: { id: string; email: string };
  seller1: { id: string; storeName: string };
  category: { id: string; name: string };
  product1: { id: string; title: string };
  variant1: { id: string; price: number; stock: number };
}> {
  const passwordHash = await hash('Password12345');

  // 1. System Config
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
    await testPrisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // 2. Base Users
  const admin = await testPrisma.user.upsert({
    where: { email: 'admin@tvs.pe' },
    update: { passwordHash, status: 'ACTIVE', tokensValidAfter: null },
    create: {
      email: 'admin@tvs.pe',
      passwordHash,
      fullName: 'Admin General',
      role: UserRole.ADMIN,
    },
  });

  const support = await testPrisma.user.upsert({
    where: { email: 'soporte@tvs.pe' },
    update: { passwordHash, status: 'ACTIVE', tokensValidAfter: null },
    create: {
      email: 'soporte@tvs.pe',
      passwordHash,
      fullName: 'Soporte TVS',
      role: UserRole.SUPPORT,
    },
  });

  const buyer1 = await testPrisma.user.upsert({
    where: { email: 'comprador1@tvs.pe' },
    update: { passwordHash, status: 'ACTIVE', tokensValidAfter: null },
    create: {
      email: 'comprador1@tvs.pe',
      passwordHash,
      fullName: 'Comprador Uno',
      role: UserRole.BUYER,
    },
  });

  const buyer2 = await testPrisma.user.upsert({
    where: { email: 'comprador2@tvs.pe' },
    update: { passwordHash, status: 'ACTIVE', tokensValidAfter: null },
    create: {
      email: 'comprador2@tvs.pe',
      passwordHash,
      fullName: 'Comprador Dos',
      role: UserRole.BUYER,
    },
  });

  const seller1User = await testPrisma.user.upsert({
    where: { email: 'vendedor1@tvs.pe' },
    update: { passwordHash, status: 'ACTIVE', tokensValidAfter: null },
    create: {
      email: 'vendedor1@tvs.pe',
      passwordHash,
      fullName: 'Vendedor Uno',
      role: UserRole.SELLER,
    },
  });

  // 3. Seller
  const seller1 = await testPrisma.seller.upsert({
    where: { storeName: 'Tienda Test' },
    update: { status: SellerStatus.ACTIVE },
    create: {
      userId: seller1User.id,
      storeName: 'Tienda Test',
      description: 'Tienda de pruebas seguras',
      status: SellerStatus.ACTIVE,
    },
  });

  // 4. Category
  const category = await testPrisma.category.upsert({
    where: { name: 'Electrónica' },
    update: {},
    create: {
      name: 'Electrónica',
    },
  });

  // 5. Product & Variant
  let product1 = await testPrisma.product.findFirst({
    where: { sellerId: seller1.id },
  });

  if (!product1) {
    product1 = await testPrisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: category.id,
        title: 'Producto de Prueba 1',
        description: 'Descripción para pruebas automatizadas',
        status: ProductStatus.ACTIVE,
      },
    });
  }

  let variant1 = await testPrisma.variant.findFirst({
    where: { productId: product1.id },
  });

  if (!variant1) {
    variant1 = await testPrisma.variant.create({
      data: {
        productId: product1.id,
        name: 'Variante Estándar',
        price: 5000, // S/. 50.00
        stock: 100,
      },
    });
  } else {
    // Reset stock to 100
    variant1 = await testPrisma.variant.update({
      where: { id: variant1.id },
      data: { stock: 100 },
    });
  }

  return {
    admin,
    support,
    buyer1,
    buyer2,
    seller1User,
    seller1,
    category,
    product1,
    variant1,
  };
}
