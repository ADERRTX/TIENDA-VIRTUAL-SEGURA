import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';


import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env['NODE_ENV'] === 'production';

  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  // Load allowed origins from environment (or fallback to localhost defaults)
  const corsOrigins = (process.env['CORS_ORIGINS'] ??
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  // In production, ensure CORS_ORIGINS is defined
  if (isProduction && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be defined in production');
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });


  app.useGlobalFilters(new AllExceptionsFilter());
  // Global interceptor to capture IP and User‑Agent for audit logs
  app.useGlobalInterceptors(new AuditInterceptor());


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
  await app.listen(port);
  console.log(`API escuchando en http://localhost:${port}/api/v1`);
  if (!isProduction) {
    console.log(`Swagger en http://localhost:${port}/api/docs`);
  }
}

void bootstrap();