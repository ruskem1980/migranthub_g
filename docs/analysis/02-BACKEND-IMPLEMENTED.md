# Реализованный Backend

## Modules Overview

| Модуль | Статус | Контроллеры | Сервисы | Описание |
|--------|--------|-------------|---------|----------|
| AuthModule | ✅ Готов | 1 | 1 | Device auth + JWT refresh |
| UsersModule | ✅ Готов | 1 | 1 | Профиль пользователя |
| UtilitiesModule | ⚠️ Частично | 2 | 2 | Ban-check (заглушка), Patent |
| HealthModule | ✅ Готов | 1 | 0 | Health check |
| SentryModule | ✅ Готов | 0 | 0 | Мониторинг (production) |

---

## API Endpoints

### Auth Module

**Путь**: `/api/v1/auth`

| ID | Метод | Путь | Описание | Guard | Rate Limit | Статус |
|----|-------|------|----------|-------|------------|--------|
| IMP-BE-001 | POST | /auth/device | Аутентификация устройства | - (Public) | 5 req/min | ✅ |
| IMP-BE-002 | POST | /auth/refresh | Обновление токенов | - (Public) | 10 req/min | ✅ |

---

### Users Module

**Путь**: `/api/v1/users`

| ID | Метод | Путь | Описание | Guard | Статус |
|----|-------|------|----------|-------|--------|
| IMP-BE-003 | GET | /users/me | Получить профиль | JwtAuthGuard | ✅ |
| IMP-BE-004 | PATCH | /users/me | Обновить профиль | JwtAuthGuard | ✅ |

---

### Utilities Module

**Путь**: `/api/v1/utilities`

| ID | Метод | Путь | Описание | Guard | Статус |
|----|-------|------|----------|-------|--------|
| IMP-BE-005 | GET | /utilities/ban-check | Проверка запрета въезда | JwtAuthGuard | ⚠️ Заглушка |
| IMP-BE-006 | GET | /utilities/patent/regions | Цены патентов по регионам | - (Public) | ✅ |

---

### Health Module

**Путь**: `/api/v1/health`

| ID | Метод | Путь | Описание | Guard | Статус |
|----|-------|------|----------|-------|--------|
| IMP-BE-007 | GET | /health | Health check | - (Public) | ✅ |

---

## Services

### AuthService

| Метод | Описание | Реализация |
|-------|----------|------------|
| `deviceAuth(dto)` | Регистрация/аутентификация устройства | ✅ Полная |
| `refreshToken(refreshToken)` | Обновление пары токенов | ✅ Полная |
| `validateUser(userId)` | Валидация пользователя для JWT | ✅ Полная |
| `generateTokens(user)` | Генерация access + refresh токенов | ✅ Полная |
| `hashToken(token)` | SHA256 хеширование токена | ✅ Полная |

---

### UsersService

| Метод | Описание | Реализация |
|-------|----------|------------|
| `getProfile(userId)` | Получение профиля по ID | ✅ Полная |
| `updateProfile(userId, dto)` | Обновление полей профиля | ✅ Полная |
| `mergeSettings(...)` | Слияние настроек пользователя | ✅ Полная |

---

### BanCheckService

| Метод | Описание | Реализация |
|-------|----------|------------|
| `checkBan(query)` | Проверка запрета на въезд | ⚠️ Заглушка (всегда NO_BAN) |

**Примечание**: В production должен быть прокси к API МВД: `https://services.fms.gov.ru/info-service.htm?sid=2000`

---

### PatentService

| Метод | Описание | Реализация |
|-------|----------|------------|
| `getRegions()` | Список регионов с ценами | ✅ Полная (статические данные) |
| `getRegionByCode(code)` | Поиск региона по коду | ✅ Полная |

---

## DTOs

### Auth Module

**DeviceAuthDto** (входной)
```typescript
{
  deviceId: string       // 36-64 символа, UUID формат
  platform: 'ios' | 'android' | 'web'
  appVersion: string     // 1-20 символов, semver
  locale?: string        // 2-5 символов, по умолчанию 'ru'
}
```

**RefreshTokenDto** (входной)
```typescript
{
  refreshToken: string   // JWT token
}
```

**AuthResponseDto** (выходной)
```typescript
{
  accessToken: string    // JWT, 24h
  refreshToken: string   // JWT, 30d
  userId: string         // UUID
  isNewUser: boolean
}
```

---

### Users Module

**UpdateUserDto** (входной, все опционально)
```typescript
{
  citizenshipCode?: string   // ISO 3166-1 alpha-3 (например 'UZB')
  regionCode?: string        // Код региона (например '77')
  entryDate?: string         // ISO date
  settings?: {
    locale?: string
    timezone?: string
    notifications?: {
      push?: boolean
      telegram?: boolean
      deadlines?: boolean
      news?: boolean
    }
  }
}
```

**UserResponseDto** (выходной)
```typescript
{
  id: string
  citizenshipCode: string | null
  regionCode: string | null
  entryDate: Date | null
  subscriptionType: string       // default 'free'
  subscriptionExpiresAt: Date | null
  settings: UserSettings
  createdAt: Date
  updatedAt: Date
}
```

---

### Utilities Module

**BanCheckQueryDto** (входной)
```typescript
{
  lastName: string    // 1-100, латиница
  firstName: string   // 1-100, латиница
  birthDate: string   // ISO date
}
```

