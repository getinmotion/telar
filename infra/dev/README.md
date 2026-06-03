# GetInMotion Development Environment

Docker Compose setup for running all GetInMotion services locally.

## Services

This setup includes all four main services:

1. **PostgreSQL** (`postgres`) - Database server on port `5432`
2. **API** (`api`) - NestJS backend on port `3040`
3. **Agents** (`agents`) - Python/FastAPI agents service on port `8000`
4. **Artisans Web** (`artisans-web`) - React frontend on port `3000`
5. **Marketplace Web** (`marketplace-web`) - React frontend on port `3001`

## Quick Start

### 1. Configure Environment Variables

Copy the example `.env` file and update it with your actual values:

```bash
cd infra/dev
cp .env.example .env
# Edit .env with your actual API keys and secrets
```

**Important values to update:**
- `POSTGRES_PASSWORD` - Set a secure password
- `PASSWORD_SECRET` - JWT secret (at least 32 characters)
- `OPENAI_API_KEY` - Your OpenAI API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` - Your Supabase public keys
- `TAVILY_API_KEY` - Tavily API key for web search
- `VITE_GOOGLE_PLACES_API_KEY` - Google Places API key

### 2. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Or build and start in one command
docker-compose up -d --build
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f agents
docker-compose logs -f artisans-web
docker-compose logs -f marketplace-web
```

### 4. Check Service Health

```bash
# Check all containers
docker-compose ps

# API health
curl http://localhost:3040/health

# Agents health
curl http://localhost:8000/health

# Artisans Web health
curl http://localhost:3000/health

# Marketplace Web health
curl http://localhost:3001/health
```

## Service URLs

Once running, access the services at:

- **Artisans Web**: http://localhost:3000
- **Marketplace Web**: http://localhost:3001
- **API**: http://localhost:3040
- **Agents**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## Development Workflow

### Restart a Service

```bash
docker-compose restart api
docker-compose restart agents
docker-compose restart artisans-web
docker-compose restart marketplace-web
```

### Rebuild a Service

If you make changes to a Dockerfile or need to rebuild:

```bash
docker-compose up -d --build api
docker-compose up -d --build agents
docker-compose up -d --build artisans-web
docker-compose up -d --build marketplace-web
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (caution: this deletes the database)
docker-compose down -v
```

### Access Service Shell

```bash
# API (NestJS)
docker-compose exec api sh

# Agents (Python)
docker-compose exec agents sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d getinmotion
```

## Database Management

### Run Migrations

The API service automatically runs migrations on startup via the `docker-entrypoint.sh` script.

To run migrations manually:

```bash
docker-compose exec api npm run migration:run
```

### Access Database

```bash
# Via docker-compose
docker-compose exec postgres psql -U postgres -d getinmotion

# Via local client
psql -h localhost -p 5432 -U postgres -d getinmotion
```

## Troubleshooting

### Service won't start

Check logs for the specific service:
```bash
docker-compose logs service-name
```

### Database connection issues

1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection string in `.env` uses `HOST_DB=postgres`

### Frontend build issues

If Vite build fails due to missing environment variables:

1. Ensure all `VITE_*` variables are set in `.env`
2. Rebuild the service:
   ```bash
   docker-compose up -d --build artisans-web
   # or
   docker-compose up -d --build marketplace-web
   ```

### Port conflicts

If ports are already in use, update the port mappings in `.env`:
- `API_PORT`
- `AGENTS_PORT`
- `ARTISANS_WEB_PORT`
- `MARKETPLACE_WEB_PORT`

## Network

All services communicate through the `gim-network` bridge network. Services can reference each other by their service name:

- API can reach Agents at `http://agents:8000`
- Agents can reach API at `http://api:3040`
- Both can reach PostgreSQL at `postgres:5432`

## Production Deployment

For production deployment, see `infra/prod/docker-compose.yml` (if available) or adjust the following in `.env`:

- Set `NODE_ENV=production`
- Set `ENVIRONMENT_PROJECT=production`
- Update all URLs to production domains
- Use secure secrets and passwords
- Configure proper SSL/TLS
- Set up proper backups for PostgreSQL

## Additional Commands

```bash
# View resource usage
docker-compose stats

# Remove unused images/volumes
docker system prune -a

# Export database backup
docker-compose exec postgres pg_dump -U postgres getinmotion > backup.sql

# Restore database backup
docker-compose exec -T postgres psql -U postgres getinmotion < backup.sql
```
