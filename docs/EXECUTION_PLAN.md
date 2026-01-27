# План выполнения задач MigrantHub

> **Дата**: 2026-01-27
> **Версия**: 1.0
> **Основан на**: GAP_ANALYSIS.md

---

## Принципы планирования

1. **1 задача = 1 контекстное окно** — каждая задача должна быть выполнима за один запуск агента
2. **Оценка сложности**:
   - S (Small): ~200-500 строк кода, 1-3 файла
   - M (Medium): ~500-1000 строк, 3-6 файлов
   - L (Large): ~1000-2000 строк, 6-10 файлов
   - XL: требует разбиения на подзадачи
3. **Параллельность**: задачи без зависимостей запускаются одновременно

---

## Волна 1: Независимые Backend задачи

**Можно запустить параллельно: 6 агентов**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 1.1   │ │ Агент 1.2   │ │ Агент 1.3   │
│ Audit Log   │ │ Recovery    │ │ User Mgmt   │
│ S: ~300 LOC │ │ M: ~500 LOC │ │ M: ~600 LOC │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 1.4   │ │ Агент 1.5   │ │ Агент 1.6   │
│ HMAC Sign   │ │ Redis Cache │ │ CI/CD       │
│ M: ~400 LOC │ │ S: ~200 LOC │ │ M: ~300 LOC │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

### Агент 1.1: Audit Log Module

**Оценка**: S | ~300 LOC | 4 файла | 1 контекстное окно

```
## Задача: Создание Audit Log Module

## Контекст
Проект MigrantHub (NestJS). Нужно создать модуль аудита для логирования всех HTTP запросов.

## Цель
Создать AuditModule с entity, service и интеграцией в LoggingInterceptor.

## Шаги
1. Изучить существующую структуру:
   - apps/api-core/src/app.module.ts
   - apps/api-core/src/common/interceptors/logging.interceptor.ts

2. Создать миграцию для таблицы audit_log:
   - id (uuid, PK)
   - user_id (uuid, nullable, FK -> users)
   - action (varchar) — HTTP method
   - resource (varchar) — endpoint path
   - request_body (jsonb, nullable)
   - response_status (int)
   - ip_address (varchar)
   - user_agent (varchar)
   - duration_ms (int)
   - created_at (timestamp)

3. Создать AuditLog entity

4. Создать AuditService с методом log()

5. Создать AuditModule

6. Интегрировать в LoggingInterceptor

## Файлы для создания
- apps/api-core/src/migrations/*_create_audit_log.ts
- apps/api-core/src/modules/audit/entities/audit-log.entity.ts
- apps/api-core/src/modules/audit/audit.service.ts
- apps/api-core/src/modules/audit/audit.module.ts

## Файлы для изменения
- apps/api-core/src/app.module.ts (добавить AuditModule)
- apps/api-core/src/common/interceptors/logging.interceptor.ts (вызывать AuditService)

## Критерии готовности
- [ ] Миграция создана и применяется без ошибок
- [ ] Entity корректно маппится на таблицу
- [ ] Все HTTP запросы логируются в БД
- [ ] Компиляция без ошибок: npm run build --workspace=api-core

## После завершения
npm run build --workspace=api-core && npm run migration:run --workspace=api-core
```

---

### Агент 1.2: Recovery Code Verification

**Оценка**: M | ~500 LOC | 5 файлов | 1 контекстное окно

```
## Задача: Recovery Code Verification Endpoint

## Контекст
Проект MigrantHub (NestJS). Есть AuthModule с device-based аутентификацией. Нужно добавить восстановление доступа по recovery code.

## Цель
Создать POST /api/v1/auth/recovery/verify endpoint.

## Шаги
1. Изучить существующий AuthModule:
   - apps/api-core/src/modules/auth/auth.controller.ts
   - apps/api-core/src/modules/auth/auth.service.ts
   - apps/api-core/src/modules/users/entities/user.entity.ts

2. Проверить, что в User entity есть поле recoveryCode (если нет — добавить миграцию)

3. Создать DTO:
   - VerifyRecoveryDto: { deviceId: string, recoveryCode: string }
   - RecoveryResponseDto: { accessToken, refreshToken, newRecoveryCode }

4. Создать RecoveryService:
   - verifyRecoveryCode(deviceId, code): проверка кода
   - generateNewRecoveryCode(): генерация нового кода
   - Добавить rate limiting (3 попытки / 15 минут)

5. Добавить endpoint в AuthController:
   - POST /auth/recovery/verify

6. Обновить Swagger документацию

## Файлы для создания
- apps/api-core/src/modules/auth/dto/verify-recovery.dto.ts
- apps/api-core/src/modules/auth/dto/recovery-response.dto.ts
- apps/api-core/src/modules/auth/recovery.service.ts

## Файлы для изменения
- apps/api-core/src/modules/auth/auth.controller.ts
- apps/api-core/src/modules/auth/auth.module.ts

## Критерии готовности
- [ ] POST /auth/recovery/verify работает
- [ ] Неверный код возвращает 401
- [ ] После 3 неудачных попыток — блокировка 15 минут
- [ ] Успешная верификация возвращает новые токены и новый recovery code
- [ ] Swagger документация обновлена

## После завершения
npm run build --workspace=api-core && npm run test --workspace=api-core
```

