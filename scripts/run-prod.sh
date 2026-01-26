#!/bin/bash
# Production Run Script
# Runs the production environment with Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Starting Production Environment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${RED}Error: .env.prod not found${NC}"
    echo "Please create .env.prod from .env.prod.example"
    exit 1
fi

# Start services
echo -e "${GREEN}Starting services...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Wait for database to be ready
echo ""
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.prod exec app bun run db:migrate

# Show status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Production Environment Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application: http://localhost:${APP_PORT:-3000}"
echo "API: http://localhost:${APP_PORT:-3000}/api"
echo "Health: http://localhost:${APP_PORT:-3000}/health"
echo ""
echo "Useful commands:"
echo "  View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop: docker compose -f docker-compose.prod.yml down"
echo "  Shell: docker compose -f docker-compose.prod.yml exec app sh"
echo ""
