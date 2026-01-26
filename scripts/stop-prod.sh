#!/bin/bash
# Stop Production Environment

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Stopping production environment...${NC}"

docker compose -f docker-compose.prod.yml --env-file .env.prod down

echo -e "${GREEN}Production environment stopped.${NC}"
echo ""
echo "To remove volumes (⚠️  will delete data):"
echo "  docker compose -f docker-compose.prod.yml --env-file .env.prod down -v"
echo ""
