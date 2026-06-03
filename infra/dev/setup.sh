#!/bin/bash
# ========================================
# GetInMotion Development Setup Script
# ========================================

set -e

echo "========================================="
echo "GetInMotion Development Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys and secrets before continuing${NC}"
    echo ""
    read -p "Press enter to continue after editing .env, or Ctrl+C to exit..."
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

echo ""
echo "Checking prerequisites..."

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

echo ""
echo "Building and starting services..."
echo ""

# Build and start services
docker-compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 5

echo ""
echo "========================================="
echo "Services Status"
echo "========================================="
docker-compose ps

echo ""
echo "========================================="
echo "Service URLs"
echo "========================================="
echo -e "${GREEN}Artisans Web:${NC}    http://localhost:3000"
echo -e "${GREEN}Marketplace Web:${NC} http://localhost:3001"
echo -e "${GREEN}API:${NC}             http://localhost:3040"
echo -e "${GREEN}Agents:${NC}          http://localhost:8000"
echo -e "${GREEN}PostgreSQL:${NC}      localhost:5432"
echo ""

echo "========================================="
echo "Useful Commands"
echo "========================================="
echo "View logs:           docker-compose logs -f"
echo "View specific logs:  docker-compose logs -f [service-name]"
echo "Stop services:       docker-compose down"
echo "Restart service:     docker-compose restart [service-name]"
echo "Rebuild service:     docker-compose up -d --build [service-name]"
echo ""

echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