**BanCheckResponseDto** (выходной)
```typescript
{
  status: 'no_ban' | 'ban_found' | 'check_failed'
  reason?: string
  expiresAt?: string
  checkedAt: string
  error?: string
}
```

**PatentRegionsResponseDto** (выходной)
```typescript
{
  regions: Array<{
    code: string
    name: string
    price: number
  }>
  updatedAt: string
}
```

---

## Guards & Strategies

### JwtAuthGuard

- Глобальный guard (APP_GUARD)
- Extends `AuthGuard('jwt')`
- Поддерживает `@Public()` decorator для исключения
- Проверяет Bearer token в Authorization header

### JwtStrategy

- Извлекает token из `Authorization: Bearer <token>`
- Валидирует тип токена (должен быть 'access')
- Проверяет наличие пользователя в БД
- Возвращает: `{ id, deviceId, subscriptionType }`

---

## Decorators

| Декоратор | Описание | Использование |
|-----------|----------|---------------|
| `@Public()` | Отмечает эндпоинт как публичный | На методах контроллера |
| `@CurrentUser()` | Извлекает текущего пользователя | В параметрах методов |
| `@CurrentUser('id')` | Извлекает конкретное поле | В параметрах методов |

---

## Entities

### User Entity

**Таблица**: `users`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID (PK) | Автогенерируемый ID |
| `deviceId` | varchar(64) | Уникальный ID устройства (индекс) |
| `citizenshipCode` | varchar(3) | Код страны гражданства |
| `regionCode` | varchar(10) | Код региона в РФ |
| `entryDate` | Date | Дата въезда в Россию |
| `subscriptionType` | varchar(20) | Тип подписки (default: 'free') |
| `subscriptionExpiresAt` | Date | Дата истечения подписки |
| `settings` | jsonb | Настройки пользователя |
| `refreshTokenHash` | varchar(64) | SHA256 хеш refresh token |
| `createdAt` | timestamp | Дата создания |
| `updatedAt` | timestamp | Дата обновления |

---

## Interceptors & Filters

### HttpExceptionFilter

- Глобальный обработчик исключений
- Возвращает стандартизированный ErrorResponse
- Логирует ERROR для 5xx, WARN для остальных

### LoggingInterceptor

- Логирует все HTTP запросы/ответы
- Формат: `METHOD PATH STATUS CONTENT-LENGTH DURATIONms`
- Поддерживает X-Request-ID header

### TransformInterceptor

- Оборачивает ответы в стандартный формат
- Структура:
```typescript
{
  data: T,
  meta: {
    timestamp: string
    path: string
    version: 'v1'
    pagination?: {...}
  }
}
```

---

## Configuration

### JWT Config

| Параметр | Env Variable | Default |
|----------|--------------|---------|
| secret | JWT_SECRET | 'change-me-in-production' |
| refreshSecret | JWT_REFRESH_SECRET | 'change-refresh-me-in-production' |
| accessExpiresIn | JWT_ACCESS_EXPIRES_IN | '24h' |
| refreshExpiresIn | JWT_REFRESH_EXPIRES_IN | '30d' |

### Database Config

| Параметр | Env Variable | Default |
|----------|--------------|---------|
| host | DB_HOST | 'localhost' |
| port | DB_PORT | 5432 |
| username | DB_USERNAME | 'postgres' |
| password | DB_PASSWORD | 'postgres' |
| name | DB_NAME | 'migranthub' |

### App Config

| Параметр | Env Variable | Default |
|----------|--------------|---------|
| nodeEnv | NODE_ENV | 'development' |
| port | PORT | 3000 |
| apiPrefix | API_PREFIX | 'api' |
| corsOrigins | CORS_ORIGINS | ['http://localhost:3001'] |

---

## Глобальные настройки

- **API Prefix**: `/api`
- **Versioning**: URI-based, default v1 → `/api/v1/...`
- **Rate Limiting**: 100 req/60s (по умолчанию)
- **Swagger**: `/api/docs`
- **Validation**: whitelist, forbidNonWhitelisted, transform

---

## Missing/Incomplete

### Заглушки (требуют интеграции)

- [ ] **BanCheckService.checkBan()** — всегда возвращает NO_BAN
  - Нужна интеграция с API МВД: `https://services.fms.gov.ru/info-service.htm?sid=2000`

### Нереализованные модули (упомянуты в Swagger)

- [ ] **Documents Module** — управление документами
- [ ] **Checklists Module** — чек-листы для мигрантов

### Отсутствующие функции

- [ ] Notifications (push, telegram)
- [ ] Subscription management (payment integration)
- [ ] Document generation/storage
- [ ] Legal news/updates integration
- [ ] Multi-language support (i18n)

---

## Ключевые файлы

```
apps/api-core/src/
├── app.module.ts                           # Главный модуль
├── main.ts                                 # Точка входа
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   └── sentry/
│       └── sentry.module.ts
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   ├── guards/
    │   └── strategies/
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── dto/
    │   └── entities/
    ├── utilities/
    │   ├── utilities.module.ts
    │   ├── ban-check/
    │   │   ├── ban-check.controller.ts
    │   │   ├── ban-check.service.ts
    │   │   └── dto/
    │   └── patent/
    │       ├── patent.controller.ts
    │       ├── patent.service.ts
    │       ├── dto/
    │       └── data/regions.json
    └── health/
        └── health.controller.ts
```
