#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Wiki Application - Quick Start"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start services
echo "📦 Starting services with Docker Compose..."
cd "$PROJECT_ROOT"
docker compose -f docker/docker-compose.yml up -d --build

echo ""
echo "⏳ Waiting for services to start (5 seconds)..."
sleep 5

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker exec wiki-backend bun run db:migrate

# Seed database
echo ""
echo "🌱 Seeding database..."
docker exec wiki-backend bun run db:seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "📍 Application URLs:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   Database:  localhost:5433"
echo ""
echo "🔐 Default credentials:"
echo "   Email:     admin@wiki-app.com"
echo "   Password:  admin123"
echo ""
echo "⚠️  Please change the password after first login!"
echo ""
echo "📖 View logs: docker compose -f docker/docker-compose.yml logs -f"
echo "🛑 Stop services: docker compose -f docker/docker-compose.yml down"
echo ""
