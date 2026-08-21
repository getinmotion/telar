---
inclusion: fileMatch
fileMatchPattern: "api/**"
---

# api/ — Backend API Principal (NestJS)

## Descripción

API REST principal de la plataforma Telar. Gestiona autenticación, usuarios, tiendas de artesanos, productos, órdenes, pagos, envíos, notificaciones, tareas de agentes IA, y CMS editorial. Sirve a ambos frontends (artisans-web y marketplace-web).

## Stack Tecnológico

- **Framework:** NestJS 11 (TypeScript)
- **ORM:** TypeORM (PostgreSQL 15)
- **ODM:** Mongoose (MongoDB 7 — CMS)
- **Auth:** JWT + Passport (local + Google OAuth)
- **Almacenamiento:** AWS S3 / Lightsail Object Storage (Sharp para imágenes)
- **Email:** Nodemailer + Handlebars templates
- **Docs:** Swagger (disponible en `/api/docs`)
- **Logging:** nestjs-pino
- **Caché:** cache-manager
- **Rate Limiting:** @nestjs/throttler
- **Testing:** Jest

## Estructura del Proyecto

```
api/
├── src/
│   ├── main.ts                    # Bootstrap (puerto 3040, CORS, Swagger)
│   ├── app.module.ts              # Módulo raíz
│   ├── config/
│   │   └── db/                    # DataSource TypeORM + configuración
│   ├── common/
│   │   ├── decorators/            # Decoradores custom (roles, auth, etc.)
│   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/         
│   │   └── utils/                 # ImageUrlBuilder, helpers
│   ├── filters/                   # HttpExceptionFilter
│   ├── resources/                 # Módulos de dominio (70+)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── artisan-shops/
│   │   ├── products/
│   │   ├── products-new/
│   │   ├── product-variants/
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── payments/
│   │   ├── checkouts/
│   │   ├── categories/
│   │   ├── notifications/
│   │   ├── agent-tasks/
│   │   ├── agent-deliverables/
│   │   ├── file-upload/
│   │   ├── cms-sections/
│   │   ├── servientrega/
│   │   └── ...
│   └── migrations/                # Migraciones TypeORM
├── docker-compose.yml             # PostgreSQL 15 + MongoDB 7 + App
├── Dockerfile                     # Multi-stage build
├── package.json
├── tsconfig.json
└── .env.example
```

## Comandos Principales

```bash
# Desarrollo
npm run start:dev          # Inicia con watch mode

# Build
npm run build              # Compila a dist/

# Producción
npm run start:prod         # Ejecuta dist/main.js

# Migraciones
npm run migration:run      # Ejecuta migraciones pendientes
npm run migration:generate -- --name=NombreMigracion
npm run migration:revert   # Revierte la última migración

# Tests
npm run test               # Unit tests
npm run test:e2e           # E2E tests

# Linting
npm run lint               # ESLint con auto-fix
npm run format             # Prettier

# CMS
npm run cms:seed           # Seed de secciones CMS
```

## Convenciones de Código

- Cada dominio es un módulo NestJS en `src/resources/<dominio>/`
- Estructura de módulo: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `entities/*.entity.ts`, `dto/*.dto.ts`
- Validación con `class-validator` + `class-transformer` (ValidationPipe global con whitelist + transform)
- DTOs separados para Create y Update
- Entidades TypeORM con decoradores de Swagger (`@ApiProperty`)
- Prefijo global: `/telar/server/`
- Guards: `JwtAuthGuard` para endpoints protegidos
- Roles: decoradores custom para control de acceso

## Base de Datos

- **PostgreSQL 15** — Datos principales (TypeORM, esquema `shop.*` y `public`)
- **MongoDB 7** — Contenido editorial CMS (Mongoose, colecciones `cms_*`)
- Migraciones TypeORM para PostgreSQL — siempre crear migración para cambios de esquema
- Variables: `HOST_DB`, `PORT_DB`, `USER_DB`, `PASS_DB`, `NAME_DB`
- Mongo: `MONGO_PROTOCOL`, `MONGO_USER`, `MONGO_PASS`, `MONGO_HOST`, `MONGO_NAME`

## Variables de Entorno Clave

| Variable            | Descripción                              |
|---------------------|------------------------------------------|
| `PORT`              | Puerto del servidor (default: 3040)      |
| `PASSWORD_SECRET`   | Secret para JWT                          |
| `SESSION_SECRET`    | Secret para express-session (OAuth)      |
| `OPENAI_API_KEY`    | API key de OpenAI                        |
| `AWS_ACCESS_KEY_ID` | AWS credentials para S3                  |
| `AWS_BUCKET_NAME`   | Bucket S3 para archivos                  |
| `CORS_ORIGINS`      | Orígenes permitidos (CSV)                |

## Docker

```bash
# Levantar toda la infra + app
docker compose up -d

# Solo DB para desarrollo local
docker compose up postgres mongo -d
```

Puerto expuesto: `3040`
Health check: `GET /health`
