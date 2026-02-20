# Docker Setup Complete ✅

This document summarizes the Docker setup created for the GetInMotion project.

## What Was Created

### 1. Dockerfile for artisans-web
**Location:** `apps/artisans-web/Dockerfile`

- Multi-stage build using Node 20 Alpine
- Vite build with environment variable support
- Nginx serving static files
- Health check endpoint at `/health`

### 2. Nginx Configuration for artisans-web
**Location:** `apps/artisans-web/nginx.conf`

- Gzip compression enabled
- Security headers configured
- SPA routing support (all routes → index.html)
- Optimized caching for static assets
- Health check endpoint

### 3. Shared Source Code (apps/src/)
**Location:** `apps/src/`

Created a shared Python source folder that the agents service depends on:

```
apps/src/
├── api/
│   └── config.py              # Environment-based configuration
├── database/
│   └── supabase_client.py     # Supabase client singleton
├── services/
│   ├── embedding_service.py   # OpenAI embedding generation
│   ├── product_recommendation_service.py
│   └── shop_db_service.py     # Shop database operations
└── utils/
    ├── enhanced_logger.py     # Structured logging
    └── helpers.py             # General utility functions
```

**Why:** The agents service imports from `src.*` modules that didn't exist. These provide shared utilities, database clients, and services used across the agents.

### 4. Centralized Docker Compose
**Location:** `infra/dev/docker-compose.yml`

Orchestrates all services in a unified network:

- **postgres** (port 5432) - PostgreSQL database
- **api** (port 3040) - NestJS backend
- **agents** (port 8000) - Python/FastAPI agents service
- **artisans-web** (port 3000) - React artisans frontend
- **marketplace-web** (port 3001) - React marketplace frontend

All services share the `gim-network` bridge network and can communicate by service name.

### 5. Environment Configuration
**Location:** `infra/dev/.env.example` and `infra/dev/.env`

Comprehensive environment variables for all services:
- Database credentials
- API keys (OpenAI, Supabase, Tavily, Google Places)
- Service ports and configuration
- Feature flags and tuning parameters

### 6. Documentation
- **infra/dev/README.md** - Complete usage guide
- **apps/src/README.md** - Shared source code documentation
- **This file** - Setup summary

### 7. Setup Script
**Location:** `infra/dev/setup.sh`

Automated setup script that:
- Checks prerequisites (Docker, Docker Compose)
- Creates .env from example if missing
- Builds and starts all services
- Shows service status and URLs

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                     (gim-network)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Postgres   │  │   API (Nest) │  │    Agents    │  │
│  │   :5432      │◄─┤   :3040      │◄─┤   :8000      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ▲                 ▲                  ▲          │
│         │                 │                  │          │
│  ┌──────┴────────┐ ┌──────┴────────┐        │          │
│  │ Artisans Web  │ │ Marketplace   │        │          │
│  │   :3000       │ │ Web :3001     │        │          │
│  └───────────────┘ └───────────────┘        │          │
│                                              │          │
└──────────────────────────────────────────────┼──────────┘
                                               │
                                          (External)
                                         Supabase API
```

## Quick Start

### Option 1: Using the Setup Script (Recommended)

```bash
cd infra/dev
./setup.sh
```

### Option 2: Manual Setup

```bash
cd infra/dev

# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your API keys
nano .env  # or your preferred editor

# 3. Build and start services
docker-compose up -d --build

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
```

## Access the Services

Once running:

- **Artisans Web:** http://localhost:3000
- **Marketplace Web:** http://localhost:3001
- **API:** http://localhost:3040
- **Agents:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:3040/api
- **Agents Docs:** http://localhost:8000/docs

## Important Notes

### 1. Shared Source Code

The agents service now depends on a shared `apps/src/` folder. This folder contains:
- Configuration management
- Database clients (Supabase)
- Shared services (embeddings, products, shops)
- Utility functions

If you modify the agents service, you may need to update these shared modules.

### 2. Build Context

The agents service uses `apps/` as its build context (not `apps/agents/`). This allows it to access both:
- `agents/` - The agents service code
- `src/` - The shared source code

### 3. Environment Variables

Each service has its own set of environment variables in the `.env` file. Make sure to set:

**Critical:**
- `POSTGRES_PASSWORD` - Database password
- `PASSWORD_SECRET` - JWT secret (min 32 chars)
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_URL` and keys - Supabase configuration

