#!/bin/bash
# MigrantHub Development Startup Script
# Автоматически запускает Docker и все сервисы

set -e

echo "🚀 MigrantHub Dev Startup"
echo "========================="

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Проверяем и запускаем Docker
echo -e "\n${YELLOW}[1/4] Проверка Docker...${NC}"
if ! docker info &>/dev/null; then
    echo "Docker не запущен. Запускаю Docker Desktop..."
    open -a Docker

    # Ждём готовности Docker
    echo "Ожидание Docker (может занять до 60 секунд)..."
    for i in {1..60}; do
        if docker info &>/dev/null; then
            echo -e "${GREEN}✓ Docker готов${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done

    if ! docker info &>/dev/null; then
        echo -e "${RED}✗ Docker не запустился. Откройте Docker Desktop вручную.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Docker уже запущен${NC}"
fi

# 2. Переходим в директорию проекта
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)
echo -e "\n${YELLOW}[2/4] Директория: ${PROJECT_DIR}${NC}"

# 3. Запускаем backend сервисы
echo -e "\n${YELLOW}[3/4] Запуск Backend (PostgreSQL, Redis, API)...${NC}"
docker-compose up -d

# Ждём готовности API
echo "Ожидание API..."
for i in {1..30}; do
    if curl -s http://localhost:3001/api/v1/health &>/dev/null; then
        echo -e "${GREEN}✓ API готов на http://localhost:3001${NC}"
        break
    fi
    sleep 2
    echo -n "."
done

# 4. Запускаем frontend
echo -e "\n${YELLOW}[4/4] Запуск Frontend...${NC}"
cd apps/frontend

# Убиваем старые процессы на портах 3000
lsof -t -i:3000 2>/dev/null | xargs -r kill -9 2>/dev/null || true

npm run dev &
FRONTEND_PID=$!

sleep 5

if curl -s http://localhost:3000 -o /dev/null -w "%{http_code}" | grep -q "200\|308"; then
    echo -e "${GREEN}✓ Frontend готов на http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Frontend запускается...${NC}"
fi

# Итого
echo -e "\n${GREEN}========================="
echo "✅ MigrantHub запущен!"
echo "=========================${NC}"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API:      http://localhost:3001/api/v1"
echo "🐘 Postgres: localhost:5432"
echo "🔴 Redis:    localhost:6379"
echo ""
echo "Для остановки: docker-compose down && kill $FRONTEND_PID"
