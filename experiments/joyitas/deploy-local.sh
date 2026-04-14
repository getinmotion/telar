#!/bin/bash

# ========================================
# Joyitas Deployment Script (Local Build)
# Build images locally instead of pulling from GHCR
# ========================================

set -e  # Exit on error

echo "🚀 Starting Joyitas deployment (local build)..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
# 2. Stop existing containers
# ----------------------------------------
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose -f docker-compose.local.yml down

# ----------------------------------------
# 3. Build images
# ----------------------------------------
echo -e "${YELLOW}🔨 Building images (this may take a while)...${NC}"
docker compose -f docker-compose.local.yml build --no-cache

# ----------------------------------------
# 4. Start new containers
# ----------------------------------------
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker compose -f docker-compose.local.yml up -d

# ----------------------------------------
# 5. Wait for services
# ----------------------------------------
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# ----------------------------------------
# 6. Check container status
# ----------------------------------------
echo -e "${YELLOW}📊 Container status:${NC}"
docker compose -f docker-compose.local.yml ps

# ----------------------------------------
# 7. Show logs
# ----------------------------------------
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker compose -f docker-compose.local.yml logs --tail=20

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
echo "  docker compose -f docker-compose.local.yml logs -f"
echo ""
echo "To stop services:"
echo "  docker compose -f docker-compose.local.yml down"
