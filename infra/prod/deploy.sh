#!/bin/bash
# ========================================
# GetInMotion — Production Deploy from GHCR
# Run this script on the production Lightsail instance
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}  GetInMotion — Production Deploy${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# ----------------------------------------
# Verify .env exists
# ----------------------------------------
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo -e "${RED}✗ .env file not found at $SCRIPT_DIR/.env${NC}"
  echo "  Run: cp .env.example .env && nano .env"
  exit 1
fi

source "$SCRIPT_DIR/.env"

IMAGE_TAG="${IMAGE_TAG:-main}"
echo -e "${GREEN}✓ Deploying image tag: ${IMAGE_TAG}${NC}"
echo ""

# ----------------------------------------
# Verify docker and compose are available
# ----------------------------------------
if ! command -v docker &>/dev/null; then
  echo -e "${RED}✗ Docker is not installed${NC}"
  exit 1
fi

if ! docker compose version &>/dev/null; then
  echo -e "${RED}✗ Docker Compose v2 is not available${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
echo -e "${GREEN}✓ Docker Compose $(docker compose version --short)${NC}"
echo ""

# ----------------------------------------
# Verify GHCR authentication
# ----------------------------------------
echo "Checking GHCR authentication..."
if ! docker pull ghcr.io/getinmotion/gim-api:"$IMAGE_TAG" --quiet > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠  Not authenticated to GHCR. Logging in...${NC}"
  echo ""
  echo "  You need a GitHub Personal Access Token with 'read:packages' scope."
  echo "  Generate one at: https://github.com/settings/tokens"
  echo ""
  read -rp "  GitHub username: " GH_USER
  read -rsp "  GitHub PAT (read:packages): " GH_PAT
  echo ""
  echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin
  echo -e "${GREEN}✓ Authenticated to GHCR${NC}"
else
  echo -e "${GREEN}✓ Already authenticated to GHCR${NC}"
fi

echo ""

# ----------------------------------------
# Pull latest images
# ----------------------------------------
echo -e "Pulling images with tag ${CYAN}${IMAGE_TAG}${NC}..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$SCRIPT_DIR/docker-compose.yml" pull
echo -e "${GREEN}✓ Images pulled${NC}"
echo ""

# ----------------------------------------
# Bring stack up
# ----------------------------------------
echo "Starting services..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d --remove-orphans
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# ----------------------------------------
# Wait a moment and show status
# ----------------------------------------
echo "Waiting for health checks..."
sleep 8

echo ""
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}  Services Status${NC}"
echo -e "${CYAN}=========================================${NC}"
docker compose -f "$SCRIPT_DIR/docker-compose.yml" ps

echo ""
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}  Useful Commands${NC}"
echo -e "${CYAN}=========================================${NC}"
echo "  Logs (all):        docker compose -f docker-compose.yml logs -f"
echo "  Logs (service):    docker compose -f docker-compose.yml logs -f api"
echo "  Restart service:   docker compose -f docker-compose.yml restart api"
echo "  Stop all:          docker compose -f docker-compose.yml down"
echo "  Pin to a SHA tag:  IMAGE_TAG=sha-a1b2c3d ./deploy.sh"
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
