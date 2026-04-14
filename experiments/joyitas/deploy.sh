#!/bin/bash

# ========================================
# Joyitas Deployment Script
# Deploy API + Marketplace-Web to telar.store
# ========================================

set -e  # Exit on error

echo "🚀 Starting Joyitas deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ----------------------------------------
# 1. Check prerequisites
# ----------------------------------------
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# ----------------------------------------
# 2. Login to GitHub Container Registry
# ----------------------------------------
echo -e "${YELLOW}🔐 Logging into GHCR...${NC}"

if [ -z "$GITHUB_PAT" ]; then
    echo -e "${YELLOW}⚠️  GITHUB_PAT not set. You may need to login manually:${NC}"
    echo "  echo \$GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin"
    read -p "Press Enter to continue or Ctrl+C to abort..."
else
    echo "$GITHUB_PAT" | docker login ghcr.io -u $(whoami) --password-stdin
    echo -e "${GREEN}✅ Logged into GHCR${NC}"
fi

# ----------------------------------------
# 3. Pull latest images
# ----------------------------------------
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker compose pull

# ----------------------------------------
# 4. Stop existing containers
# ----------------------------------------
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# ----------------------------------------
# 5. Start new containers
# ----------------------------------------
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker compose up -d

# ----------------------------------------
# 6. Wait for health checks
# ----------------------------------------
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# ----------------------------------------
# 7. Check container status
# ----------------------------------------
echo -e "${YELLOW}📊 Container status:${NC}"
docker compose ps

# ----------------------------------------
# 8. Show logs
# ----------------------------------------
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker compose logs --tail=20

# ----------------------------------------
# Done!
# ----------------------------------------
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services running:"
echo "  🌐 Marketplace: https://telar.store"
echo "  🔌 API:         https://api.telar.store"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop services:"
echo "  docker compose down"
