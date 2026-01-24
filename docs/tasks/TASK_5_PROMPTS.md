# Task #5: Auth Module — Промпты для подзадач

## Подзадача 5.1: Auth Module + User Entity + DTOs

```
## Задача: Auth Module - Scaffold + User Entity

## Контекст
Проект MigrantHub, apps/api-core уже создан (NestJS).
Нужно добавить device-based аутентификацию.
Архитектура: Local-First, сервер не хранит ПДн.

## Цель
Создать Auth модуль с User entity и базовыми DTOs.

## Шаги
1. Установить зависимости (если не установлены):
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt uuid
   npm install -D @types/passport-jwt @types/uuid

2. Создать User entity (apps/api-core/src/modules/users/):
   - users.module.ts
   - entities/user.entity.ts
   Поля: id, deviceId, citizenshipCode, regionCode, settings, createdAt, updatedAt
   НЕ хранить ПДн (имя, телефон, email)

3. Создать Auth module (apps/api-core/src/modules/auth/):
   - auth.module.ts
   - auth.controller.ts
   - auth.service.ts (заглушки методов)
   - dto/device-auth.dto.ts
   - dto/refresh-token.dto.ts
   - dto/auth-response.dto.ts

4. Endpoints:
   POST /api/v1/auth/device - регистрация устройства
   POST /api/v1/auth/refresh - обновление токена

5. Подключить модули в app.module.ts

## Файлы для создания
- apps/api-core/src/modules/users/users.module.ts
- apps/api-core/src/modules/users/entities/user.entity.ts
- apps/api-core/src/modules/auth/auth.module.ts
- apps/api-core/src/modules/auth/auth.controller.ts
- apps/api-core/src/modules/auth/auth.service.ts
- apps/api-core/src/modules/auth/dto/device-auth.dto.ts
- apps/api-core/src/modules/auth/dto/refresh-token.dto.ts
- apps/api-core/src/modules/auth/dto/auth-response.dto.ts

## Критерии готовности
- [ ] npm run build проходит
- [ ] User entity создана с правильными полями
- [ ] Auth controller имеет 2 endpoint-а
- [ ] DTOs с валидацией (class-validator)
- [ ] Swagger аннотации добавлены

## После завершения
cd apps/api-core && npm run build
Проверить Swagger: http://localhost:3000/api/docs
```

---

## Подзадача 5.2: JWT Strategy + Auth Service Logic

```
## Задача: Auth Module - JWT + Service Logic

## Контекст
Подзадача 5.1 выполнена: User entity, Auth module scaffold, DTOs созданы.
Нужно реализовать логику аутентификации.

## Цель
Реализовать device auth, JWT токены, refresh logic.

## Шаги
1. Создать JWT config:
   - apps/api-core/src/config/jwt.config.ts
   - Обновить config/index.ts

2. Создать JWT Strategy:
   - apps/api-core/src/modules/auth/strategies/jwt.strategy.ts
   - Извлечение payload из токена
   - Валидация пользователя

3. Создать JWT Guard:
   - apps/api-core/src/modules/auth/guards/jwt-auth.guard.ts

4. Реализовать Auth Service:
   - deviceAuth(): создать/найти пользователя, выдать токены
   - refreshToken(): валидация refresh, выдача новых токенов
   - generateTokens(): создание access + refresh
   - validateRefreshToken(): проверка refresh токена

5. Refresh Token storage:
   - Опция A: Хранить в Redis (рекомендуется)
   - Опция B: Хранить в БД (refresh_tokens table)
   Выбрать: Redis если доступен, иначе БД

6. Rate limiting для auth endpoints:
   - @Throttle({ default: { limit: 5, ttl: 60000 } })

7. Обновить auth.controller.ts - вызывать service методы

## Файлы для создания/изменения
- apps/api-core/src/config/jwt.config.ts
- apps/api-core/src/config/index.ts (update)
- apps/api-core/src/modules/auth/strategies/jwt.strategy.ts
- apps/api-core/src/modules/auth/guards/jwt-auth.guard.ts
- apps/api-core/src/modules/auth/auth.service.ts (implement)
- apps/api-core/src/modules/auth/auth.controller.ts (implement)
- apps/api-core/src/modules/auth/auth.module.ts (update imports)

## JWT Configuration
- Access token: 24 часа
- Refresh token: 30 дней
- Algorithm: HS256
- Secret из env: JWT_SECRET

## Критерии готовности
- [ ] POST /auth/device создаёт пользователя и возвращает токены
- [ ] POST /auth/refresh обновляет токены
- [ ] JWT Guard защищает endpoints
- [ ] Rate limiting работает (5 req/min)
- [ ] npm run build проходит

## После завершения
1. Запустить с Docker: docker compose up -d
2. Тест device auth:
   curl -X POST http://localhost:3000/api/v1/auth/device \
     -H "Content-Type: application/json" \
     -d '{"deviceId":"test-uuid","platform":"web","appVersion":"1.0.0"}'
3. Проверить JWT в ответе
```

---

## Статус

- [ ] 5.1 Auth Scaffold + User Entity
- [ ] 5.2 JWT Strategy + Service Logic
