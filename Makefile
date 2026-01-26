# Makefile for Wiki-Bun Docker Operations
.PHONY: help build up down restart logs clean dev prod migrate seed backup

# Default target
.DEFAULT_GOAL := help

# Environment file
ENV_FILE := .env.docker

## help: Display this help message
help:
	@echo "Wiki-Bun Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

## build: Build all Docker images
build:
	docker compose --env-file $(ENV_FILE) build

## build-nc: Build all images without cache
build-nc:
	docker compose --env-file $(ENV_FILE) build --no-cache

## up: Start all services
up:
	docker compose --env-file $(ENV_FILE) up -d

## up-build: Build and start all services
up-build:
	docker compose --env-file $(ENV_FILE) up -d --build

## down: Stop all services
down:
	docker compose --env-file $(ENV_FILE) down

## down-v: Stop all services and remove volumes
down-v:
	docker compose --env-file $(ENV_FILE) down -v

## restart: Restart all services
restart:
	docker compose --env-file $(ENV_FILE) restart

## logs: View logs for all services
logs:
	docker compose --env-file $(ENV_FILE) logs -f

## logs-backend: View backend logs
logs-backend:
	docker compose --env-file $(ENV_FILE) logs -f backend

## logs-frontend: View frontend logs
logs-frontend:
	docker compose --env-file $(ENV_FILE) logs -f frontend

## logs-db: View database logs
logs-db:
	docker compose --env-file $(ENV_FILE) logs -f database

## ps: List all containers
ps:
	docker compose --env-file $(ENV_FILE) ps

## stats: Show container resource usage
stats:
	docker stats wiki-backend wiki-frontend wiki-database

## shell-backend: Access backend shell
shell-backend:
	docker compose --env-file $(ENV_FILE) exec backend sh

## shell-frontend: Access frontend shell
shell-frontend:
	docker compose --env-file $(ENV_FILE) exec frontend sh

## shell-db: Access database shell
shell-db:
	docker compose --env-file $(ENV_FILE) exec database psql -U postgres -d wikidb

## migrate: Run database migrations
migrate:
	docker compose --env-file $(ENV_FILE) exec backend bun run db:migrate

## seed: Seed database with initial data
seed:
	docker compose --env-file $(ENV_FILE) exec backend bun run db:seed

## backup: Backup database
backup:
	@mkdir -p backups
	docker compose --env-file $(ENV_FILE) exec database pg_dump -U postgres wikidb > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/ directory"

## restore: Restore database from backup (usage: make restore FILE=backup.sql)
restore:
	@if [ -z "$(FILE)" ]; then echo "Error: FILE parameter required. Usage: make restore FILE=backup.sql"; exit 1; fi
	cat $(FILE) | docker compose --env-file $(ENV_FILE) exec -T database psql -U postgres -d wikidb
	@echo "Database restored from $(FILE)"

## health: Check health of all services
health:
	@echo "Checking service health..."
	@curl -s http://localhost:3000/health | grep -q "ok" && echo "✓ Backend: Healthy" || echo "✗ Backend: Unhealthy"
	@curl -s http://localhost/health | grep -q "healthy" && echo "✓ Frontend: Healthy" || echo "✗ Frontend: Unhealthy"
	@docker compose --env-file $(ENV_FILE) exec database pg_isready -U postgres > /dev/null 2>&1 && echo "✓ Database: Healthy" || echo "✗ Database: Unhealthy"

## clean: Remove all containers, images, and volumes
clean:
	docker compose --env-file $(ENV_FILE) down -v --rmi all
	docker system prune -f

## clean-volumes: Remove only volumes
clean-volumes:
	docker compose --env-file $(ENV_FILE) down -v

## dev: Start services in development mode
dev:
	docker compose --env-file $(ENV_FILE) up

## prod: Start services in production mode
prod:
	docker compose --env-file $(ENV_FILE) up -d --build

## pull: Pull latest images
pull:
	docker compose --env-file $(ENV_FILE) pull

## push: Push images to registry (requires registry configuration)
push:
	docker compose --env-file $(ENV_FILE) push

## test-backend: Run backend tests
test-backend:
	docker compose --env-file $(ENV_FILE) exec backend bun test

## setup: Initial setup (create env, build, start, migrate, seed)
setup:
	@if [ ! -f $(ENV_FILE) ]; then cp .env.docker.example $(ENV_FILE); echo "Created $(ENV_FILE) - please update it with your settings"; exit 1; fi
	@echo "Building images..."
	@make build
	@echo "Starting services..."
	@make up
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Running migrations..."
	@make migrate
	@echo "Seeding database..."
	@make seed
	@echo ""
	@echo "✓ Setup complete!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"
	@echo "Run 'make logs' to view logs"

## reset: Reset everything (clean and setup)
reset: clean setup

## Production Commands (Unified Image)
## ====================================

## prod-build: Build production unified image (frontend + backend)
prod-build:
	@./scripts/build-prod.sh

## prod-up: Start production environment
prod-up:
	@./scripts/run-prod.sh

## prod-down: Stop production environment
prod-down:
	@./scripts/stop-prod.sh

## prod-logs: View production logs
prod-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

## prod-shell: Access production app shell
prod-shell:
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec app sh

## prod-migrate: Run migrations in production
prod-migrate:
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec app bun run db:migrate

## prod-seed: Seed production database
prod-seed:
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec app bun run db:seed

## prod-backup: Backup production database
prod-backup:
	@mkdir -p backups
	docker compose -f docker-compose.prod.yml --env-file .env.prod exec database pg_dump -U postgres wikidb > backups/prod_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Production backup created in backups/ directory"

## prod-restart: Restart production services
prod-restart:
	docker compose -f docker-compose.prod.yml --env-file .env.prod restart

## prod-ps: List production containers
prod-ps:
	docker compose -f docker-compose.prod.yml --env-file .env.prod ps