---

### Агент 1.3: User Management Endpoints

**Оценка**: M | ~600 LOC | 4 файла | 1 контекстное окно

```
## Задача: Дополнительные User Management Endpoints

## Контекст
Проект MigrantHub (NestJS). UsersModule уже имеет GET/PATCH /users/me. Нужно добавить недостающие endpoints.

## Цель
Добавить 3 новых endpoints в UsersController.

## Шаги
1. Изучить существующий UsersModule:
   - apps/api-core/src/modules/users/users.controller.ts
   - apps/api-core/src/modules/users/users.service.ts
   - apps/api-core/src/modules/users/entities/user.entity.ts

2. Создать DTOs:
   - CompleteOnboardingDto: { citizenship, entryDate, purpose, ... }
   - CalculateDeadlinesDto: { entryDate, registrationDate?, patentDate? }
   - DeadlinesResponseDto: { registration, patent90days, stayLimit, ... }

3. Создать DeadlineCalculatorService:
   - calculateDeadlines(input): расчёт всех дедлайнов
   - Использовать бизнес-логику 90/180 дней

4. Добавить endpoints в UsersController:
   - POST /users/onboarding/complete — завершение онбординга
   - POST /users/calculate — расчёт дедлайнов
   - DELETE /users/account — удаление аккаунта

5. Для DELETE /users/account:
   - Soft delete (установить deletedAt)
   - Очистить персональные данные
   - Отозвать все токены

## Файлы для создания
- apps/api-core/src/modules/users/dto/complete-onboarding.dto.ts
- apps/api-core/src/modules/users/dto/calculate-deadlines.dto.ts
- apps/api-core/src/modules/users/deadline-calculator.service.ts

## Файлы для изменения
- apps/api-core/src/modules/users/users.controller.ts
- apps/api-core/src/modules/users/users.service.ts
- apps/api-core/src/modules/users/users.module.ts

## Критерии готовности
- [ ] POST /users/onboarding/complete сохраняет данные профиля
- [ ] POST /users/calculate возвращает корректные дедлайны
- [ ] DELETE /users/account удаляет аккаунт
- [ ] Все endpoints защищены JwtAuthGuard
- [ ] Swagger документация

## После завершения
npm run build --workspace=api-core
```

---

### Агент 1.4: Request Signing (HMAC-SHA256)

**Оценка**: M | ~400 LOC | 4 файла | 1 контекстное окно

```
## Задача: Request Signing с HMAC-SHA256

## Контекст
Проект MigrantHub (NestJS). Нужно добавить подпись запросов для защиты от MITM атак.

## Цель
Создать SigningGuard и интегрировать в защищённые endpoints.

## Формат подписи
```
X-Signature: base64(HMAC-SHA256(timestamp + method + path + body, secretKey))
X-Timestamp: unix_timestamp_ms
```

## Шаги
1. Изучить существующие guards:
   - apps/api-core/src/common/guards/

2. Добавить поле signingKey в User entity (если нет):
   - signingKey: string (генерируется при device auth)

3. Создать SigningService:
   - generateSigningKey(): генерация ключа
   - verifySignature(request, userId): проверка подписи
   - Проверка timestamp (не старше 5 минут)

4. Создать SigningGuard:
   - Извлекать X-Signature и X-Timestamp из headers
   - Получать userId из JWT
   - Вызывать SigningService.verifySignature()

5. Обновить AuthService.registerDevice():
   - Генерировать signingKey
   - Возвращать его в ответе

6. Применить @UseGuards(SigningGuard) к защищённым endpoints
   - Пока только к /users/* endpoints

## Файлы для создания
- apps/api-core/src/common/guards/signing.guard.ts
- apps/api-core/src/modules/auth/signing.service.ts

## Файлы для изменения
- apps/api-core/src/modules/users/entities/user.entity.ts (добавить signingKey)
- apps/api-core/src/modules/auth/auth.service.ts (генерация ключа)
- apps/api-core/src/modules/auth/dto/device-register-response.dto.ts
- apps/api-core/src/modules/users/users.controller.ts (добавить guard)

## Критерии готовности
- [ ] SigningGuard проверяет подпись
- [ ] Запрос без подписи — 401
- [ ] Неверная подпись — 401
- [ ] Устаревший timestamp (>5 мин) — 401
- [ ] Device auth возвращает signingKey

## После завершения
npm run build --workspace=api-core
```

