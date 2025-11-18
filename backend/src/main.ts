import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API Prefix
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Masjid Management Platform API')
    .setDescription(
      'Complete API documentation for the Masjid Management Platform. ' +
      'This platform provides comprehensive tools for managing mosque operations, ' +
      'including prayer times, announcements, devices, donations, and more.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('masjids', 'Masjid (Mosque) management')
    .addTag('prayer-times', 'Prayer times management and calculation')
    .addTag('devices', 'Device pairing and management')
    .addTag('announcements', 'Announcements and notifications')
    .addTag('media', 'Media library and file uploads')
    .addTag('schedules', 'Content scheduling')
    .addTag('campaigns', 'Donation campaigns')
    .addTag('donations', 'Donation processing and management')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Get port from environment or use default
  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🕌 Masjid Management Platform API                      ║
  ║                                                           ║
  ║   Server running on: http://localhost:${port}             ║
  ║   API Documentation: http://localhost:${port}/api/docs    ║
  ║                                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
