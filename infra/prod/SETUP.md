# Production Server Setup Guide

This guide covers everything needed to get the production environment running end-to-end.

---

## Overview

| Component | Value |
|-----------|-------|
| Production server | `52.44.3.34` (AWS Lightsail) |
| Staging server | `52.7.98.126` (AWS Lightsail) |
| Database | Lightsail managed PostgreSQL (external, not a container) |
| Image registry | `ghcr.io/getinmotion/gim-*:main` |
| CI trigger | Push to `main` branch |
| Deploy gate | Manual approval (GitHub Environment: `production`) |

---

## Step 1 — GitHub Secrets

Go to **Repository → Settings → Secrets and variables → Actions → New repository secret** and add all of the following.

### Staging auto-deploy (SSH)

| Secret | Value |
|--------|-------|
| `SSH_STAGING_HOST` | `52.7.98.126` |
| `SSH_STAGING_USER` | `ubuntu` |
| `SSH_STAGING_KEY` | Contents of `~/.ssh/gha_staging` (private key, generated below) |

### Production build (VITE_* baked into images)

| Secret | Value |
|--------|-------|
| `PROD_VITE_SUPABASE_URL` | Production Supabase project URL |
| `PROD_VITE_SUPABASE_PUBLISHABLE_KEY` | Production Supabase publishable key |
| `PROD_VITE_SUPABASE_ANON_KEY` | Production Supabase anon key |
| `PROD_VITE_BACKEND_URL` | `https://api.yourdomain.com/telar/server` |
| `PROD_VITE_SEMANTIC_SEARCH_URL` | Production semantic search URL |
| `PROD_VITE_SEMANTIC_SEARCH_API_KEY` | Production semantic search API key |
| `PROD_VITE_GOOGLE_PLACES_API_KEY` | Production Google Places API key |
| `PROD_MARKETPLACE_VITE_SUPABASE_URL` | Production Supabase URL (marketplace) |
| `PROD_MARKETPLACE_VITE_SUPABASE_PUBLISHABLE_KEY` | Production Supabase publishable key (marketplace) |
| `PROD_MARKETPLACE_VITE_SEMANTIC_SEARCH_API_URL` | Production semantic search URL (marketplace) |
| `PROD_MARKETPLACE_VITE_SEMANTIC_SEARCH_API_KEY` | Production semantic search API key (marketplace) |

### Production auto-deploy (SSH)

| Secret | Value |
|--------|-------|
| `SSH_PROD_HOST` | `52.44.3.34` |
| `SSH_PROD_USER` | `ubuntu` |
| `SSH_PROD_KEY` | Contents of `~/.ssh/gha_prod` (private key, generated below) |

---

## Step 2 — GitHub Environment (Manual Approval Gate)

1. Go to **Repository → Settings → Environments → New environment**
2. Name it exactly: `production`
3. Under **Deployment protection rules**, enable **Required reviewers**
4. Add yourself (and any other approvers)
5. Save

When the production workflow runs, the `deploy-prod` job will pause and send you an approval notification before deploying to the server.

---

## Step 3 — SSH Keys (one-time setup)

Generate dedicated deploy keys on your local machine:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gha_staging -C "github-actions-staging" -N ""
ssh-keygen -t ed25519 -f ~/.ssh/gha_prod    -C "github-actions-prod"    -N ""
```

Add the **public** keys to each server's `authorized_keys`:

```bash
# Staging server
ssh ubuntu@52.7.98.126 "echo '$(cat ~/.ssh/gha_staging.pub)' >> ~/.ssh/authorized_keys"

# Production server
ssh ubuntu@52.44.3.34 "echo '$(cat ~/.ssh/gha_prod.pub)' >> ~/.ssh/authorized_keys"
```

Add the **private** key contents as GitHub Secrets:

```bash
cat ~/.ssh/gha_staging   # → paste as SSH_STAGING_KEY
cat ~/.ssh/gha_prod      # → paste as SSH_PROD_KEY
```

---

## Step 4 — Production Server: Initial Setup

SSH into the production server (`52.44.3.34`) and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
# Log out and back in for group to apply

# Clone the repo
git clone https://github.com/getinmotion/telar.git ~/telar

# Set up environment
cp ~/telar/infra/prod/.env.example ~/telar/infra/prod/.env
nano ~/telar/infra/prod/.env
# Fill in all values (Lightsail DB endpoint, secrets, etc.)

# Make deploy script executable
chmod +x ~/telar/infra/prod/deploy.sh
```

---

## Step 5 — Lightsail Managed PostgreSQL

