---
inclusion: fileMatch
fileMatchPattern: "agents/**,src/**"
---

# agents/ — Servicio Multi-Agente IA (FastAPI + LangGraph)

## Descripción

Sistema multi-agente de IA que brinda soporte de negocio a artesanos colombianos. Incluye 8 agentes especializados con routing inteligente, memoria jerárquica persistente, RAG (Retrieval-Augmented Generation), búsqueda semántica de productos, integración WhatsApp y flujos guiados (onboarding, creación de producto).

## Stack Tecnológico

- **Framework:** FastAPI + Uvicorn (Python 3.11)
- **Agentes IA:** LangChain 0.3 + LangGraph 0.3 + OpenAI GPT-4o
- **Embeddings:** OpenAI text-embedding-3-small (1536 dims)
- **Base de Datos:** PostgreSQL + pgvector (asyncpg)
- **Prompts:** Jinja2 templates (`.md.j2`)
- **Web Search:** Tavily (agente pricing)
- **Tracing:** LangSmith
- **Error Tracking:** Sentry
- **WhatsApp:** Meta Business API (2 bots: consumidor + artesano)

## Arquitectura de Agentes

```
Usuario → Supervisor (Router) → Agente Especializado
                                      ↓
                              Memoria + RAG + Tools
```

### Agentes Disponibles

| Agente              | Archivo                        | Propósito                                  |
|---------------------|--------------------------------|--------------------------------------------|
| Onboarding          | `agents/onboarding.py`         | Evaluación de madurez (16 preguntas, 4 dimensiones) |
| Legal               | `agents/legal.py`              | Asesoría legal, tributaria y contable      |
| Product             | `agents/product.py`            | Gestión de catálogo y recomendaciones      |
| Pricing             | `agents/pricing.py`            | Estrategias de precios + investigación web |
| Presencia Digital   | `agents/presencia_digital.py`  | Marketing y redes sociales                 |
| FAQ                 | `agents/faq.py`                | Preguntas generales de negocio             |
| Servicio Cliente    | `agents/servicio_cliente.py`   | Atención al consumidor                     |
| Fotografía          | `agents/fotografia.py`         | Guía para fotografía de producto           |

### Flujos Estructurados

- **Onboarding Flow** (`flows/onboarding_flow.py`) — Evaluación de madurez empresarial en 4 categorías
- **Product Creation** (`flows/product_creation.py`) — Wizard de 6 pasos para crear productos

## Estructura del Proyecto

```
agents/
├── main.py                    # FastAPI app, lifespan, routers
├── api.py                     # Router principal /api/agents/
├── search_api.py              # Búsqueda semántica de productos
├── joyitas_search_api.py      # Búsqueda en DB de test (joyitas)
├── whatsapp_api.py            # Webhook WhatsApp consumidor
├── artisan_support_api.py     # Webhook WhatsApp artesano (copiloto)
├── agents/
│   ├── base.py                # Clase base de agentes
│   ├── onboarding.py
│   ├── legal.py
│   ├── product.py
│   ├── pricing.py
│   ├── presencia_digital.py
│   ├── faq.py
│   ├── servicio_cliente.py
│   └── fotografia.py
├── core/
│   ├── orchestrator.py        # Supervisor/Router de agentes
│   ├── memory.py              # Memoria jerárquica (conversational, profile, strategy)
│   ├── state.py               # Estado compartido del grafo
│   └── embedding_cache.py     # Caché de embeddings
├── flows/
│   ├── onboarding_flow.py     # Flujo de madurez
│   └── product_creation.py    # Flujo de creación de producto
├── prompts/
│   ├── *.md.j2               # Templates Jinja2 de system prompts
│   └── renderer.py           # Motor de rendering de prompts
├── knowledge_base/            # Documentos de conocimiento (Markdown)
├── scripts/
│   ├── migrate_agents_db.sql  # Schema completo de DB
│   └── ...
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## Librería Compartida (`src/`)

```
src/
├── api/
│   └── config.py              # Settings (pydantic-settings)
├── database/
│   ├── supabase_client.py     # Cliente async DB principal (agents schema)
│   ├── pg_client.py           # Pool para catálogo (semantic search)
│   └── joyitas_pg_client.py   # Pool para DB test
├── services/
│   ├── embedding_service.py   # Generación de embeddings OpenAI
│   ├── shop_db_service.py     # Queries de tiendas
│   └── product_recommendation_service.py
└── utils/
    ├── enhanced_logger.py
    └── helpers.py
