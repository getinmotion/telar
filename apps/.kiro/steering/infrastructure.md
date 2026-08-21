---
inclusion: manual
---

# Infrastructure Overview - Telar Platform

## 📁 Directory Structure

```
infra/
├── dev/              # Development environment (Docker Compose)
├── prod/             # Production environment (AWS Lightsail)
└── experiments/      # Experimental configurations
```

---

## 🏗️ Architecture Overview

### **Environments**

| Environment | Purpose | Database | Deployment |
|------------|---------|----------|------------|
| **Development** | Local Docker Compose | PostgreSQL container (pgvector/pg15) | Pull images from GHCR `develop` branch |
| **Staging** | AWS Lightsail `52.7.98.126` | Lightsail PostgreSQL | Auto-deploy on push to `develop` |
| **Production** | AWS Lightsail `52.44.3.34` | Lightsail PostgreSQL | Manual approval on merge to `main` |

### **Services Stack**

1. **API** (NestJS) - Port 3040
2. **Agents** (Python/FastAPI) - Port 8000
3. **Payment Service** (Go) - Port 8090
4. **Artisans Web** (React/Vite) - Port 3000
5. **Marketplace Web** (React/Vite) - Port 3001

---

## 🐳 Development Environment (`infra/dev/`)

### **Quick Start**

```bash
cd infra/dev

# Setup environment
cp .env.example .env
# Edit .env with actual values

# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Key Files**

- `docker-compose.yml` - Service orchestration (PostgreSQL + all 5 services)
- `.env.example` - Template for environment variables
- `deploy.sh` - Deployment script
- `setup.sh` - Initial setup script
- `README.md` - Detailed setup guide

### **Service URLs (Local)**

- Artisans Web: http://localhost:3000
- Marketplace Web: http://localhost:3001
- API: http://localhost:3040
- Agents: http://localhost:8000
- Payment: http://localhost:8090
- PostgreSQL: localhost:5432

### **Database**

- **Image**: `pgvector/pgvector:pg15` (includes vector extension for embeddings)
- **Volume**: `gim-postgres-data` (persistent storage)
- **Migrations**: Auto-run on API container startup via `docker-entrypoint.sh`

### **Development Workflow**

```bash
# Restart a specific service
docker-compose restart api

# Rebuild after code changes
docker-compose up -d --build api

# Access service shell
docker-compose exec api sh
docker-compose exec agents sh

# Database access
docker-compose exec postgres psql -U postgres -d getinmotion

# Run migrations manually
docker-compose exec api npm run migration:run
```

---

## 🚀 Production Environment (`infra/prod/`)

### **Infrastructure**

| Component | Details |
|-----------|---------|
| **Server** | AWS Lightsail `52.44.3.34` |
| **Database** | Lightsail managed PostgreSQL (external, not containerized) |
| **MongoDB** | MongoDB Atlas (external, for CMS) |
| **Image Registry** | GitHub Container Registry (GHCR) |
| **Reverse Proxy** | Nginx on host (handles SSL/TLS) |
| **SSL Certificates** | Let's Encrypt via Certbot (auto-renewal) |

### **Domains**

All domains point to `52.44.3.34`:

- `api.telar.co` → API service (NestJS)
- `artisans.telar.co` → Artisans Web
- `marketplace.telar.co` → Marketplace Web
- `agents.telar.co` → Agents service
- `payment.telar.co` → Payment service

### **Deployment Process**

```bash
# On production server
cd ~/telar/infra/prod
./deploy.sh

# This runs:
# 1. git pull origin main
# 2. docker compose pull (fetch latest images from GHCR)
# 3. docker compose up -d (restart services)
```

### **CI/CD Pipeline**

**Trigger**: Push to `main` branch

**Workflow** (`.github/workflows/build-and-push-prod.yml`):
1. Build 5 Docker images (api, agents, payment-svc, artisans-web, marketplace-web)
2. Push to GHCR with tags: `main` and `sha-XXXXXXX`
3. **Manual approval gate** (GitHub Environment: `production`)
4. SSH into `52.44.3.34` and run `deploy.sh`

**Staging Auto-Deploy**:
- Push to `develop` → auto-deploy to `52.7.98.126` (no approval needed)

### **Port Binding**

Services bind to `127.0.0.1` (localhost only). Nginx handles public traffic:

```yaml
ports:
  - "127.0.0.1:3040:3040"  # API
  - "127.0.0.1:8000:8000"  # Agents
  - "127.0.0.1:8090:8090"  # Payment
  - "127.0.0.1:3000:80"    # Artisans Web
  - "127.0.0.1:3001:80"    # Marketplace Web
