# Telar Platform — Visión General del Monorepo

## Descripción

Telar es una plataforma de marketplace para artesanos colombianos. Permite a los artesanos crear tiendas, gestionar productos, recibir pagos, hacer seguimiento de ventas y recibir soporte de negocio mediante agentes de IA especializados. Los consumidores pueden descubrir y comprar productos artesanales a través del marketplace.

## Arquitectura

Microservicios desplegados de forma independiente, comunicados por HTTP/REST. Comparten una base de datos PostgreSQL principal (esquemas separados) y servicios auxiliares (MongoDB para CMS, pgvector para embeddings).

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTENDS (React + Vite)                  │
│  ┌──────────────────┐            ┌──────────────────────────┐   │
│  │  artisans-web/   │            │   marketplace-web/       │   │
│  │  (portal artesano)│            │   (tienda consumidor)    │   │
│  └────────┬─────────┘            └───────────┬──────────────┘   │
└───────────┼──────────────────────────────────┼──────────────────┘
            │ REST /telar/server/*              │ REST /telar/server/*
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                              │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │   api/ (NestJS)  │  │ agents/ (Fast  │  │ payment-svc/   │  │
│  │   Puerto 3040    │  │  API) Pto 8000 │  │ (Go) Pto 8080  │  │
│  └────────┬─────────┘  └───────┬────────┘  └───────┬────────┘  │
└───────────┼─────────────────────┼───────────────────┼───────────┘
            │                     │                   │
            ▼                     ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                  │
│  ┌────────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │ PostgreSQL 15  │  │  MongoDB 7    │  │  AWS S3/Lightsail │  │
│  │ (shop, agents, │  │  (CMS Atlas)  │  │  (archivos)       │  │
│  │  payment_db)   │  │               │  │                   │  │
│  └────────────────┘  └───────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Proyectos del Monorepo

| Directorio        | Lenguaje/Framework          | Puerto | Propósito                                     |
|-------------------|-----------------------------|--------|-----------------------------------------------|
| `api/`            | TypeScript / NestJS 11      | 3040   | API REST principal (auth, productos, órdenes) |
| `agents/`         | Python / FastAPI + LangGraph| 8000   | Sistema multi-agente IA + RAG + WhatsApp      |
| `payment-svc/`    | Go / Echo v4                | 8080   | Servicio de pagos (Cobre, Wompi)              |
| `artisans-web/`   | React 18 + Vite + TS        | 5173   | Portal web para artesanos                     |
| `marketplace-web/`| React 18 + Vite + TS        | 5174   | Marketplace para consumidores                 |
| `admin-rag/`      | Python / Streamlit          | 8501   | Admin de base de conocimiento RAG             |
| `shared-types/`   | TypeScript                  | —      | Tipos compartidos entre frontends             |
| `src/`            | Python                      | —      | Librería compartida (agents + admin-rag)      |

## Dominios de Producción

- `artisans.telar.co` — Portal artesanos
- `marketplace.telar.co` / `www.telar.co` — Marketplace consumidores
- `stage-artisans.telar.co` — Staging artesanos
- `stage-marketplace.telar.co` — Staging marketplace
- `stage-api.telar.co` — API staging

## Base de Datos — Esquemas PostgreSQL

- **shop.\*** — Productos, tiendas, órdenes, categorías (NestJS API / TypeORM)
- **agents.\*** — Conversaciones, knowledge base, embeddings, perfiles (Agents Service / asyncpg)
- **payment_db** — Base de datos separada para pagos (Go payment-svc / pgx)
- **taxonomy.\*** — Categorías, técnicas, materiales, territorios

## Servicios Externos Integrados

- **OpenAI** — GPT-4o para agentes, text-embedding-3-small para vectores
- **Supabase** — Auth en frontends, PostgreSQL como DB principal
- **AWS S3 / Lightsail** — Almacenamiento de imágenes (buckets: telar-stg-bucket, telar-prod-bucket)
- **Storyblok** — CMS editorial (blog, contenido marketplace)
- **Servientrega** — Cotizaciones de envío
- **Cobre / Wompi** — Pasarelas de pago colombianas
- **Tavily** — Web search para agente de pricing
- **LangSmith** — Tracing de agentes IA
- **WhatsApp Business API** — Bots para consumidores y artesanos
- **Sentry** — Error tracking

## Cómo Iniciar el Desarrollo

### Prerrequisitos

- Node.js 20+ y npm
- Python 3.11+ y pip/uv
- Go 1.25+
- Docker y Docker Compose
- Variables de entorno (ver `.env.example` de cada proyecto)

### Levantar Infraestructura (DB)

```bash
cd api/
docker compose up postgres mongo -d
```

### Levantar Servicios

```bash
# API principal
cd api/ && npm install && npm run start:dev

# Agents
cd agents/ && pip install -r requirements.txt && python main.py

# Payment service
cd payment-svc/ && go run cmd/api/main.go

# Frontend artesanos
cd artisans-web/ && npm install && npm run dev

# Frontend marketplace
cd marketplace-web/ && npm install && npm run dev

# Admin RAG
cd admin-rag/ && streamlit run app.py
```

## Convenciones Generales

- **Idioma del código:** Inglés (nombres de variables, funciones, clases)
- **Idioma de documentación/prompts:** Español (comentarios, prompts de IA, docs de usuario)
- **Git:** Feature branches, PRs contra `main`
- **API prefix:** `/telar/server/` (NestJS), `/api/` (Agents, Payment)
- **Auth:** JWT Bearer tokens en todas las APIs
- **Nomenclatura de archivos:** kebab-case (TypeScript), snake_case (Python), snake_case (Go)