1. In AWS Lightsail, go to **Databases** → create a PostgreSQL instance
2. Note the **Endpoint** (e.g. `ls-xxxx.xxxx.us-east-1.rds.amazonaws.com`)
3. In the Lightsail console, add the **production server's private IP** to the database's allowed connections
4. Update `~/telar/infra/prod/.env` on the server:
   ```
   HOST_DB=ls-xxxx.xxxx.us-east-1.rds.amazonaws.com
   PORT_DB=5432
   USER_DB=dbadmin
   PASS_DB=your_lightsail_db_password
   NAME_DB=getinmotion
   ```

---

## Step 6 — Nginx + HTTPS

On the production server (`52.44.3.34`):

```bash
# Install Nginx and Certbot
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Copy the Nginx config
sudo cp ~/telar/infra/prod/nginx.conf /etc/nginx/sites-available/telar
sudo ln -s /etc/nginx/sites-available/telar /etc/nginx/sites-enabled/telar
sudo rm -f /etc/nginx/sites-enabled/default

# Replace placeholder domain with your actual domain
sudo sed -i 's/yourdomain.com/ACTUAL_DOMAIN.com/g' /etc/nginx/sites-available/telar

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

**DNS setup** — In your DNS provider, create A records for all subdomains pointing to `52.44.3.34`:

```
api.yourdomain.com        → 52.44.3.34
artisans.yourdomain.com   → 52.44.3.34
marketplace.yourdomain.com → 52.44.3.34
agents.yourdomain.com     → 52.44.3.34
payment.yourdomain.com    → 52.44.3.34
```

Wait for DNS propagation (~5 minutes to 1 hour), then obtain SSL certificates:

```bash
sudo certbot --nginx \
  -d api.yourdomain.com \
  -d artisans.yourdomain.com \
  -d marketplace.yourdomain.com \
  -d agents.yourdomain.com \
  -d payment.yourdomain.com
```

Certbot auto-renews certificates via a systemd timer — no manual renewal needed.

---

## Step 7 — Google OAuth (Production)

In [Google Cloud Console](https://console.cloud.google.com):

1. Go to **APIs & Services → Credentials → OAuth 2.0 Client IDs**
2. Add `https://api.yourdomain.com/telar/server/auth/google/callback` as an **Authorized redirect URI**
3. Update `GOOGLE_CALLBACK_URL` in `~/telar/infra/prod/.env` on the server

---

## Step 8 — First Deployment

Once the server is set up:

```bash
cd ~/telar/infra/prod
./deploy.sh
```

Or trigger the GitHub Actions workflow manually:

1. GitHub → Actions → **Build & Push Images to GHCR (Production)**
2. Click **Run workflow** → select `main` branch → **Run workflow**
3. After builds succeed, an approval notification will appear
4. Click **Review deployments** → **Approve and deploy**

---

## Testing / Verification Checklist

### 1. Staging auto-deploy

Push any small change to a file in `apps/api/**` on `develop`.

- GitHub Actions → `Build & Push Images to GHCR` → `deploy-staging` job SSHs in and deploys automatically
- On staging: `docker ps` → all containers running; `docker logs gim-api` → no errors

### 2. Production build + approval gate

Merge `develop` → `main` via Pull Request.

- GitHub Actions → `Build & Push Images to GHCR (Production)` → all 5 build jobs run
- Approval notification appears → click **Review deployments** → **Approve**
- `deploy-prod` job SSHs into `52.44.3.34` and runs `docker compose up -d`

### 3. Service health checks

**Staging (direct IP):**

```bash
curl http://52.7.98.126:3040/telar/server/health   # API
curl http://52.7.98.126:8000/health                 # Agents
curl http://52.7.98.126:8090/health                 # Payment
curl http://52.7.98.126:3000                        # Artisans-web
curl http://52.7.98.126:3001                        # Marketplace-web
```

**Production (via Nginx/HTTPS):**

```bash
curl https://api.yourdomain.com/telar/server/health
curl https://marketplace.yourdomain.com
curl https://artisans.yourdomain.com
```

### 4. Database connection on production

```bash
ssh ubuntu@52.44.3.34
docker logs gim-api
# Expected: "PostgreSQL is ready!" and "No migrations are pending"
```

### 5. CDN / image storage

Log in to the marketplace, open a product with an image → check the Network tab in browser devtools → images should load from `telar-prod-bucket.s3.us-east-1.amazonaws.com`.

### 6. Google OAuth

Visit `https://artisans.yourdomain.com` → click **Login with Google** → should redirect back correctly after auth.

### 7. Roll back to a specific SHA

If a deployment needs to be rolled back:

```bash
ssh ubuntu@52.44.3.34
cd ~/telar/infra/prod
IMAGE_TAG=sha-XXXXXXX docker compose up -d api
```

Replace `sha-XXXXXXX` with the short SHA from the GHCR package tags or GitHub Actions run.