---

### Агент 1.5: Redis Cache Integration

**Оценка**: S | ~200 LOC | 3 файла | 1 контекстное окно

```
## Задача: Интеграция Redis Cache

## Контекст
Проект MigrantHub (NestJS). Redis упоминается в конфигурации, но не используется. Нужно интегрировать для кэширования.

## Цель
Создать CacheModule на основе Redis и использовать для кэширования.

## Шаги
1. Изучить конфигурацию:
   - apps/api-core/src/config/configuration.ts
   - docker-compose.yml (проверить наличие redis)

2. Установить зависимости (если не установлены):
   - @nestjs/cache-manager
   - cache-manager-redis-yet

3. Создать CacheModule:
   - Конфигурация из environment
   - TTL по умолчанию: 5 минут

4. Создать CacheService с хелперами:
   - get<T>(key): Promise<T | null>
   - set(key, value, ttl?): Promise<void>
   - del(key): Promise<void>
   - wrap<T>(key, fn, ttl?): Promise<T> — cache-aside pattern

5. Применить кэширование к:
   - GET /utilities/patent/regions (TTL: 1 час)
   - GET /utilities/ban-check (TTL: 1 час)

## Файлы для создания
- apps/api-core/src/modules/cache/cache.module.ts
- apps/api-core/src/modules/cache/cache.service.ts

## Файлы для изменения
- apps/api-core/src/app.module.ts
- apps/api-core/src/modules/utilities/patent/patent.service.ts
- apps/api-core/src/modules/utilities/ban-check/ban-check.service.ts

## Критерии готовности
- [ ] Redis подключается при старте
- [ ] Patent regions кэшируется
- [ ] Ban check результаты кэшируются
- [ ] Graceful degradation если Redis недоступен

## После завершения
docker-compose up -d redis && npm run build --workspace=api-core
```

---

### Агент 1.6: GitHub Actions CI/CD

**Оценка**: M | ~300 LOC (YAML) | 3 файла | 1 контекстное окно

```
## Задача: GitHub Actions CI/CD Pipeline

## Контекст
Проект MigrantHub — monorepo с apps/api-core и apps/frontend. Нужно настроить CI/CD.

## Цель
Создать workflows для CI (тесты) и CD (деплой).

## Шаги
1. Изучить структуру проекта:
   - package.json (scripts)
   - apps/api-core/package.json
   - apps/frontend/package.json

2. Создать CI workflow (.github/workflows/ci.yml):
   - Триггер: push to main, pull_request
   - Jobs:
     - lint: eslint для всего monorepo
     - typecheck: tsc --noEmit
     - test-backend: jest для api-core
     - test-frontend: jest для frontend (если есть)
     - build: сборка обоих приложений
   - Кэширование node_modules
   - Matrix: Node 20.x

3. Создать CD staging workflow (.github/workflows/cd-staging.yml):
   - Триггер: push to main (после CI)
   - Jobs:
     - build-push: сборка Docker images, push в registry
     - deploy: деплой на staging (placeholder)
   - Secrets: DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD

4. Создать CD production workflow (.github/workflows/cd-production.yml):
   - Триггер: release published
   - Jobs: аналогично staging
   - Требует manual approval (environment: production)

## Файлы для создания
- .github/workflows/ci.yml
- .github/workflows/cd-staging.yml
- .github/workflows/cd-production.yml

## Критерии готовности
- [ ] CI запускается на каждый PR
- [ ] Все jobs проходят на текущем коде
- [ ] CD workflows корректно настроены
- [ ] Secrets документированы в README

## После завершения
git add .github/ && git commit -m "feat(ci): add GitHub Actions workflows"
```

---

## Волна 2: Зависимые Backend + Независимые Frontend

**Запускается после Волны 1**
**Можно запустить параллельно: 5 агентов**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 2.1   │ │ Агент 2.2   │ │ Агент 2.3   │
│ Legal Core  │ │ Ban Check   │ │ Offline Q   │
│ L: ~1000LOC │ │ M: ~500 LOC │ │ M: ~600 LOC │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐
│ Агент 2.4   │ │ Агент 2.5   │
│ UI Library  │ │ Docker Prod │
│ L: ~1500LOC │ │ M: ~400 LOC │
└─────────────┘ └─────────────┘
```

---

### Агент 2.1: Legal Core Integration

**Оценка**: L | ~1000 LOC | 8 файлов | 1 контекстное окно (плотное)

```
## Задача: Интеграция Legal Core Module

