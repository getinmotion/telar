import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { ImageUrlBuilder } from './common/utils/image-url-builder.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: console,
  });

  // Configure Image URL Builder for CDN
  const configService = app.get(ConfigService);
  ImageUrlBuilder.configure(configService);

  app.setGlobalPrefix('telar/server');

  // Configurar sesión para Passport (requerido para OAuth)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('GetInMotion API')
    .setDescription(
      'API del servidor GetInMotion - Transición desde Supabase. Plataforma de marketplace para artesanos colombianos con sistema completo de autenticación, gestión de usuarios, perfiles, tiendas, temas de marca, contexto personalizado y seguimiento de madurez empresarial.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización de usuarios')
    .addTag('users', 'Gestión de usuarios del sistema')
    .addTag('user-profiles', 'Perfiles de usuario con información extendida')
    .addTag('user-progress', 'Progreso y gamificación de usuarios')
    .addTag('email-verifications', 'Verificación de correos electrónicos')
    .addTag('brand-themes', 'Temas de marca y paletas de colores')
    .addTag('artisan-shops', 'Tiendas de artesanos en el marketplace')
    .addTag(
      'user-master-context',
      'Contexto maestro de usuarios para personalización y IA',
    )
    .addTag(
      'user-maturity-actions',
      'Acciones y puntos de madurez empresarial de usuarios',
    )
    .addTag('products', 'Productos de artesanos en el marketplace')
    .addTag('product-categories', 'Categorías de productos con jerarquía')
    .addTag('agent-tasks', 'Tareas creadas por agentes IA para usuarios')
    .addTag(
      'agent-deliverables',
      'Entregables generados por agentes IA para usuarios',
    )
    .addTag(
      'user-maturity-scores',
      'Puntuaciones de madurez empresarial de usuarios con histórico',
    )
    .addTag(
      'master-coordinator-context',
      'Contexto del coordinador maestro de IA con memoria y snapshots',
    )
    .addTag('ai', 'Servicios de inteligencia artificial con OpenAI')
    .addTag(
      'analytics-events',
      'Eventos analíticos del sistema para tracking y métricas',
    )
    .addTag(
      'user-achievements',
      'Logros y achievements desbloqueados por usuarios',
    )
    .addTag('task-steps', 'Pasos individuales de tareas de agentes IA')
    .addTag(
      'servientrega',
      'Cotizaciones de envío con Servientrega (empresa de mensajería)',
    )
    .addTag(
      'cart-shipping-info',
      'Información de envío asociada a carritos de compra',
    )
    .addTag('notifications', 'Sistema de notificaciones para usuarios')
    .addTag(
      'product-moderation-history',
      'Historial de moderación de productos',
    )
    .addTag('product-variants', 'Variantes de productos con SKU y stock')
    .addTag(
      'inventory-movements',
      'Movimientos de inventario para control de stock',
    )
    .addTag('file-upload', 'Subida y gestión de archivos en AWS S3/Lightsail')
    .addTag('cms', 'Gestión de contenido con Storyblok CMS')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'GetInMotion API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3040;
  await app.listen(port);
  console.info('🚝 Servidor ejecutandose en el Puerto:', port);
  console.info(
    `📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
