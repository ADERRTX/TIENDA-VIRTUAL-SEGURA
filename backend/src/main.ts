// [REGLAS & FUNCIONES: Arranque del Servidor HTTP] Punto de entrada del backend. Configura prefijo global /api/v1, Swagger, CORS, Helmet, CookieParser, ZodPipe y puerto de escucha (3000).
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { getAllowedCorsOrigins } from './common/constants';

export async function bootstrap(): Promise<void> {
  const isProduction = process.env['NODE_ENV'] === 'production';

  if (isProduction) {
    if (!process.env['DATABASE_URL'] || !process.env['DATABASE_URL'].trim()) {
      throw new Error('DATABASE_URL must be defined in production');
    }
    const jwtSecret = process.env['JWT_SECRET'] ?? process.env['SESSION_SECRET'];
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be defined with at least 32 characters in production');
    }
  }

  // Load allowed origins from environment (strict in production: throws if CORS_ORIGINS is not set)
  const corsOrigins = getAllowedCorsOrigins();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // En desarrollo permitir localhost, 127.0.0.1 y cualquier IP de la red local (192.168.x.x, 10.x.x.x, etc.)
      if (!origin || !isProduction) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS_BLOCKED'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });


  app.useGlobalFilters(new AllExceptionsFilter());


  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Tienda Virtual Segura')
      .setDescription('API del marketplace seguro')
      .setVersion('1.0')
      .addCookieAuth('jwt')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`API escuchando en http://localhost:${port}/api/v1`);
  if (!isProduction) {
    console.log(`Swagger en http://localhost:${port}/api/docs`);
  }
}

void bootstrap();