## Контекст
Проект MigrantHub. В apps/legal-core уже есть готовый модуль с законодательной базой. Нужно интегрировать его в api-core.

## Цель
Создать LegalModule в api-core с 9 endpoints.

## Шаги
1. Изучить legal-core:
   - apps/legal-core/src/**/*.ts
   - Какие сервисы и данные доступны

2. Создать LegalModule в api-core:
   - Импортировать/адаптировать функционал из legal-core
   - Или использовать как npm workspace dependency

3. Создать DTOs:
   - CategoryDto, LawDto, FormDto, FaqDto
   - PatentPriceRequestDto, PatentPriceResponseDto
   - StayCalculatorRequestDto, StayCalculatorResponseDto

4. Создать LegalService:
   - getCategories()
   - getCategoryItems(categoryId)
   - getLaws(filter?)
   - getLawById(id)
   - getForms()
   - calculatePatentPrice(region, months)
   - calculateStay(entryDate, exits?)
   - getFaq()

5. Создать LegalController с endpoints:
   - GET /legal/categories
   - GET /legal/categories/:id/items
   - GET /legal/laws
   - GET /legal/laws/:id
   - GET /legal/forms
   - GET /legal/calculators/patent-price
   - POST /legal/calculators/stay
   - GET /legal/faq

6. Добавить Swagger документацию

