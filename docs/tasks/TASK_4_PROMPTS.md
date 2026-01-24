# Task #4: Backend Project Setup — Промпты для подзадач

## Подзадача 4.1: NestJS Scaffold + Configuration

```
## Задача: Backend Setup - Scaffold

## Контекст
Проект MigrantHub. Нужно создать NestJS backend в apps/api-core.
Существующая структура: apps/frontend (Next.js), apps/legal-core (NestJS).
Docker Compose будет добавлен позже.

## Цель
Рабочий NestJS проект с базовой конфигурацией и health endpoint.

## Шаги
1. Создать apps/api-core с NestJS CLI или вручную
2. Настроить package.json с зависимостями:
   - @nestjs/core, @nestjs/common, @nestjs/platform-express
   - @nestjs/config, @nestjs/swagger
   - class-validator, class-transformer
   - @nestjs/typeorm, pg, typeorm
   - @nestjs/throttler (rate limiting)
   - pino, nestjs-pino (logging)
3. Настроить tsconfig.json (strict mode)
4. Настроить ESLint + Prettier
5. Создать структуру:
   src/
   ├── main.ts
   ├── app.module.ts
   ├── config/
   │   ├── app.config.ts
   │   ├── database.config.ts
   │   └── index.ts
   └── modules/
       └── health/
           ├── health.module.ts
           └── health.controller.ts
6. Health endpoint: GET /api/v1/health → { status: 'ok', timestamp }
7. Swagger на /api/docs

## Файлы для создания
- apps/api-core/package.json
- apps/api-core/tsconfig.json
- apps/api-core/tsconfig.build.json
- apps/api-core/nest-cli.json
- apps/api-core/.eslintrc.js
- apps/api-core/.prettierrc
- apps/api-core/src/main.ts
- apps/api-core/src/app.module.ts
- apps/api-core/src/config/app.config.ts
- apps/api-core/src/config/database.config.ts
- apps/api-core/src/config/index.ts
- apps/api-core/src/modules/health/health.module.ts
- apps/api-core/src/modules/health/health.controller.ts
- apps/api-core/.env.example

## Критерии готовности
- [ ] npm install проходит без ошибок
- [ ] npm run build компилируется
- [ ] npm run start:dev запускается
- [ ] GET /api/v1/health возвращает 200
- [ ] Swagger UI доступен на /api/docs

## После завершения
cd apps/api-core && npm install && npm run start:dev
Проверить: curl http://localhost:3000/api/v1/health
```

---

## Подзадача 4.2: Common Utilities + Docker

```
## Задача: Backend Setup - Common + Docker

## Контекст
apps/api-core уже создан с базовой структурой (подзадача 4.1).
Нужно добавить common utilities и Docker конфигурацию.

## Цель
Добавить переиспользуемые компоненты и Docker setup.

## Шаги
1. Создать common/filters/http-exception.filter.ts
   - Унифицированный формат ошибок
   - Логирование ошибок
2. Создать common/interceptors/logging.interceptor.ts
   - Логирование входящих запросов
   - Время выполнения
3. Создать common/interceptors/transform.interceptor.ts
   - Обёртка ответов в { data, meta }
4. Создать common/decorators/api-response.decorator.ts
   - Swagger декораторы
5. Создать Dockerfile (multi-stage build)
6. Создать docker-compose.yml (api + postgres + redis)
7. Создать .dockerignore
8. Обновить app.module.ts - подключить filters/interceptors

## Файлы для создания
- apps/api-core/src/common/filters/http-exception.filter.ts
- apps/api-core/src/common/interceptors/logging.interceptor.ts
- apps/api-core/src/common/interceptors/transform.interceptor.ts
- apps/api-core/src/common/decorators/api-response.decorator.ts
- apps/api-core/src/common/index.ts
- apps/api-core/Dockerfile
- apps/api-core/.dockerignore
- docker-compose.yml (в корне проекта)
- .env.example (в корне проекта)

## Критерии готовности
- [ ] Ошибки возвращаются в едином формате
- [ ] Логи показывают входящие запросы
- [ ] docker-compose up поднимает все сервисы
- [ ] API доступен на localhost:3000

## После завершения
docker-compose up -d
curl http://localhost:3000/api/v1/health
docker-compose logs api-core
```

---

## Статус

- [ ] 4.1 NestJS Scaffold
- [ ] 4.2 Common + Docker
