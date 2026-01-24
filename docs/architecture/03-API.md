# Блок 3: API Спецификация

> Полная спецификация REST API MigrantHub

---

## Содержание

1. [Общие принципы](#1-общие-принципы)
2. [Аутентификация](#2-аутентификация)
3. [API Core](#3-api-core)
4. [API AI](#4-api-ai)
5. [API Notify](#5-api-notify)
6. [Legal Core](#6-legal-core)
7. [Коды ошибок](#7-коды-ошибок)

---

## 1. Общие принципы

### 1.1 Base URL

```
Production:  https://api.migranthub.ru/api/v1
Staging:     https://staging-api.migranthub.ru/api/v1
```

### 1.2 Версионирование

```
URL-based: /api/v1/...
           /api/v2/...

Headers:
  X-API-Version: 1.0.0
  X-Min-App-Version: 1.2.0  (минимальная версия приложения)
```

### 1.3 Формат запросов/ответов

```
Content-Type: application/json
Accept: application/json
Accept-Language: ru, uz, tg, ky, en
```

### 1.4 Стандартный ответ

```typescript
// Успешный ответ
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: Pagination;
    version?: string;
  };
}

// Ответ с ошибкой
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 'AUTH_REQUIRED', 'VALIDATION_ERROR'
    message: string;        // Human-readable message
    details?: any;          // Дополнительные детали
    field?: string;         // Поле с ошибкой (для валидации)
  };
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
```

### 1.5 Rate Limiting

```
Headers в ответе:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1704067200 (timestamp)

При превышении: 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Слишком много запросов",
    "retryAfter": 60
  }
}
```

### 1.6 Request Signing

Все запросы должны быть подписаны:

```typescript
// Headers
X-Device-ID: uuid
X-Timestamp: 1704067200000
X-Nonce: uuid
X-Signature: base64(HMAC-SHA256(signatureBase, apiSecret))

// Signature Base
signatureBase = [
  method,          // 'POST'
  path,            // '/api/v1/users/profile'
  timestamp,
  nonce,
  body ? JSON.stringify(body) : ''
].join('\n');
```

---

## 2. Аутентификация

### 2.1 Device Registration

```http
POST /api/v1/auth/device/register
```

**Request:**
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "ios",
  "appVersion": "1.0.0",
  "osVersion": "iOS 17.2",
  "locale": "ru",
  "timezone": "Europe/Moscow"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "ak_xxx...",
    "apiSecret": "as_xxx...",
    "encryptionKey": "ek_xxx...",
    "recoveryCode": "абрикос автор агент адрес азия актер альбом ангел арбуз армия астра атом"
  }
}
```

### 2.2 Recovery Code Verification

```http
POST /api/v1/auth/recovery/verify
```

**Request:**
```json
{
  "recoveryCode": "абрикос автор агент ...",
  "newDeviceId": "new-device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "apiKey": "ak_xxx...",
    "apiSecret": "as_xxx...",
    "migrationRequired": true
  }
}
```

### 2.3 Telegram Auth

```http
POST /api/v1/auth/telegram
```

**Request:**
```json
{
  "initData": "telegram-webapp-init-data",
  "deviceId": "device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "userId": "user-uuid",
    "linkedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2.4 VK Auth

```http
POST /api/v1/auth/vk
```

**Request:**
```json
{
  "silentToken": "vk-silent-token",
  "uuid": "vk-uuid",
  "deviceId": "device-uuid"
}
```

---

## 3. API Core

### 3.1 Users

#### Get Profile

```http
GET /api/v1/users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "citizenshipCode": "UZ",
    "regionCode": "77",
    "entryDate": "2024-01-15",
    "purpose": "work",
    "isEAEU": false,
    "onboardingCompleted": true,
    "language": "ru",
    "timezone": "Europe/Moscow",
    "checklist": [
      {"id": "registration", "completed": false, "deadline": "2024-01-22"},
      {"id": "patent", "completed": true, "completedAt": "2024-01-16"}
    ],
    "subscription": {
      "type": "plus",
      "until": "2024-12-31T23:59:59Z",
      "autoRenew": true
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Profile

```http
PATCH /api/v1/users/profile
```

**Request:**
```json
{
  "citizenshipCode": "UZ",
  "regionCode": "77",
  "entryDate": "2024-01-15",
  "purpose": "work",
  "language": "uz",
  "timezone": "Asia/Tashkent"
}
```

#### Complete Onboarding

```http
POST /api/v1/users/onboarding/complete
```

**Request:**
```json
{
  "citizenshipCode": "UZ",
  "regionCode": "77",
  "entryDate": "2024-01-15",
  "purpose": "work",
  "notificationsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checklist": [
      {"id": "registration", "deadline": "2024-01-22", "priority": "high"},
      {"id": "patent", "deadline": "2024-02-15", "priority": "medium"},
      {"id": "medical", "deadline": "2024-04-15", "priority": "low"}
    ],
    "nextDeadline": {
      "id": "registration",
      "daysLeft": 7
    }
  }
}
```

#### Calculate Deadlines

```http
POST /api/v1/users/calculate
```

**Request:**
```json
{
  "citizenshipCode": "UZ",
  "entryDate": "2024-01-15",
  "purpose": "work",
  "regionCode": "77",
  "hasPatent": false,
  "hasRegistration": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deadlines": [
      {
        "type": "registration",
        "date": "2024-01-22",
        "daysLeft": 7,
        "status": "urgent",
        "description": "Регистрация по месту пребывания",
        "penalty": "Штраф 2000-5000₽ или выдворение"
      },
      {
        "type": "90_180",
        "date": "2024-04-14",
        "daysLeft": 90,
        "daysUsed": 0,
        "daysRemaining": 90,
        "status": "ok"
      },
      {
        "type": "patent_obtain",
        "date": "2024-02-14",
        "daysLeft": 30,
        "status": "upcoming",
        "description": "Получение патента на работу"
      }
    ],
    "calculations": {
      "stayDaysUsed": 0,
      "stayDaysRemaining": 90,
      "isEAEU": false,
      "registrationDeadlineDays": 7
    }
  }
}
```

#### Delete Account

```http
DELETE /api/v1/users/account
```

**Request:**
```json
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "reason": "no_longer_needed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedAt": "2024-01-15T10:30:00Z",
    "dataRetentionDays": 30
  }
}
```

### 3.2 Billing

#### Get Products

```http
GET /api/v1/billing/products
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plus",
        "name": "Plus",
        "description": "Безлимитные документы и AI",
        "prices": {
          "monthly": {"amount": 9900, "currency": "RUB"},
          "yearly": {"amount": 79000, "currency": "RUB", "discount": 33}
        },
        "features": {
          "documents": "unlimited",
          "aiQuestions": 30,
          "backup": true,
          "backupSizeMb": 500
        }
      },
      {
        "id": "pro",
        "name": "Pro",
        "description": "Всё включено + приоритетная поддержка",
        "prices": {
          "monthly": {"amount": 24900, "currency": "RUB"},
          "yearly": {"amount": 199000, "currency": "RUB", "discount": 33}
        },
        "features": {
          "documents": "unlimited",
          "aiQuestions": "unlimited",
          "backup": true,
          "backupSizeMb": 1024,
          "backupVersions": 5,
          "prioritySupport": true
        },
        "recommended": true
      }
    ],
    "addons": [
      {
        "id": "ai_pack_10",
        "name": "10 вопросов AI",
        "price": {"amount": 4900, "currency": "RUB"},
        "type": "one_time"
      }
    ]
  }
}
```

#### Create Payment

```http
POST /api/v1/billing/payments
```

**Request:**
```json
{
  "planId": "plus",
  "period": "yearly",
  "promoCode": "WELCOME50",
  "paymentMethod": "sbp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment-uuid",
    "amount": 39500,
    "currency": "RUB",
    "discount": {
      "code": "WELCOME50",
      "percent": 50,
      "saved": 39500
    },
    "confirmation": {
      "type": "redirect",
      "url": "https://yookassa.ru/checkout/..."
    },
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

#### Validate Promo Code

```http
POST /api/v1/billing/promo/validate
```

**Request:**
```json
{
  "code": "WELCOME50",
  "planId": "plus",
  "period": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": {
      "type": "percent",
      "value": 50
    },
    "applicablePlans": ["plus", "pro"],
    "applicablePeriods": ["monthly", "yearly"],
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

#### Get Payment History

```http
GET /api/v1/billing/payments?page=1&perPage=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment-uuid",
        "amount": 79000,
        "currency": "RUB",
        "status": "succeeded",
        "planId": "plus",
        "period": "yearly",
        "createdAt": "2024-01-15T10:30:00Z",
        "receiptUrl": "https://yookassa.ru/receipt/..."
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Cancel Subscription

```http
POST /api/v1/billing/subscription/cancel
```

**Request:**
```json
{
  "reason": "too_expensive",
  "feedback": "Слишком дорого для меня"
}
```

### 3.3 Backup (Cloud Safe)

#### Get Upload URL

```http
POST /api/v1/backup/upload-url
```

**Request:**
```json
{
  "sizeBytes": 1048576,
  "checksum": "sha256-hash-of-encrypted-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backupId": "backup-uuid",
    "uploadUrl": "https://s3.selectel.ru/migranthub-backups/...",
    "expiresAt": "2024-01-15T11:30:00Z",
    "headers": {
      "Content-Type": "application/octet-stream",
      "x-amz-checksum-sha256": "..."
    }
  }
}
```

#### Confirm Upload

```http
POST /api/v1/backup/{backupId}/confirm
```

**Request:**
```json
{
  "salt": "base64-encoded-salt",
  "iv": "base64-encoded-iv",
  "checksum": "sha256-hash"
}
```

#### List Backups

```http
GET /api/v1/backup/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "id": "backup-uuid",
        "version": 5,
        "isCurrent": true,
        "sizeBytes": 1048576,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "backup-uuid-2",
        "version": 4,
        "isCurrent": false,
        "sizeBytes": 1024000,
        "createdAt": "2024-01-14T10:30:00Z"
      }
    ],
    "totalSize": 5242880,
    "maxSize": 524288000,
    "maxVersions": 5
  }
}
```

#### Get Download URL

```http
GET /api/v1/backup/{backupId}/download-url
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.selectel.ru/...",
    "salt": "base64-encoded-salt",
    "iv": "base64-encoded-iv",
    "checksum": "sha256-hash",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

#### Delete Backup

```http
DELETE /api/v1/backup/{backupId}
```

---

## 4. API AI

### 4.1 Chat

#### Send Message

```http
POST /api/v1/ai/chat
```

**Request:**
```json
{
  "message": "Какой срок регистрации для граждан Узбекистана?",
  "conversationId": "conv-uuid",
  "context": {
    "citizenshipCode": "UZ",
    "regionCode": "77",
    "purpose": "work"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg-uuid",
    "conversationId": "conv-uuid",
    "response": "Для граждан Узбекистана срок постановки на миграционный учёт составляет **7 рабочих дней** с момента въезда в Россию...",
    "sources": [
      {
        "type": "law",
        "code": "109-FZ",
        "article": "20",
        "title": "Федеральный закон о миграционном учёте"
      }
    ],
    "relatedQuestions": [
      "Как встать на миграционный учёт?",
      "Какие документы нужны для регистрации?",
      "Что будет если просрочить регистрацию?"
    ],
    "tokensUsed": 450
  }
}
```

#### Stream Response

```http
POST /api/v1/ai/chat/stream
Content-Type: application/json
Accept: text/event-stream
```

**Request:** Same as chat

**Response (SSE):**
```
data: {"type": "start", "messageId": "msg-uuid"}

data: {"type": "chunk", "content": "Для граждан "}
data: {"type": "chunk", "content": "Узбекистана "}
data: {"type": "chunk", "content": "срок "}
...
data: {"type": "sources", "sources": [...]}
data: {"type": "done", "tokensUsed": 450}
```

### 4.2 Feedback

```http
POST /api/v1/ai/feedback
```

**Request:**
```json
{
  "messageId": "msg-uuid",
  "feedback": "helpful",
  "comment": "Очень полезный ответ"
}
```

### 4.3 Status

```http
GET /api/v1/ai/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "degraded": false,
    "quotaRemaining": 25,
    "quotaResetAt": "2024-01-16T00:00:00Z"
  }
}
```

---

## 5. API Notify

### 5.1 Push Devices

#### Register Push Token

```http
POST /api/v1/notifications/push/register
```

**Request:**
```json
{
  "token": "fcm-token-xxx",
  "provider": "fcm"
}
```

#### Unregister Push Token

```http
DELETE /api/v1/notifications/push/unregister
```

### 5.2 Notification Settings

#### Get Settings

```http
GET /api/v1/notifications/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    },
    "channels": {
      "push": true,
      "telegram": true,
      "vk": false,
      "email": false,
      "sms": false
    },
    "types": {
      "deadlineReminders": true,
      "deadlineReminderDays": [30, 14, 7, 3, 1],
      "legalUpdates": true,
      "legalUpdatesCriticalOnly": false,
      "paymentReminders": true,
      "marketing": false
    }
  }
}
```

#### Update Settings

```http
PATCH /api/v1/notifications/settings
```

**Request:**
```json
{
  "quietHours": {
    "enabled": true,
    "start": "23:00",
    "end": "07:00"
  },
  "types": {
    "marketing": false
  }
}
```

### 5.3 Notification History

#### Get Notifications

```http
GET /api/v1/notifications?page=1&perPage=20&unreadOnly=false
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "type": "deadline",
        "subtype": "patent_payment",
        "priority": "high",
        "title": "Оплата патента через 7 дней",
        "body": "Не забудьте оплатить патент до 22 января",
        "sentAt": "2024-01-15T10:30:00Z",
        "readAt": null,
        "action": {
          "type": "navigate",
          "screen": "patent_payment"
        }
      }
    ],
    "unreadCount": 3
  },
  "meta": {
    "pagination": {...}
  }
}
```

#### Mark as Read

```http
POST /api/v1/notifications/read
```

**Request:**
```json
{
  "notificationIds": ["notif-uuid-1", "notif-uuid-2"]
}
```

#### Snooze Notification

```http
POST /api/v1/notifications/{id}/snooze
```

**Request:**
```json
{
  "duration": "3_hours"
}
```

### 5.4 Badge Count

```http
GET /api/v1/notifications/badge
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "byType": {
      "deadline": 3,
      "legalUpdate": 1,
      "payment": 1
    }
  }
}
```

### 5.5 Telegram Integration

#### Get Bot Link

```http
GET /api/v1/notifications/telegram/link
```

**Response:**
```json
{
  "success": true,
  "data": {
    "botUsername": "migranthub_bot",
    "startParam": "link_abc123",
    "deepLink": "https://t.me/migranthub_bot?start=link_abc123"
  }
}
```

#### Disconnect Telegram

```http
DELETE /api/v1/notifications/telegram/disconnect
```

### 5.6 VK Integration

#### Get VK Link

```http
GET /api/v1/notifications/vk/link
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appId": 123456,
    "miniAppUrl": "https://vk.com/app123456"
  }
}
```

---

## 6. Legal Core

### 6.1 Reference (Справочник)

#### Get Categories

```http
GET /api/v1/legal/categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "entry",
        "name": "Въезд в Россию",
        "icon": "plane",
        "itemCount": 12
      },
      {
        "id": "registration",
        "name": "Регистрация",
        "icon": "home",
        "itemCount": 8
      },
      {
        "id": "work",
        "name": "Работа",
        "icon": "briefcase",
        "itemCount": 15
      },
      {
        "id": "documents",
        "name": "Документы",
        "icon": "file",
        "itemCount": 20
      }
    ]
  }
}
```

#### Get Category Items

```http
GET /api/v1/legal/categories/{categoryId}/items?citizenship=UZ&region=77
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-uuid",
        "title": "Миграционный учёт",
        "summary": "Постановка на учёт по месту пребывания",
        "type": "guide",
        "relevance": "high"
      }
    ]
  }
}
```

### 6.2 Laws

#### Search Laws

```http
GET /api/v1/legal/laws?q=регистрация&category=migration
```

**Response:**
```json
{
  "success": true,
  "data": {
    "laws": [
      {
        "id": "law-uuid",
        "code": "109-FZ",
        "name": "О миграционном учёте иностранных граждан",
        "category": "migration",
        "currentVersion": 15,
        "effectiveDate": "2024-01-01",
        "summary": "Регулирует порядок миграционного учёта..."
      }
    ]
  }
}
```

#### Get Law Details

```http
GET /api/v1/legal/laws/{lawId}?version=current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "law": {
      "id": "law-uuid",
      "code": "109-FZ",
      "name": "О миграционном учёте иностранных граждан и лиц без гражданства в Российской Федерации",
      "version": 15,
      "effectiveDate": "2024-01-01",
      "content": "# Глава 1. Общие положения\n\n## Статья 1. Предмет регулирования...",
      "articles": [
        {"number": "1", "title": "Предмет регулирования"},
        {"number": "2", "title": "Основные понятия"}
      ]
    },
    "history": [
      {"version": 15, "effectiveDate": "2024-01-01", "changes": "Изменения в ст. 5"},
      {"version": 14, "effectiveDate": "2023-07-01", "changes": "Новая редакция ст. 20"}
    ]
  }
}
```

### 6.3 Forms

#### Get Forms

```http
GET /api/v1/legal/forms?citizenship=UZ&purpose=work&region=77
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forms": [
      {
        "id": "form-uuid",
        "code": "migration_card",
        "name": "Миграционная карта",
        "required": true,
        "description": "Выдаётся при пересечении границы",
        "templateUrl": "https://cdn.migranthub.ru/forms/migration_card.pdf",
        "sampleUrl": "https://cdn.migranthub.ru/forms/migration_card_sample.pdf"
      },
      {
        "id": "form-uuid-2",
        "code": "registration_form",
        "name": "Уведомление о прибытии",
        "required": true,
        "description": "Для постановки на миграционный учёт",
        "templateUrl": "https://cdn.migranthub.ru/forms/registration.pdf",
        "instructions": "Заполняется принимающей стороной..."
      }
    ]
  }
}
```

### 6.4 Calculators

#### Patent Price Calculator

```http
GET /api/v1/legal/calculators/patent-price?region=77
```

**Response:**
```json
{
  "success": true,
  "data": {
    "region": {
      "code": "77",
      "name": "Москва"
    },
    "price": {
      "monthly": 650000,
      "currency": "RUB",
      "effectiveFrom": "2024-01-01"
    },
    "components": {
      "baseTax": 120000,
      "regionalCoefficient": 2.4813,
      "deflatorCoefficient": 2.27
    },
    "paymentDeadline": "До окончания срока действия патента"
  }
}
```

#### Stay Calculator (90/180)

```http
POST /api/v1/legal/calculators/stay
```

**Request:**
```json
{
  "entries": [
    {"entryDate": "2024-01-15", "exitDate": null}
  ],
  "citizenship": "UZ",
  "isEAEU": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rule": "90/180",
    "periodStart": "2023-07-18",
    "periodEnd": "2024-01-15",
    "daysUsed": 0,
    "daysRemaining": 90,
    "maxStay": 90,
    "mustLeaveBy": "2024-04-14",
    "canReturnAfter": null,
    "warnings": []
  }
}
```

### 6.5 Regions

```http
GET /api/v1/legal/regions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "regions": [
      {
        "code": "77",
        "name": "Москва",
        "patentPrice": 650000,
        "timezone": "Europe/Moscow"
      },
      {
        "code": "78",
        "name": "Санкт-Петербург",
        "patentPrice": 450000,
        "timezone": "Europe/Moscow"
      }
    ]
  }
}
```

### 6.6 FAQ

```http
GET /api/v1/legal/faq?category=registration&citizenship=UZ&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "faq": [
      {
        "id": "faq-uuid",
        "question": "Какой срок регистрации для граждан Узбекистана?",
        "answer": "Граждане Узбекистана должны встать на миграционный учёт в течение **7 рабочих дней** с момента въезда...",
        "category": "registration",
        "helpful": 156,
        "notHelpful": 12
      }
    ]
  }
}
```

### 6.7 Updates (Legal Changes)

```http
GET /api/v1/legal/updates?since=2024-01-01&citizenship=UZ
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updates": [
      {
        "id": "update-uuid",
        "type": "law_change",
        "criticality": "important",
        "title": "Изменения в порядке выдачи патентов",
        "summary": "С 1 января 2024 года изменён порядок...",
        "affectedCitizenships": ["UZ", "TJ", "KG"],
        "effectiveDate": "2024-01-01",
        "publishedAt": "2023-12-15T10:00:00Z",
        "lawCode": "115-FZ",
        "lawArticle": "13.3"
      }
    ],
    "lastCheckedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 7. Коды ошибок

