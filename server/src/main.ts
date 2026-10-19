import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security ────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors();

  // ── Global API prefix ────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global guards ────────────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // ── Global pipes ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global filters & interceptors ────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ──────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Novel Writer API')
    .setDescription('Backend API for AI Novel Workspace & Reader')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀  Server running on http://localhost:${port}/api`);
  console.log(`📖  Swagger docs:   http://localhost:${port}/api/docs`);
}

bootstrap();
