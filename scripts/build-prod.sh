#!/bin/bash
# Production Build Script
# Builds the unified Docker image with frontend and backend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building Production Docker Image${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${YELLOW}Warning: .env.prod not found${NC}"
    echo -e "${YELLOW}Creating from .env.prod.example...${NC}"
    cp .env.prod.example .env.prod
    echo -e "${RED}Please update .env.prod with your production values!${NC}"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.prod | xargs)

# Build the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build \
    --build-arg VITE_API_URL="${VITE_API_URL:-/api}" \
    -t wiki-app:latest \
    -t wiki-app:$(date +%Y%m%d_%H%M%S) \
    -f Dockerfile \
    .

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Image tagged as:"
echo "  - wiki-app:latest"
echo "  - wiki-app:$(date +%Y%m%d_%H%M%S)"
echo ""
echo "Next steps:"
echo "  1. Test locally: ./scripts/run-prod.sh"
echo "  2. Push to registry: docker push your-registry/wiki-app:latest"
echo "  3. Deploy to server"
echo ""