## Файлы для создания
- apps/api-core/src/modules/legal/legal.module.ts
- apps/api-core/src/modules/legal/legal.controller.ts
- apps/api-core/src/modules/legal/legal.service.ts
- apps/api-core/src/modules/legal/dto/*.ts (6+ файлов)

## Файлы для изменения
- apps/api-core/src/app.module.ts

## Критерии готовности
- [ ] Все 9 endpoints работают
- [ ] Данные возвращаются корректно
- [ ] Калькуляторы дают правильные результаты
- [ ] Swagger документация полная

## После завершения
npm run build --workspace=api-core
```

---

### Агент 2.2: Ban Check Real Integration

**Оценка**: M | ~500 LOC | 3 файла | 1 контекстное окно

```
## Задача: Реальная интеграция Ban Check с МВД

## Контекст
Проект MigrantHub (NestJS). BanCheckService сейчас возвращает заглушку. Нужно интегрировать реальный API МВД.

## Требования
- API МВД: https://services.fms.gov.ru/info-service.htm?sid=2000
- Graceful degradation при недоступности

## Цель
Заменить заглушку на реальные запросы к МВД API.

## Шаги
1. Изучить текущую реализацию:
   - apps/api-core/src/modules/utilities/ban-check/ban-check.service.ts
   - apps/api-core/src/modules/utilities/ban-check/ban-check.controller.ts

2. Исследовать API МВД:
   - Формат запроса (GET параметры)
   - Формат ответа (HTML/JSON парсинг)
   - Rate limits

3. Создать MvdClient:
   - HTTP клиент с timeout 10 сек
   - Retry logic (3 попытки с exponential backoff)
   - Парсинг ответа МВД
   - Маппинг на внутренние типы

4. Обновить BanCheckService:
   - Использовать MvdClient
   - Кэширование через CacheService (из Волны 1)
   - Circuit breaker pattern
   - Fallback на "UNKNOWN" при ошибках

5. Обновить типы ответа:
   - BanStatus: NO_BAN | HAS_BAN | UNKNOWN | ERROR
   - Добавить поле source: "MVD" | "CACHE" | "FALLBACK"

## Файлы для создания
- apps/api-core/src/modules/utilities/ban-check/mvd.client.ts

## Файлы для изменения
- apps/api-core/src/modules/utilities/ban-check/ban-check.service.ts
- apps/api-core/src/modules/utilities/ban-check/dto/ban-check-response.dto.ts

## Критерии готовности
- [ ] Реальные запросы к МВД (в production)
- [ ] Mock режим для development
- [ ] Timeout 10 сек
- [ ] Retry 3 раза
- [ ] Кэширование 1 час
- [ ] Graceful degradation

## После завершения
npm run build --workspace=api-core
```

---

### Агент 2.3: Offline Queue & Background Sync

**Оценка**: M | ~600 LOC | 5 файлов | 1 контекстное окно

```
## Задача: Offline Queue и Background Sync

## Контекст
Проект MigrantHub (Next.js + Capacitor). Приложение должно работать offline. Нужно сохранять операции в очередь и синхронизировать при восстановлении сети.

## Цель
Создать систему offline queue с автоматической синхронизацией.

## Шаги
1. Изучить существующую инфраструктуру:
   - apps/frontend/src/lib/db/index.ts (Dexie.js)
   - apps/frontend/src/hooks/useOnlineStatus.ts
   - apps/frontend/src/lib/api/client.ts

2. Расширить Dexie схему:
   - Добавить таблицу offlineQueue:
     - id, action, endpoint, method, body, createdAt, retryCount, status

3. Создать OfflineQueue class:
   - enqueue(action): добавить в очередь
   - dequeue(): получить следующий
   - peek(): посмотреть без удаления
   - clear(): очистить
   - getCount(): количество pending

4. Создать BackgroundSync service:
   - processQueue(): обработка очереди
   - sync(): синхронизация одной операции
   - Conflict resolution (last-write-wins или merge)
   - Retry logic с exponential backoff

5. Создать useOfflineQueue hook:
   - pendingCount: number
   - isSyncing: boolean
   - sync(): manual trigger
   - Автоматический sync при online

6. Интегрировать в API client:
   - При offline — сохранять в queue
   - При online — отправлять напрямую

7. Добавить UI индикатор в DashboardLayout

## Файлы для создания
- apps/frontend/src/lib/sync/offlineQueue.ts
- apps/frontend/src/lib/sync/backgroundSync.ts
- apps/frontend/src/lib/sync/conflictResolver.ts
- apps/frontend/src/hooks/useOfflineQueue.ts

## Файлы для изменения
- apps/frontend/src/lib/db/index.ts
- apps/frontend/src/lib/api/client.ts
- apps/frontend/src/components/prototype/DashboardLayout.tsx

## Критерии готовности
- [ ] Операции сохраняются при offline
- [ ] Автоматическая синхронизация при online
- [ ] UI показывает pending count
- [ ] Retry при ошибках
- [ ] Conflict resolution работает

## После завершения
npm run build --workspace=frontend
```

---

### Агент 2.4: UI Component Library

**Оценка**: L | ~1500 LOC | 8 файлов | 1 контекстное окно (плотное)

```
## Задача: UI Component Library

## Контекст
Проект MigrantHub (Next.js + Tailwind). Сейчас UI компоненты inline. Нужна переиспользуемая библиотека.

## Цель
Создать 6 базовых UI компонентов с TypeScript типами и Tailwind стилями.

## Шаги
1. Изучить существующие стили:
   - apps/frontend/tailwind.config.ts
   - apps/frontend/src/app/globals.css
   - Существующие компоненты для reference

2. Создать Button component:
   - Variants: primary, secondary, danger, ghost, outline
   - Sizes: sm, md, lg
   - States: loading, disabled
   - Props: leftIcon, rightIcon

3. Создать Card component:
   - Variants: default, elevated, outlined
   - Slots: header, body, footer
   - Props: padding, clickable

4. Создать Input component:
   - Types: text, password, email, tel, date
   - States: error, disabled
   - Props: label, helperText, leftIcon, rightIcon

5. Создать Modal component:
   - Props: isOpen, onClose, title, size
   - Overlay с backdrop blur
   - Close on Escape и click outside
   - Portal rendering

6. Создать Sheet component (bottom sheet):
   - Props: isOpen, onClose, title
   - Swipe to close (опционально)
   - Snap points: 50%, 90%

7. Создать Toast component + useToast hook:
   - Types: success, error, warning, info
   - Auto dismiss (configurable)
   - Stack management
   - Portal rendering

8. Создать index.ts с экспортами

## Файлы для создания
- apps/frontend/src/components/ui/Button.tsx
- apps/frontend/src/components/ui/Card.tsx
- apps/frontend/src/components/ui/Input.tsx
- apps/frontend/src/components/ui/Modal.tsx
- apps/frontend/src/components/ui/Sheet.tsx
- apps/frontend/src/components/ui/Toast.tsx
- apps/frontend/src/components/ui/index.ts
- apps/frontend/src/hooks/useToast.ts

## Критерии готовности
- [ ] Все 6 компонентов созданы
- [ ] TypeScript типы полные
- [ ] Tailwind стили консистентные
- [ ] Accessible (ARIA атрибуты)
- [ ] Компоненты экспортируются из index.ts

## После завершения
npm run build --workspace=frontend
```

---

### Агент 2.5: Docker Compose Production

**Оценка**: M | ~400 LOC (YAML/conf) | 4 файла | 1 контекстное окно

```
## Задача: Docker Compose для Production

## Контекст
Проект MigrantHub. Есть базовый docker-compose.yml для development. Нужна production конфигурация.

## Цель
Создать полную production-ready Docker конфигурацию.

## Шаги
1. Изучить существующую конфигурацию:
   - docker-compose.yml
   - apps/api-core/Dockerfile (если есть)
   - apps/frontend/Dockerfile (если есть)

2. Создать/обновить Dockerfiles:
   - apps/api-core/Dockerfile (multi-stage build)
   - apps/frontend/Dockerfile (multi-stage build)

3. Создать docker-compose.prod.yml:
   - Services: api-core, frontend, postgres, redis, nginx
   - Networks: internal (backend), external (nginx)
   - Volumes: postgres_data, redis_data
   - Resource limits (memory, cpu)
   - Health checks для всех сервисов
   - Restart policies: unless-stopped
   - Environment variables из .env

4. Создать nginx конфигурацию:
   - Reverse proxy для api-core и frontend
   - SSL termination (placeholder для сертификатов)
   - Gzip compression
   - Security headers
   - Rate limiting

5. Создать .env.example для production

## Файлы для создания
- docker-compose.prod.yml
- nginx/nginx.conf
- nginx/ssl/.gitkeep
- .env.example

## Файлы для изменения (если нужно)
- apps/api-core/Dockerfile
- apps/frontend/Dockerfile

## Критерии готовности
- [ ] docker-compose -f docker-compose.prod.yml up работает
- [ ] Health checks проходят для всех сервисов
- [ ] Nginx проксирует запросы корректно
- [ ] Volumes persistent
- [ ] .env.example документирует все переменные

## После завершения
docker-compose -f docker-compose.prod.yml config
```

---

## Волна 3: Зависимые Frontend задачи

**Запускается после Волны 2**
**Можно запустить параллельно: 4 агента**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 3.1   │ │ Агент 3.2   │ │ Агент 3.3   │ │ Агент 3.4   │
│ Recovery Pg │ │ Reference   │ │ Deep Links  │ │ Back Button │
│ M: ~400 LOC │ │ M: ~500 LOC │ │ M: ~300 LOC │ │ S: ~150 LOC │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

### Агент 3.1: Recovery Page

**Оценка**: M | ~400 LOC | 3 файла | 1 контекстное окно

```
## Задача: Страница Recovery

## Контекст
Проект MigrantHub (Next.js). Есть auth flow (/welcome -> /auth/method -> /auth/phone -> /auth/otp). Нужна страница восстановления.

## Зависимости
- Агент 1.2: Recovery Code Verification endpoint (POST /auth/recovery/verify)

## Цель
Создать страницу /recovery для восстановления доступа.

## Шаги
1. Изучить существующий auth flow:
   - apps/frontend/src/app/(auth)/welcome/page.tsx
   - apps/frontend/src/app/(auth)/auth/phone/page.tsx
   - apps/frontend/src/stores/authStore.ts
   - apps/frontend/src/lib/api/auth.ts

2. Создать RecoveryForm component:
   - Input для recovery code (формат: XXXX-XXXX-XXXX)
   - Маска ввода
   - Validation
   - Submit button
   - Error display

3. Создать страницу /recovery:
   - Layout аналогичный auth страницам
   - RecoveryForm
   - Link "Вернуться к входу"

4. Добавить API метод:
   - authApi.verifyRecovery(deviceId, code)

5. Обновить authStore:
   - recoverAccess(code): метод восстановления
   - Сохранение новых токенов
   - Redirect на home после успеха

6. Добавить навигацию:
   - Link с /welcome на /recovery
   - Link с /recovery на /welcome

## Файлы для создания
- apps/frontend/src/app/(auth)/recovery/page.tsx
- apps/frontend/src/features/auth/components/RecoveryForm.tsx

## Файлы для изменения
- apps/frontend/src/lib/api/auth.ts
- apps/frontend/src/stores/authStore.ts
- apps/frontend/src/app/(auth)/welcome/page.tsx (добавить link)

## Критерии готовности
- [ ] Страница /recovery доступна
- [ ] Recovery code валидируется
- [ ] Успешное восстановление -> redirect на /
- [ ] Ошибки отображаются
- [ ] Локализация работает

## После завершения
npm run build --workspace=frontend
```

---

### Агент 3.2: Reference Page (Full)

**Оценка**: M | ~500 LOC | 3 файла | 1 контекстное окно

```
## Задача: Полная страница справочника

## Контекст
Проект MigrantHub (Next.js). ServicesScreen содержит частичный справочник. Нужна полноценная страница.

## Зависимости
- Агент 2.1: Legal Core Integration (API endpoints)

## Цель
Создать страницу /reference с полным справочником законов.

## Шаги
1. Изучить существующее:
   - apps/frontend/src/components/prototype/dashboard/ServicesScreen.tsx
   - apps/frontend/src/lib/api/client.ts

2. Добавить API методы:
   - legalApi.getCategories()
   - legalApi.getCategoryItems(id)
   - legalApi.getLaws(filter?)
   - legalApi.getLawById(id)
   - legalApi.getForms()
   - legalApi.getFaq()

3. Создать компоненты:
   - CategoryList: список категорий
   - LawCard: карточка закона
   - LawDetail: детальный просмотр
   - FormsList: список форм с download
   - FaqAccordion: FAQ

4. Создать страницу /reference:
   - Tabs: Категории | Законы | Формы | FAQ
   - Search/filter
   - Responsive layout

5. Добавить в навигацию:
   - Link в ServicesScreen
   - Breadcrumbs

## Файлы для создания
- apps/frontend/src/app/(main)/reference/page.tsx
- apps/frontend/src/features/reference/components/CategoryList.tsx
- apps/frontend/src/features/reference/components/LawCard.tsx
- apps/frontend/src/features/reference/components/FaqAccordion.tsx

## Файлы для изменения
- apps/frontend/src/lib/api/index.ts (добавить legalApi)
- apps/frontend/src/components/prototype/dashboard/ServicesScreen.tsx

## Критерии готовности
- [ ] Страница /reference работает
- [ ] Категории загружаются из API
- [ ] Законы отображаются
- [ ] Формы можно скачать
- [ ] FAQ работает
- [ ] Локализация

## После завершения
npm run build --workspace=frontend
```

---

### Агент 3.3: Deep Links Handler

**Оценка**: M | ~300 LOC | 3 файла | 1 контекстное окно

```
## Задача: Deep Links Handler

## Контекст
Проект MigrantHub (Next.js + Capacitor). Нужно обрабатывать deep links для открытия конкретных экранов.

## Цель
Создать систему обработки deep links.

## Deep Link схема
- migranthub://documents — открыть документы
- migranthub://documents/{id} — открыть документ
- migranthub://calculator — калькулятор 90/180
- migranthub://services — сервисы
- migranthub://recovery?code=XXX — восстановление

## Шаги
1. Изучить Capacitor App plugin:
   - @capacitor/app — appUrlOpen event

2. Создать DeepLinkService:
   - parse(url): извлечение route и params
   - handle(url): навигация
   - Маппинг схемы на routes

3. Создать useDeepLinks hook:
   - Подписка на appUrlOpen
   - Обработка при mount
   - Cleanup при unmount

4. Интегрировать в app layout:
   - apps/frontend/src/app/layout.tsx
   - Инициализация при старте

5. Настроить Capacitor:
   - capacitor.config.ts — URL scheme
   - iOS: Info.plist URL types
   - Android: AndroidManifest.xml intent-filter

## Файлы для создания
- apps/frontend/src/lib/deepLinks.ts
- apps/frontend/src/hooks/useDeepLinks.ts

## Файлы для изменения
- apps/frontend/src/app/layout.tsx
- capacitor.config.ts
- ios/App/App/Info.plist (если есть)
- android/app/src/main/AndroidManifest.xml (если есть)

## Критерии готовности
- [ ] Deep links парсятся корректно
- [ ] Навигация работает
- [ ] Web fallback (обычные routes)
- [ ] Capacitor конфиг обновлён

## После завершения
npm run build --workspace=frontend && npx cap sync
```

---

### Агент 3.4: Back Button Handler (Android)

**Оценка**: S | ~150 LOC | 2 файла | 1 контекстное окно

```
## Задача: Back Button Handler для Android

## Контекст
Проект MigrantHub (Next.js + Capacitor). На Android hardware back button должен работать корректно.

## Цель
Создать обработчик back button с правильной навигацией.

## Логика
1. Если есть history — go back
2. Если на home — показать "Выйти из приложения?"
3. Если в modal/sheet — закрыть
4. Если в форме с изменениями — "Отменить изменения?"

## Шаги
1. Изучить Capacitor App plugin:
   - @capacitor/app — backButton event

2. Создать BackButtonService:
   - handlers stack (LIFO)
   - register(handler): добавить handler
   - unregister(handler): удалить
   - handleBack(): вызвать top handler

3. Создать useBackButton hook:
   - Подписка на backButton event
   - Default handler: router.back()
   - Exit confirmation на home

4. Создать usePreventBack hook (для форм):
   - Регистрация custom handler
   - Confirmation dialog

5. Интегрировать:
   - В app layout (default handler)
   - В Modal/Sheet компоненты
   - В формы с несохранёнными данными

## Файлы для создания
- apps/frontend/src/lib/backButton.ts
- apps/frontend/src/hooks/useBackButton.ts

## Файлы для изменения
- apps/frontend/src/app/layout.tsx
- apps/frontend/src/components/ui/Modal.tsx (из Волны 2)
- apps/frontend/src/components/ui/Sheet.tsx (из Волны 2)

## Критерии готовности
- [ ] Back button работает на Android
- [ ] History navigation корректная
- [ ] Exit confirmation на home
- [ ] Modal/Sheet закрываются
- [ ] Web fallback (no-op)

## После завершения
npm run build --workspace=frontend && npx cap sync android
```

---

## Волна 4: Локализация и тестирование

**Запускается после Волны 3**
**Можно запустить параллельно: 3 агента**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 4.1   │ │ Агент 4.2   │ │ Агент 4.3   │
│ i18n EN     │ │ i18n UZ/TJ  │ │ i18n KY     │
│ L: перевод  │ │ L: перевод  │ │ M: перевод  │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

### Агенты 4.1-4.3: Локализация

**Примечание**: Эти задачи требуют ручного перевода или интеграции с translation API. Агенты могут подготовить структуру и автоматизировать процесс.

```
## Задача: Завершение локализации [ЯЗЫК]

## Контекст
- apps/frontend/src/locales/ru.json содержит ~1670 ключей
- Нужно перевести на [en/uz/tg/ky]

## Шаги
1. Извлечь все ключи из ru.json
2. Для каждого ключа:
   - Если перевод есть — проверить качество
   - Если нет — добавить перевод
3. Проверить форматирование (плейсхолдеры {name})
4. Проверить pluralization

## Критерии готовности
- [ ] 100% ключей переведено
- [ ] Плейсхолдеры сохранены
- [ ] Нет missing translations
```

---

## Сводная таблица параллельности

| Волна | Агенты | Задачи | Зависимости |
|-------|--------|--------|-------------|
| **1** | 6 параллельно | Audit, Recovery BE, Users, HMAC, Redis, CI/CD | Нет |
| **2** | 5 параллельно | Legal, Ban Check, Offline Queue, UI Lib, Docker | Волна 1 (частично) |
| **3** | 4 параллельно | Recovery FE, Reference, Deep Links, Back Button | Волна 2 |
| **4** | 3 параллельно | i18n EN, i18n UZ/TJ, i18n KY | Волна 3 |

---

## Команды запуска

### Волна 1 (6 параллельных агентов)
```bash
# Терминал 1
claude "Выполни задачу Агента 1.1 (Audit Log) из docs/EXECUTION_PLAN.md"

# Терминал 2
claude "Выполни задачу Агента 1.2 (Recovery BE) из docs/EXECUTION_PLAN.md"

# Терминал 3
claude "Выполни задачу Агента 1.3 (User Management) из docs/EXECUTION_PLAN.md"

# Терминал 4
claude "Выполни задачу Агента 1.4 (HMAC Signing) из docs/EXECUTION_PLAN.md"

# Терминал 5
claude "Выполни задачу Агента 1.5 (Redis Cache) из docs/EXECUTION_PLAN.md"

# Терминал 6
claude "Выполни задачу Агента 1.6 (CI/CD) из docs/EXECUTION_PLAN.md"
```

### Волна 2 (после завершения Волны 1)
```bash
# Терминал 1
claude "Выполни задачу Агента 2.1 (Legal Core) из docs/EXECUTION_PLAN.md"

# Терминал 2
claude "Выполни задачу Агента 2.2 (Ban Check) из docs/EXECUTION_PLAN.md"

# Терминал 3
claude "Выполни задачу Агента 2.3 (Offline Queue) из docs/EXECUTION_PLAN.md"

# Терминал 4
claude "Выполни задачу Агента 2.4 (UI Library) из docs/EXECUTION_PLAN.md"

# Терминал 5
claude "Выполни задачу Агента 2.5 (Docker Prod) из docs/EXECUTION_PLAN.md"
```

---

## Оценка ресурсов

| Волна | Агентов | Расчётное время (последовательно) | Время (параллельно) |
|-------|---------|-----------------------------------|---------------------|
| 1 | 6 | ~6 часов | ~1.5 часа |
| 2 | 5 | ~8 часов | ~2 часа |
| 3 | 4 | ~4 часа | ~1.5 часа |
| 4 | 3 | ~6 часов (перевод) | ~3 часа |

**Итого параллельно: ~8 часов активной работы**

---

*Документ создан: 2026-01-27*