**Optional but recommended:**
- `TAVILY_API_KEY` - For web search in agents
- `VITE_GOOGLE_PLACES_API_KEY` - For location autocomplete
- `LANGSMITH_API_KEY` - For agent tracing/monitoring

### 4. Database Initialization

The API service automatically runs database migrations on startup via the `docker-entrypoint.sh` script. The PostgreSQL service also runs `init-db.sql` on first startup.

### 5. Hot Reload / Development

For development, you may want to mount source code as volumes for hot reload:

```yaml
# Add to docker-compose.yml under the service
volumes:
  - ../../apps/api/src:/app/src  # API hot reload
  - ../../apps/agents:/app  # Agents hot reload
```

## Troubleshooting

### Services won't start

Check logs:
```bash
docker-compose logs [service-name]
```

### Port conflicts

Edit `.env` and change the port variables:
```
API_PORT=3040
AGENTS_PORT=8000
ARTISANS_WEB_PORT=3000
MARKETPLACE_WEB_PORT=3001
```

### Database connection errors

1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check that `HOST_DB=postgres` (not localhost) in `.env`

### Agents service import errors

If you see errors like `ModuleNotFoundError: No module named 'src'`:
1. Verify `apps/src/` folder exists
2. Check the build context in docker-compose is set to `../../apps`
3. Rebuild: `docker-compose up -d --build agents`

### Frontend build errors

If Vite builds fail:
1. Ensure all `VITE_*` variables are set in `.env`
2. Check for syntax errors in `.env`
3. Rebuild: `docker-compose up -d --build artisans-web`

## Maintenance Commands

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api

# Restart a service
docker-compose restart api

# Rebuild a service
docker-compose up -d --build api

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️  deletes database)
docker-compose down -v

# Access a service shell
docker-compose exec api sh
docker-compose exec agents sh

# Access database
docker-compose exec postgres psql -U postgres -d getinmotion

# Check resource usage
docker-compose stats
```

## Production Deployment

For production:

1. Update environment variables:
   - Set `NODE_ENV=production`
   - Set `ENVIRONMENT_PROJECT=production`
   - Use secure passwords and secrets
   - Update URLs to production domains

2. Consider using `infra/prod/docker-compose.yml` (if available)

3. Set up:
   - SSL/TLS certificates
   - Proper logging and monitoring
   - Automated backups for PostgreSQL
   - CI/CD pipeline
   - Health check endpoints

## Files Modified

### Created:
- `apps/artisans-web/Dockerfile` ✨
- `apps/artisans-web/nginx.conf` ✨
- `apps/src/**/*.py` ✨ (shared source code)
- `infra/dev/docker-compose.yml` ✨
- `infra/dev/.env` ✨
- `infra/dev/.env.example` ✨
- `infra/dev/README.md` ✨
- `infra/dev/setup.sh` ✨
- `apps/src/README.md` ✨
- `DOCKER_SETUP.md` (this file) ✨

### Modified:
- `apps/agents/Dockerfile` - Updated to use shared src/ folder and proper build context

## Next Steps

1. **Configure environment variables** in `infra/dev/.env`
2. **Run setup script** or manually start services
3. **Access the applications** via the URLs above
4. **Test the services** to ensure everything works
5. **Set up development workflow** (hot reload, debugging, etc.)

## Support

For issues or questions:
1. Check the service logs: `docker-compose logs -f [service-name]`
2. Review the README: `infra/dev/README.md`
3. Check the shared src documentation: `apps/src/README.md`

---

**Setup Date:** February 3, 2026  
**Services:** 5 (postgres, api, agents, artisans-web, marketplace-web)  
**Status:** ✅ Ready for development
