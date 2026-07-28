# Telar — Resumen del proyecto

> Documento pensado para dar contexto rápido a un chat de Claude (u otra persona) que no conoce el repo. Resume qué es Telar, cómo está organizado y en qué se está trabajando.

## 1. Qué es Telar

Telar es una plataforma digital para el ecosistema artesanal en Colombia. Conecta artesanos con compradores a través de:

- Un **marketplace público** donde los compradores navegan y compran productos artesanales.
- Una **plataforma privada para artesanos** donde gestionan su tienda, productos, ventas y reciben apoyo de agentes de IA.
- Un **canal de WhatsApp** para compradores y artesanos.
- **Búsqueda semántica** y **agentes de IA** que ayudan a los artesanos a crecer su negocio (fotografía de producto, precios, presencia digital, legal, etc.).

La empresa detrás es GET IN MOTION S.A.S. Todo el sistema vive en un único dominio de negocio ("comercio y gestión de productos artesanales"), por eso está organizado como **monorepo**.

## 2. Arquitectura general (monorepo)

```
telar/
├── apps/
│   ├── marketplace-web/   # Frontend público de compradores (React + Vite)
│   ├── artisans-web/      # Frontend privado de artesanos + backoffice (React + Vite)
│   ├── api/               # Backend único (NestJS + TypeORM + Postgres)
│   ├── agents/             # Sistema de agentes de IA (Python + FastAPI + LangChain/LangGraph)
│   ├── admin-rag/          # App interna (Streamlit) para gestionar las bases de conocimiento RAG de cada agente
│   ├── payment-svc/        # Microservicio de pagos/checkout (Go)
│   └── shared-types/       # Tipos TypeScript compartidos entre frontends y api
├── infra/                 # docker-compose y config por ambiente (dev/prod)
├── docs/                  # Documentación (arquitectura, auditorías UX)
└── scripts/                # Scripts operativos
```

Principio rector: **un backend por dominio de negocio**. Los dos frontends (marketplace y artesanos) y el canal de WhatsApp consumen la misma API central; los agentes de IA son agnósticos del canal (no conocen HTTP ni WhatsApp, reciben intención + contexto y son orquestados desde el backend).

## 3. Las apps en detalle

### 3.1 `apps/marketplace-web` — Frontend de compradores
- Stack: React 18 + Vite + Tailwind + shadcn/ui.
- Funciones: catálogo de productos y tiendas, búsqueda (clásica y semántica), carrito, checkout, autenticación de compradores, páginas de contenido (territorios, técnicas, categorías) manejadas por un CMS interno.
- **Nota activa:** esta app está pasando por un rebranding — el marketplace se está renombrando de "Telar" a **"Cocrea"** (nombre temporal), reorientado al ecosistema del Programa Nacional Escuelas Taller (PNET) del Ministerio de las Culturas. Incluye nueva paleta (verde oscuro), tipografías (Newsreader/Inter) y tratamiento visual más sofisticado. El resto de apps (artisans-web, api, agents) **no** se ven afectadas por este cambio.

### 3.2 `apps/artisans-web` — Frontend privado de artesanos + backoffice
- Stack: React 18 + Vite + Tailwind + shadcn/ui + Zustand + Storybook.
- Funciones: onboarding y gestión de tienda (marca, logo, hero, contacto, redes, datos bancarios vía Cobre, envíos, políticas), CRUD de productos, ventas y métricas, interacción con agentes de IA, configuración de WhatsApp. También incluye el **backoffice** (moderación, taxonomía, administración) para roles moderador/admin/super-admin.
- **Nota activa:** hay una iniciativa en curso de **normalización del design system** (solo estilos, sin tocar lógica): eliminar colores hex y tamaños de fuente hardcodeados en favor de tokens CSS/Tailwind, con un script de auditoría (`npm run audit:design`) que mide violaciones restantes y Storybook para documentar los componentes base. Se está migrando módulo por módulo (CMS y taxonomía ya migrados; moderación, shop y growth pendientes).

### 3.3 `apps/api` — Backend único
- Stack: NestJS + TypeORM + PostgreSQL.
- Responsabilidades: autenticación/autorización, CRUD del dominio (usuarios, tiendas, productos, órdenes, pagos, media), orquestación de agentes IA, webhook y flujos de WhatsApp, generación/consulta de embeddings, integración con storage externo.
- Organización interna: `auth/`, `users/`, `shops/`, `products/`, `orders/`, `payments/`, `media/`, `whatsapp/`, `search/` (embeddings + búsqueda semántica), `agents_client/`, `common/`.