```

### **Nginx Configuration**

Located at: `/etc/nginx/sites-available/telar`

**Key features**:
- SSL/TLS termination (Let's Encrypt certificates)
- Reverse proxy to Docker containers
- WebSocket support for real-time features
- Rate limiting on `/auth/register`
- CORS headers

**SSL Certificate Management**:

```bash
# Obtain certificates (first time)
sudo certbot --nginx \
  -d api.telar.co \
  -d artisans.telar.co \
  -d marketplace.telar.co \
  -d agents.telar.co \
  -d payment.telar.co

# Auto-renewal via systemd timer (no manual action needed)
sudo systemctl status certbot.timer
```

---

## 🔐 Environment Variables

### **Critical Variables**

**Database (PostgreSQL)**:
```bash
HOST_DB=ls-xxx.us-east-1.rds.amazonaws.com  # Lightsail RDS endpoint
PORT_DB=5432
USER_DB=dbtelarprod
PASS_DB=<secure_password>
NAME_DB=getinmotion
```

**Security**:
```bash
PASSWORD_SECRET=<jwt_secret_32+_chars>
SESSION_SECRET=<session_secret>
ENCRYPTION_KEY=<encryption_key_32_chars>
```

**OpenAI**:
```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
```

**AWS S3 (File Storage)**:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=telar-prod-bucket
AWS_REGION=us-east-1
```

**Payment Gateways**:
```bash
# Cobre
COBRE_API_KEY=...
COBRE_API_SECRET=...
COBRE_BALANCE_ID=...

# Wompi
WOMPI_PUB_KEY=pub_prod_...
WOMPI_PRIVATE_KEY=prv_prod_...
WOMPI_EVENTS_SECRET=...
```

**MongoDB Atlas (CMS)**:
```bash
MONGO_PROTOCOL=mongodb+srv
MONGO_USER=telar_user
MONGO_PASS=<password>
MONGO_HOST=cluster0.mongodb.net
MONGO_NAME=telar_cms
```

**Google OAuth**:
```bash
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_CALLBACK_URL=https://api.telar.co/telar/server/auth/google/callback
```

**Frontend URLs** (baked into images at build time):
```bash
VITE_BACKEND_URL=https://api.telar.co/telar/server
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 🛠️ Common Operations

### **View Logs**

```bash
# All services
docker compose logs -f

# Specific service
docker logs gim-api -f --tail 100
docker logs gim-agents -f --tail 100
```

### **Check Service Health**

```bash
# Production (via Nginx)
curl https://api.telar.co/telar/server/health
curl https://artisans.telar.co
curl https://marketplace.telar.co

# Direct container health
docker ps
docker inspect gim-api | grep -A 10 Health
```

### **Restart a Service**

```bash
cd ~/telar/infra/prod
docker compose restart api
docker compose restart agents
```

### **Rollback to Previous Version**

```bash
# Find the previous SHA from GHCR or GitHub Actions
cd ~/telar/infra/prod
IMAGE_TAG=sha-abc1234 docker compose up -d api
```

### **Database Operations**

```bash
# Connect to production database
psql -h ls-xxx.us-east-1.rds.amazonaws.com \
  -U dbtelarprod \
  -d getinmotion

# Backup production database
pg_dump -h ls-xxx.us-east-1.rds.amazonaws.com \
  -U dbtelarprod \
  -d getinmotion \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Restore to local
pg_restore -h localhost \
  -U postgres \
  -d getinmotion \
  --no-owner --no-acl \
  backup_20260806.dump
```

### **Update Environment Variables**

```bash
# On production server
cd ~/telar/infra/prod
nano .env
# Make changes

# Restart affected services
docker compose up -d api  # Only restarts if config changed
```

---

## 🔍 Troubleshooting

### **Container Won't Start**

```bash
# Check logs
docker logs gim-api --tail 100

# Check if port is already in use
sudo netstat -tulpn | grep 3040

