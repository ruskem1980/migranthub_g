.PHONY: dev prod down logs build clean shell db-shell redis-shell help

# ===========================================
# MigrantHub Docker Commands
# ===========================================

# Default target
.DEFAULT_GOAL := help

# ===========================================
# Development
# ===========================================

## Start development environment
dev:
	docker compose up

## Start development environment (detached)
dev-d:
	docker compose up -d

## Build and start development environment
dev-build:
	docker compose up --build

# ===========================================
# Production
# ===========================================

## Start production environment
prod:
	docker compose -f docker-compose.prod.yml up

## Start production environment (detached)
prod-d:
	docker compose -f docker-compose.prod.yml up -d

## Build and start production environment
prod-build:
	docker compose -f docker-compose.prod.yml up --build

# ===========================================
# Common Operations
# ===========================================

## Stop all containers
down:
	docker compose down
	docker compose -f docker-compose.prod.yml down 2>/dev/null || true

## Stop and remove volumes
down-v:
	docker compose down -v
	docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true

## View logs (all services)
logs:
	docker compose logs -f

## View logs for specific service (usage: make logs-api)
logs-api:
	docker compose logs -f api-core

logs-db:
	docker compose logs -f postgres

logs-redis:
	docker compose logs -f redis

# ===========================================
# Build
# ===========================================

## Build all images
build:
	docker compose build

## Build production images
build-prod:
	docker compose -f docker-compose.prod.yml build

## Build without cache
build-nc:
	docker compose build --no-cache

# ===========================================
# Shell Access
# ===========================================

## Open shell in api-core container
shell:
	docker compose exec api-core sh

## Open PostgreSQL shell
db-shell:
	docker compose exec postgres psql -U $${DB_USERNAME:-migranthub} -d $${DB_DATABASE:-migranthub}

## Open Redis CLI
redis-shell:
	docker compose exec redis redis-cli -a $${REDIS_PASSWORD:-redis_secret}

# ===========================================
# Database
# ===========================================

## Run database migrations
migrate:
	docker compose exec api-core npm run migration:run

## Generate new migration
migrate-gen:
	docker compose exec api-core npm run migration:generate

## Revert last migration
migrate-revert:
	docker compose exec api-core npm run migration:revert

# ===========================================
# Cleanup
# ===========================================

## Remove all containers and images
clean:
	docker compose down --rmi all -v
	docker compose -f docker-compose.prod.yml down --rmi all -v 2>/dev/null || true

## Prune Docker system
prune:
	docker system prune -f

# ===========================================
# Status
# ===========================================

## Show running containers
ps:
	docker compose ps

## Show container stats
stats:
	docker stats --no-stream

# ===========================================
# Help
# ===========================================

## Show this help message
help:
	@echo ""
	@echo "MigrantHub Docker Commands"
	@echo "=========================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-d        - Start development environment (detached)"
	@echo "  make dev-build    - Build and start development"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-d       - Start production environment (detached)"
	@echo "  make prod-build   - Build and start production"
	@echo ""
	@echo "Common:"
	@echo "  make down         - Stop all containers"
	@echo "  make down-v       - Stop and remove volumes"
	@echo "  make logs         - View all logs"
	@echo "  make logs-api     - View API logs"
	@echo "  make logs-db      - View database logs"
	@echo ""
	@echo "Shell:"
	@echo "  make shell        - Open shell in api-core"
	@echo "  make db-shell     - Open PostgreSQL shell"
	@echo "  make redis-shell  - Open Redis CLI"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run migrations"
	@echo "  make migrate-gen  - Generate migration"
	@echo ""
	@echo "Build:"
	@echo "  make build        - Build all images"
	@echo "  make build-prod   - Build production images"
	@echo ""
	@echo "Status:"
	@echo "  make ps           - Show running containers"
	@echo "  make stats        - Show container stats"
	@echo ""