### 3.4 `apps/agents` — Sistema de agentes de IA
- Stack: Python + FastAPI + LangChain/LangGraph + OpenAI + Supabase/pgvector.
- Agentes actuales (`apps/agents/agents/`): **onboarding**, **product** (captura inicial de producto), **pricing** (precios, con desglose de medidas de empaque vs. medidas de la pieza), **fotografia**, **presencia_digital**, **legal**, **faq**, **servicio_cliente** (atención al cliente), sobre una clase `base` común.
- Expone varias APIs (`api.py`, `search_api.py`, `whatsapp_api.py`, `artisan_support_api.py`, `joyitas_search_api.py`) y tiene tracing propio (`tracing.py`).
- Los agentes se comunican con el backend vía `agents_client` y no conocen el canal (web o WhatsApp) desde el que fueron invocados.

### 3.5 `apps/admin-rag` — Panel interno de conocimiento (Streamlit)
- App interna para el equipo: ver/subir/borrar documentos de las bases de conocimiento RAG de cada agente y chatear con cada agente para probar el retrieval.

### 3.6 `apps/payment-svc` — Microservicio de pagos (Go)
- Stack: Go + Echo + pgx (Postgres).
- Maneja el flujo de checkout/pagos de forma desacoplada del backend principal.

### 3.7 `apps/shared-types`
- Paquete TypeScript con tipos compartidos entre `api`, `marketplace-web` y `artisans-web` para mantener contratos consistentes.

## 4. Búsqueda semántica

Vive como módulo del backend/agents (no como servicio aparte):
- Embeddings generados con OpenAI (`text-embedding-3-small`), almacenados en Postgres con **pgvector** (`shop.product_embeddings`, `shop.store_embeddings`).
- Flujo: al crear/editar un producto en NestJS se llama `POST /api/search/embeddings/save`; el marketplace consulta `POST /api/search/products`; hay endpoints de indexación/reindexación batch.
- Las mismas consultas semánticas las reutilizan el marketplace, los agentes y WhatsApp.

## 5. Infraestructura y ambientes

- Todo corre sobre Docker Compose, orquestado en `infra/dev/` y `infra/prod/` (Postgres, api, agents, artisans-web, marketplace-web en una red compartida `gim-network`).
- Ambientes en AWS Lightsail: **dev** (una instancia con todo + storage separado) y **prod** (una instancia + base de datos gestionada + storage separado).
- Principio: el código es el mismo en todos los ambientes; lo que cambia es configuración, infraestructura y versión desplegada.

## 6. Flujo de ramas

```
feature/* → develop → main
```
- `main`: producción (estable, protegida, rama default).
- `develop`: integración y pruebas.
- `feature/*`: ramas temporales de trabajo.

## 7. Documentación adicional en el repo

- [docs/telar_architecture.md](docs/telar_architecture.md) — arquitectura técnica completa y decisiones clave (fuente de este resumen).
- [docs/audit-artisans-web.md](docs/audit-artisans-web.md), [docs/audit-marketplace-web.md](docs/audit-marketplace-web.md), [docs/audit-moderation-admin.md](docs/audit-moderation-admin.md) — auditorías UX/UI por área.
- [QA_PLATFORM.md](QA_PLATFORM.md) — plan de QA integral (casos de prueba por hito: auth, onboarding, productos, etc.).
- [SEMANTIC_SEARCH.md](SEMANTIC_SEARCH.md) — guía de configuración y despliegue de búsqueda semántica.
- [DOCKER_SETUP.md](DOCKER_SETUP.md) — detalle del setup de Docker/Nginx por app.

## 8. Estado del proyecto (contexto temporal)

Este documento describe el estado general y relativamente estable de la arquitectura. Las dos iniciativas marcadas como "activas" arriba (rebrand a Cocrea en marketplace-web, normalización de design system en artisans-web) están en curso y su alcance puede haber avanzado desde que se escribió este resumen — conviene confirmar el estado actual en el código/PRs antes de asumir que ya terminaron.
