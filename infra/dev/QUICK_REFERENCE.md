# Docker Quick Reference

## 🚀 Quick Start

```bash
cd infra/dev
cp .env.example .env    # Edit with your keys
./setup.sh              # Automated setup
```

## 📋 Common Commands

### Start Services
```bash
docker-compose up -d              # Start all
docker-compose up -d api          # Start specific
docker-compose up -d --build      # Rebuild and start
```

### Stop Services
```bash
docker-compose down               # Stop all
docker-compose stop api           # Stop specific
docker-compose down -v            # Stop + delete volumes ⚠️
```

### View Logs
```bash
docker-compose logs -f            # All services
docker-compose logs -f api        # Specific service
docker-compose logs --tail=100 api # Last 100 lines
```

### Service Management
```bash
docker-compose ps                 # Status
docker-compose restart api        # Restart
docker-compose up -d --build api  # Rebuild
docker-compose exec api sh        # Shell access
```

### Database
```bash
docker-compose exec postgres psql -U postgres -d getinmotion
docker-compose exec api npm run migration:run
```

## 🔗 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Artisans Web | http://localhost:3000 | 3000 |
| Marketplace Web | http://localhost:3001 | 3001 |
| API | http://localhost:3040 | 3040 |
| Agents | http://localhost:8000 | 8000 |
| PostgreSQL | localhost:5432 | 5432 |

## 🐛 Troubleshooting

### Check Service Health
```bash
docker-compose ps
curl http://localhost:3040/health  # API
curl http://localhost:8000/health  # Agents
curl http://localhost:3000/health  # Artisans Web
```

### View Service Logs
```bash
docker-compose logs -f [service-name]
```

### Rebuild Problem Service
```bash
docker-compose up -d --build [service-name]
```

### Database Issues
```bash
# Check database is running
docker-compose ps postgres

# Access database
docker-compose exec postgres psql -U postgres -d getinmotion

# Check connection from API
docker-compose exec api node -e "console.log(process.env.HOST_DB)"
```

### Clean Start
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📝 Environment Variables

Edit `infra/dev/.env`:

**Required:**
- `POSTGRES_PASSWORD`
- `PASSWORD_SECRET` (min 32 chars)
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BACKEND_URL`

## 🔧 Development

### Hot Reload
Add to docker-compose.yml under service:
```yaml
volumes:
  - ../../apps/api/src:/app/src
```

### View Resource Usage
```bash
docker-compose stats
```

### Access Container Shell
```bash
docker-compose exec api sh      # API (NestJS)
docker-compose exec agents sh   # Agents (Python)
```

## 📦 Services Overview

| Service | Type | Language | Port |
|---------|------|----------|------|
| postgres | Database | PostgreSQL | 5432 |
| api | Backend | NestJS/TypeScript | 3040 |
| agents | AI Agents | Python/FastAPI | 8000 |
| artisans-web | Frontend | React/Vite | 3000 |
| marketplace-web | Frontend | React/Vite | 3001 |

## 🌐 Network

All services communicate via `gim-network`:
- Services reference each other by name
- Example: API connects to `postgres:5432`
- Example: Frontend connects to `http://api:3040`

## 📚 More Info

- Full guide: `infra/dev/README.md`
- Setup summary: `DOCKER_SETUP.md`
- Shared source: `apps/src/README.md`