# Restart with fresh pull
docker compose pull api
docker compose up -d api
```

### **Database Connection Issues**

1. **Check Lightsail security group**: Ensure production server's IP is whitelisted
2. **Verify credentials** in `.env`
3. **Test connection directly**:
   ```bash
   psql -h $HOST_DB -U $USER_DB -d $NAME_DB -c "SELECT 1"
   ```

### **SSL Certificate Issues**

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal (if needed)
sudo certbot renew --force-renewal

# Nginx reload after cert renewal
sudo systemctl reload nginx
```

### **Image Pull Failures**

```bash
# Check GHCR authentication
docker login ghcr.io -u getinmotion

# Manually pull image
docker pull ghcr.io/getinmotion/gim-api:main

# Check GitHub Actions for build failures
```

---

## 📊 Monitoring & Health Checks

### **Service Health Endpoints**

- API: `/telar/server/health` or `/health`
- Agents: `/health`
- Payment: `/health`
- Frontend apps: `/health` (Nginx injects this)

### **Docker Health Checks**

All services have health checks configured in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

Check status:
```bash
docker ps  # Shows (healthy) or (unhealthy)
docker inspect gim-api | grep -A 10 Health
```

---

## 🔒 Security Considerations

1. **Secrets Management**: All secrets in `.env` files (not committed to git)
2. **Port Binding**: Production services bind to `127.0.0.1` only
3. **Nginx Rate Limiting**: Applied to auth endpoints
4. **SSL/TLS**: Enforced via Nginx (Let's Encrypt certificates)
5. **Database**: Lightsail PostgreSQL with restricted access
6. **CORS**: Configured per environment

---

## 📚 Key Documentation Files

- `infra/dev/README.md` - Development setup guide
- `infra/dev/QUICK_REFERENCE.md` - Quick command reference
- `infra/prod/SETUP.md` - Production setup from scratch
- `infra/prod/FIX_SSL_INSTRUCTIONS.md` - SSL troubleshooting
- `.github/workflows/build-and-push.yml` - Staging CI/CD
- `.github/workflows/build-and-push-prod.yml` - Production CI/CD

---

## 🎯 Quick Reference Commands

### **Development**

```bash
# Start
cd infra/dev && docker-compose up -d

# Logs
docker-compose logs -f api

# Stop
docker-compose down
```

### **Production Deploy**

```bash
# Via CI/CD (recommended)
git push origin main
# Then approve in GitHub UI

# Manual
ssh ubuntu@52.44.3.34
cd ~/telar/infra/prod
./deploy.sh
```

### **Staging Deploy**

```bash
# Auto-deploys on push to develop
git push origin develop
```

---

## 🔄 Network Architecture

**Docker Network**: `gim-network` (bridge driver)

**Service Communication**:
- API → Agents: `http://agents:8000`
- API → Payment: `http://payment-svc:8090`
- Frontend → API: Via Nginx reverse proxy (in prod) or direct port (in dev)

**External Dependencies**:
- PostgreSQL (Lightsail RDS)
- MongoDB Atlas (CMS)
- AWS S3 (file storage)
- OpenAI API
- Payment gateways (Cobre, Wompi)
- Google OAuth

---

## 📝 Notes

- **Frontend builds**: `VITE_*` variables are baked into images at CI build time
- **Image tags**: `main` (prod), `develop` (staging), `sha-XXXXXXX` (specific commit)
- **Database migrations**: Auto-run by API service on startup
- **Volume persistence**: PostgreSQL data persists in `gim-postgres-data` volume (dev only)
- **Nginx config**: Lives on host at `/etc/nginx/sites-available/telar` (not in repo)

---

## 🚨 Emergency Procedures

### **Rollback Production**

```bash
ssh ubuntu@52.44.3.34
cd ~/telar/infra/prod

# Find previous working SHA from GitHub Actions
IMAGE_TAG=sha-abc1234 docker compose up -d

# Or rollback git repo
git log --oneline -10  # Find last working commit
git checkout <commit-sha>
./deploy.sh
```

### **Stop All Services**

```bash
cd ~/telar/infra/prod
docker compose down
```

### **Database Emergency Backup**

```bash
pg_dump -h $HOST_DB -U $USER_DB -d $NAME_DB \
  -F c -Z 9 \
  -f emergency_backup_$(date +%Y%m%d_%H%M%S).dump
```