```

## Comandos Principales

```bash
# Desarrollo (con hot reload)
python main.py

# Producción
uvicorn agents.main:app --host 0.0.0.0 --port 8000

# Docker
docker compose up --build

# Ejecutar migración de DB
psql "postgresql://user:pass@host:port/getinmotion" -f scripts/migrate_agents_db.sql
```

## API Endpoints Principales

| Método | Ruta                              | Descripción                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/agents/process`             | Procesar mensaje (routing automático)|
| GET    | `/api/agents/history/{session_id}`| Historial de conversación            |
| POST   | `/api/agents/memory/search`       | Buscar en memorias                   |
| GET    | `/api/agents/info`                | Info de agentes disponibles          |
| POST   | `/api/search/generate-embedding`  | Generar embedding                    |
| POST   | `/api/search/semantic`            | Búsqueda semántica de productos      |
| POST   | `/api/search/batch-index`         | Indexar productos en batch           |
| POST   | `/api/whatsapp/webhook`           | Webhook Meta WhatsApp                |

## Base de Datos (esquema `agents`)

Todas las tablas viven en el schema `agents` de PostgreSQL con extensión pgvector:

- `agent_conversations` — Log de interacciones con metadata de routing
- `agent_knowledge_documents` — Documentos RAG subidos
- `agent_knowledge_embeddings` — Vectores 1536-dim (RAG + memoria jerárquica)
- `artisan_global_profiles` — Perfil consolidado por artesano
- `user_onboarding_profiles` — Resultados de evaluación de madurez

Funciones SQL helper:
- `agents.search_agent_memory()` — Búsqueda vectorial en memoria
- `agents.search_agent_knowledge()` — Búsqueda vectorial en knowledge base

## Variables de Entorno Clave

| Variable                       | Descripción                                    |
|--------------------------------|------------------------------------------------|
| `OPENAI_API_KEY`               | API key OpenAI (requerida)                     |
| `OPENAI_MODEL`                 | Modelo LLM (default: gpt-4o)                   |
| `EMBEDDING_MODEL`              | Modelo embeddings (text-embedding-3-small)     |
| `AGENTS_DB_URL`                | PostgreSQL URL para schema agents              |
| `CATALOG_DB_URL`               | PostgreSQL URL para búsqueda semántica         |
| `TAVILY_API_KEY`               | Web search (agente pricing)                    |
| `LANGSMITH_API_KEY`            | Tracing LangSmith                              |
| `LANGSMITH_PROJECT`            | Nombre del proyecto en LangSmith               |
| `WHATSAPP_ACCESS_TOKEN`        | Token Meta (bot consumidor)                    |
| `WHATSAPP_PHONE_NUMBER_ID`     | Phone ID (bot consumidor)                      |
| `ARTISAN_WHATSAPP_ACCESS_TOKEN`| Token Meta (bot artesano/copiloto)             |
| `SENTRY_DSN`                   | DSN para error tracking                        |

## Convenciones de Código

- Agentes heredan de `BaseAgent` en `agents/base.py`
- Prompts como templates Jinja2 en `prompts/*.md.j2` — nunca hardcoded en Python
- Memoria jerárquica: conversational (corto plazo), profile (largo plazo), strategy (planes)
- Usar `asyncpg` para todas las queries a DB (no ORM)
- Configuración centralizada en `src/api/config.py` (pydantic Settings)
- Los flujos (flows) usan LangGraph state machines
- Logging estructurado con el logger de `src/utils/enhanced_logger.py`