### 7.1 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### 7.2 Error Codes

#### Authentication

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Требуется аутентификация |
| AUTH_INVALID_SIGNATURE | Неверная подпись запроса |
| AUTH_EXPIRED | Срок действия токена истёк |
| AUTH_DEVICE_NOT_FOUND | Устройство не зарегистрировано |
| AUTH_RECOVERY_INVALID | Неверный код восстановления |

#### Validation

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Ошибка валидации |
| INVALID_CITIZENSHIP | Неверный код гражданства |
| INVALID_REGION | Неверный код региона |
| INVALID_DATE | Неверный формат даты |

#### Billing

| Code | Description |
|------|-------------|
| PAYMENT_FAILED | Платёж не прошёл |
| SUBSCRIPTION_REQUIRED | Требуется подписка |
| PROMO_CODE_INVALID | Промокод недействителен |
| PROMO_CODE_EXPIRED | Промокод истёк |

#### AI

| Code | Description |
|------|-------------|
| AI_UNAVAILABLE | AI-сервис недоступен |
| AI_QUOTA_EXCEEDED | Превышен лимит запросов |
| AI_PII_DETECTED | Обнаружены персональные данные |

#### Backup

| Code | Description |
|------|-------------|
| BACKUP_SIZE_EXCEEDED | Превышен размер бэкапа |
| BACKUP_QUOTA_EXCEEDED | Превышен лимит хранилища |
| BACKUP_NOT_FOUND | Бэкап не найден |
| BACKUP_CORRUPTED | Бэкап повреждён |

### 7.3 Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации данных",
    "details": [
      {
        "field": "entryDate",
        "message": "Дата въезда не может быть в будущем"
      },
      {
        "field": "citizenshipCode",
        "message": "Неизвестный код гражданства"
      }
    ]
  }
}
```

---

## Appendix: OpenAPI Specification

Полная OpenAPI 3.0 спецификация доступна:
- Production: https://api.migranthub.ru/api/docs
- JSON: https://api.migranthub.ru/api/openapi.json
- YAML: https://api.migranthub.ru/api/openapi.yaml

---

*Документ: 03-API.md*
*Блок 3 из 6 архитектурной документации MigrantHub*
