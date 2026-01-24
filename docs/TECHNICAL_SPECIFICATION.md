# Техническое задание: MigrantHub

**Версия:** 1.0
**Дата:** 2025-01-25
**Статус:** В разработке

---

## 1. Общие сведения

### 1.1 Наименование системы
**MigrantHub** — мобильное приложение для трудовых мигрантов в России

### 1.2 Назначение
Помощь трудовым мигрантам в оформлении документов, отслеживании сроков, получении юридической информации и взаимодействии с государственными органами.

### 1.3 Целевая аудитория
- Трудовые мигранты из стран СНГ (Узбекистан, Таджикистан, Кыргызстан)
- Возраст: 18-55 лет
- Уровень технической грамотности: базовый
- Языки: русский, узбекский, таджикский, кыргызский

### 1.4 Ключевые принципы архитектуры

| Принцип | Описание |
|---------|----------|
| **Local-First** | Все персональные данные хранятся только на устройстве пользователя |
| **Не оператор ПДн** | Сервер не хранит персональные данные → не требуется регистрация в Роскомнадзоре |
| **E2E шифрование** | Резервные копии шифруются на устройстве, сервер видит только зашифрованные blob |
| **Offline-capable** | Основные функции работают без интернета |

---

## 2. Текущее состояние проекта

### 2.1 Реализовано (70-80%)

#### Frontend (apps/frontend)
| Компонент | Статус | Описание |
|-----------|--------|----------|
| Next.js 14 + Capacitor | ✅ | Основа приложения |
| Авторизация UI | ✅ | Phone + OTP flow |
| Локализация | ✅ | 5 языков (RU, UZ, TJ, KY, EN) |
| Bottom Navigation | ✅ | 5 вкладок |
| Zustand + React Query | ✅ | State management |
| PWA + Service Worker | ✅ | Offline support |
| IndexedDB (Dexie) | ✅ | Локальное хранилище |
| Document Wizard | ✅ | Генерация документов |
| Passport Scanner UI | ✅ | OCR-ready компонент |

#### Backend (apps/legal-core)
| Компонент | Статус | Описание |
|-----------|--------|----------|
| NestJS микросервис | ✅ | Полностью реализован |
| Web Scraping | ✅ | pravo.gov.ru, garant.ru |
| Diff Engine | ✅ | SHA-256 сравнение |
| RabbitMQ | ✅ | Event publishing |
| REST API | ✅ | CRUD законов |

### 2.2 Требуется разработка

| Модуль | Приоритет | Описание |
|--------|-----------|----------|
| Backend Core API | P0 | Основной API сервер |
| Identity Service | P0 | Авторизация, сессии |
| Document Processing | P0 | OCR, хранение документов |
| AI Assistant | P1 | Чат с юридическим AI |
| Payments | P1 | СБП, ЮKassa |
| Notifications | P1 | Push, Telegram |
| SOS Service | P2 | Экстренная помощь |
| Admin Dashboard | P2 | Управление системой |

---

## 3. Модуль 1: Backend Core API

### 3.1 Общее описание
Основной API сервер на NestJS, обеспечивающий все операции приложения.

### 3.2 Технологический стек
```
Runtime:     Node.js 20 LTS
Framework:   NestJS 10
Database:    PostgreSQL 16
Cache:       Redis 7
Queue:       RabbitMQ 3 / BullMQ
ORM:         TypeORM / Prisma
Validation:  class-validator + class-transformer
Docs:        Swagger/OpenAPI
```

### 3.3 Структура сервиса
```
apps/api-core/
├── src/
│   ├── modules/
│   │   ├── auth/           # Авторизация
│   │   ├── users/          # Пользователи (анонимные)
│   │   ├── backup/         # Cloud Safe (E2E backup)
│   │   ├── billing/        # Подписки, платежи
│   │   ├── notifications/  # Push, email, telegram
│   │   └── health/         # Health checks
│   ├── common/
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Logging, transform
│   │   ├── filters/        # Exception handling
│   │   └── decorators/     # Custom decorators
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── app.ts
│   └── main.ts
├── test/
├── Dockerfile
└── package.json
```

### 3.4 Требования к API

#### 3.4.1 Аутентификация
```typescript
// POST /api/v1/auth/device
// Регистрация устройства
interface DeviceAuthRequest {
  deviceId: string;        // UUID устройства
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  locale: string;
}

interface DeviceAuthResponse {
  accessToken: string;     // JWT, TTL 24h
  refreshToken: string;    // TTL 30 days
  userId: string;          // Анонимный UUID
}

// POST /api/v1/auth/social
// Привязка соц. сети (опционально)
interface SocialAuthRequest {
  provider: 'telegram' | 'vk';
  token: string;
}

// POST /api/v1/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
```

#### 3.4.2 Пользователи (анонимные)
```typescript
// GET /api/v1/users/me
interface UserProfile {
  id: string;
  citizenshipCode: string;    // UZB, TJK, KGZ
  regionCode?: string;        // 77 (Москва)
  entryDate?: string;         // ISO date
  subscriptionType: 'free' | 'plus' | 'pro';
  subscriptionExpiry?: string;
  settings: UserSettings;
  createdAt: string;
}

// PATCH /api/v1/users/me
interface UpdateUserRequest {
  citizenshipCode?: string;
  regionCode?: string;
  entryDate?: string;
  settings?: Partial<UserSettings>;
}

interface UserSettings {
  locale: string;
  notifications: {
    push: boolean;
    telegram: boolean;
    deadlines: boolean;
    news: boolean;
  };
  timezone: string;
}
```

#### 3.4.3 Cloud Safe (E2E Backup)
```typescript
// POST /api/v1/backup
// Загрузка зашифрованного бэкапа
interface BackupUploadRequest {
  encryptedData: string;    // Base64 AES-256-GCM blob
  iv: string;               // Initialization vector
  checksum: string;         // SHA-256 hash
  version: number;          // Schema version
}

interface BackupUploadResponse {
  backupId: string;
  uploadedAt: string;
  sizeBytes: number;
}

// GET /api/v1/backup/latest
interface BackupDownloadResponse {
  backupId: string;
  encryptedData: string;
  iv: string;
  checksum: string;
  version: number;
  createdAt: string;
}

// GET /api/v1/backup/history
interface BackupHistoryResponse {
  backups: {
    id: string;
    createdAt: string;
    sizeBytes: number;
  }[];
}
```

#### 3.4.4 Billing
```typescript
// GET /api/v1/billing/plans
interface PlansResponse {
  plans: {
    id: string;
    name: 'free' | 'plus' | 'pro';
    price: number;           // В копейках
    period: 'month' | 'year';
    features: string[];
    discount?: {
      percent: number;
      until: string;
    };
  }[];
}

// POST /api/v1/billing/subscribe
interface SubscribeRequest {
  planId: string;
  paymentMethod: 'sbp' | 'card' | 'yookassa';
  returnUrl: string;
}

interface SubscribeResponse {
  paymentId: string;
  paymentUrl: string;       // Redirect URL
  status: 'pending';
}

// POST /api/v1/billing/webhook
// Webhook от платёжной системы (внутренний)

// GET /api/v1/billing/status
interface BillingStatusResponse {
  subscription: {
    type: string;
    expiresAt: string;
    autoRenew: boolean;
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}
```

### 3.5 База данных

#### 3.5.1 Схема (PostgreSQL)
```sql
-- Пользователи (без ПДн)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) UNIQUE NOT NULL,
    citizenship_code VARCHAR(3),
    region_code VARCHAR(10),
    entry_date DATE,
    telegram_id_hash VARCHAR(64),  -- SHA256 хеш
    subscription_type VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_device ON users(device_id);
CREATE INDEX idx_users_subscription ON users(subscription_type, subscription_expires_at);

-- Бэкапы (зашифрованные)
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    encrypted_data BYTEA NOT NULL,
    iv VARCHAR(32) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    schema_version INT NOT NULL,
    size_bytes INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backups_user ON backups(user_id, created_at DESC);

-- Платежи
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    external_id VARCHAR(100) UNIQUE,
    amount INT NOT NULL,              -- Копейки
    currency VARCHAR(3) DEFAULT 'RUB',
    status VARCHAR(20) NOT NULL,      -- pending, completed, failed, refunded
    payment_method VARCHAR(20),
    plan_id VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);

-- Аудит лог
CREATE TABLE audit_log (
    id BIGSERIAL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    PRIMARY KEY (timestamp, id)
) PARTITION BY RANGE (timestamp);

-- Партиции по месяцам
CREATE TABLE audit_log_2025_01 PARTITION OF audit_log
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 3.6 Безопасность

#### 3.6.1 Rate Limiting
```typescript
// Конфигурация throttle
const rateLimits = {
  global: { ttl: 60, limit: 100 },      // 100 req/min
  auth: { ttl: 60, limit: 5 },           // 5 req/min
  backup: { ttl: 3600, limit: 10 },      // 10 req/hour
  payment: { ttl: 60, limit: 3 },        // 3 req/min
};
```

#### 3.6.2 Request Signing
```typescript
// Заголовки для подписи запросов
interface SignedRequestHeaders {
  'X-Timestamp': string;      // Unix timestamp
  'X-Nonce': string;          // Unique per request
  'X-Signature': string;      // HMAC-SHA256
}

// Алгоритм подписи
const signature = HMAC_SHA256(
  `${method}|${path}|${timestamp}|${nonce}|${bodyHash}`,
  secretKey
);
```

### 3.7 Критерии приёмки

| ID | Критерий | Метрика |
|----|----------|---------|
| AC-1.1 | API отвечает < 200ms (p95) | Latency |
| AC-1.2 | Uptime > 99.5% | Availability |
| AC-1.3 | Все endpoints задокументированы в Swagger | Coverage |
| AC-1.4 | Unit tests > 80% coverage | Test coverage |
| AC-1.5 | E2E tests для критичных flows | Test count |
| AC-1.6 | Логирование всех запросов | Audit |
| AC-1.7 | Rate limiting работает корректно | Security |

---

## 4. Модуль 2: Identity Service

### 4.1 Общее описание
Сервис аутентификации через телефон (SMS OTP) и социальные сети.

### 4.2 Функциональные требования

#### 4.2.1 Phone Auth (SMS OTP)
```typescript
// POST /api/v1/auth/phone/send
interface SendOTPRequest {
  phone: string;            // +79001234567
  deviceId: string;
}

interface SendOTPResponse {
  requestId: string;
  expiresIn: number;        // Секунды до истечения
  retryAfter: number;       // Секунды до повторной отправки
}

// POST /api/v1/auth/phone/verify
interface VerifyOTPRequest {
  requestId: string;
  code: string;             // 6 цифр
  deviceId: string;
}

interface VerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}
```

#### 4.2.2 Telegram Auth
```typescript
// POST /api/v1/auth/telegram
interface TelegramAuthRequest {
  initData: string;         // Telegram WebApp initData
}

// Валидация через HMAC-SHA256
const secretKey = HMAC_SHA256(botToken, 'WebAppData');
const checkHash = HMAC_SHA256(dataCheckString, secretKey);
```

#### 4.2.3 VK ID Auth
```typescript
// POST /api/v1/auth/vk
interface VKAuthRequest {
  silentToken: string;
  uuid: string;
}

// Exchange через VK API
// GET https://api.vk.com/method/auth.exchangeSilentAuthToken
```

### 4.3 SMS Gateway Integration

#### 4.3.1 Провайдеры (приоритет)
1. **SMS.ru** — основной (дёшево, РФ)
2. **Twilio** — резервный (международный)

#### 4.3.2 Реализация
```typescript
interface SMSProvider {
  send(phone: string, message: string): Promise<SMSResult>;
  checkBalance(): Promise<number>;
  getStatus(messageId: string): Promise<SMSStatus>;
}

class SMSService {
  private providers: SMSProvider[];

  async sendOTP(phone: string): Promise<string> {
    const code = generateSecureCode(6);
    const message = `MigrantHub: ваш код ${code}. Не сообщайте его никому.`;

    // Попробовать провайдеры по очереди
    for (const provider of this.providers) {
      try {
        await provider.send(phone, message);
        await this.cacheOTP(phone, code, TTL_5_MINUTES);
        return requestId;
      } catch (e) {
        continue; // Fallback to next
      }
    }
    throw new ServiceUnavailableException();
  }
}
```

### 4.4 Безопасность OTP

| Параметр | Значение |
|----------|----------|
| Длина кода | 6 цифр |
| TTL | 5 минут |
| Попыток ввода | 3 |
| Cooldown между отправками | 60 секунд |
| Блокировка после ошибок | 15 минут |
| Лимит SMS/день на номер | 5 |

### 4.5 JWT Configuration
```typescript
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '24h',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '30d',
  },
};

interface JWTPayload {
  sub: string;        // User ID
  did: string;        // Device ID
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}
```

### 4.6 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-2.1 | SMS доставляется < 10 секунд |
| AC-2.2 | OTP валидация работает корректно |
| AC-2.3 | Telegram auth интегрирован |
| AC-2.4 | VK ID auth интегрирован |
| AC-2.5 | Rate limiting на SMS |
| AC-2.6 | Fallback между SMS провайдерами |

---

## 5. Модуль 3: Document Processing

### 5.1 Общее описание
Обработка документов: OCR распознавание, валидация, локальное хранение.

### 5.2 Архитектура
```
┌─────────────────────────────────────────────────────┐
│                    КЛИЕНТ                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────┐ │
│  │ Camera  │ -> │  Crop   │ -> │ Local Storage   │ │
│  │ Capture │    │ + Prep  │    │ (encrypted)     │ │
│  └─────────┘    └─────────┘    └────────┬────────┘ │
│                                          │          │
│                                 ┌────────▼────────┐ │
│                                 │   OCR Engine    │ │
│                                 │ (Tesseract.js)  │ │
│                                 └────────┬────────┘ │
│                                          │          │
│                                 ┌────────▼────────┐ │
│                                 │  Data Extract   │ │
│                                 │  + Validation   │ │
│                                 └─────────────────┘ │
└─────────────────────────────────────────────────────┘
           │ (только метаданные)
           ▼
┌─────────────────────────────────────────────────────┐
│                    СЕРВЕР                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Metadata only: document_type, expires_at,   │   │
│  │ is_valid, reminder_sent                     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 5.3 OCR Implementation

#### 5.3.1 Client-side (Tesseract.js)
```typescript
// src/features/profile/services/ocr.service.ts

import Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  fields: ExtractedFields;
}

interface ExtractedFields {
  // Паспорт РФ
  surname?: string;
  name?: string;
  patronymic?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  passportNumber?: string;
  issueDate?: string;
  issuedBy?: string;

  // Миграционная карта
  entryDate?: string;
  entryPurpose?: string;
  stayUntil?: string;

  // Патент
  patentNumber?: string;
  patentRegion?: string;
  patentValidUntil?: string;
}

class OCRService {
  private worker: Tesseract.Worker;

  async initialize(): Promise<void> {
    this.worker = await Tesseract.createWorker('rus+eng');
  }

  async recognizePassport(imageData: Blob): Promise<OCRResult> {
    // Предобработка изображения
    const processed = await this.preprocessImage(imageData);

    // OCR
    const { data } = await this.worker.recognize(processed);

    // Извлечение полей через regex
    const fields = this.extractPassportFields(data.text);

    return {
      text: data.text,
      confidence: data.confidence,
      fields,
    };
  }

  private extractPassportFields(text: string): ExtractedFields {
    const patterns = {
      surname: /Фамилия[:\s]+([А-ЯЁ]+)/i,
      name: /Имя[:\s]+([А-ЯЁ]+)/i,
      birthDate: /(\d{2}\.\d{2}\.\d{4})/,
      passportNumber: /(\d{2}\s?\d{2}\s?\d{6})/,
    };

    const fields: ExtractedFields = {};
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) fields[key] = match[1];
    }

    return fields;
  }

  private async preprocessImage(blob: Blob): Promise<ImageData> {
    // 1. Конвертация в grayscale
    // 2. Увеличение контраста
    // 3. Бинаризация (Otsu's method)
    // 4. Удаление шума
    // 5. Deskew (выравнивание)
    return processedImageData;
  }
}
```

#### 5.3.2 Server-side OCR (fallback)
Для сложных случаев — отправка на сервер без ПДн:
```typescript
// POST /api/v1/ocr/process
// Отправляется ТОЛЬКО обрезанная область с текстом, без фото лица

interface OCRRequest {
  image: string;           // Base64, только текстовая область
  documentType: 'passport' | 'migration_card' | 'patent';
  expectedFields: string[];
}

interface OCRResponse {
  fields: Record<string, string>;
  confidence: number;
}
```

### 5.4 Document Types

| Тип | Код | Поля |
|-----|-----|------|
| Паспорт | `passport` | ФИО, дата рождения, номер, дата выдачи |
| Миграционная карта | `migration_card` | Дата въезда, цель, срок пребывания |
| Патент | `patent` | Номер, регион, срок действия |
| Регистрация | `registration` | Адрес, срок действия |
| ИНН | `inn` | Номер ИНН |
| СНИЛС | `snils` | Номер СНИЛС |
| Медосмотр | `medical` | Дата, срок действия |
| Сертификат экзамена | `exam_cert` | Номер, дата, срок |

### 5.5 Local Storage Schema (Dexie.js)
```typescript
// src/lib/db/schema.ts

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  data: EncryptedData;        // Зашифрованные поля
  images: EncryptedBlob[];    // Зашифрованные изображения
  extractedFields: Record<string, string>;
  expiresAt?: Date;
  reminderDays: number[];     // [30, 14, 7, 3, 1]
  createdAt: Date;
  updatedAt: Date;
}

// Middleware для автоматического шифрования
db.documents.hook('creating', async (primKey, obj) => {
  obj.data = await encryptData(obj.data);
  obj.images = await Promise.all(
    obj.images.map(img => encryptBlob(img))
  );
});
```

### 5.6 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-3.1 | OCR распознаёт паспорт РФ с точностью > 90% |
| AC-3.2 | OCR распознаёт миграционную карту |
| AC-3.3 | OCR работает offline (Tesseract.js) |
| AC-3.4 | Все документы шифруются перед сохранением |
| AC-3.5 | Напоминания о сроках работают |
| AC-3.6 | Экспорт документов в PDF |

---

## 6. Модуль 4: AI Assistant

### 6.1 Общее описание
Юридический AI-ассистент для ответов на вопросы мигрантов.

### 6.2 Архитектура
```
┌──────────────────────────────────────────────────────────────┐
│                         КЛИЕНТ                               │
│  ┌────────────┐     ┌─────────────┐     ┌───────────────┐   │
│  │ User Input │ --> │ PII Filter  │ --> │ API Request   │   │
│  │            │     │ (Level 1)   │     │               │   │
│  └────────────┘     └─────────────┘     └───────┬───────┘   │
└─────────────────────────────────────────────────┼────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│  ┌─────────────┐     ┌─────────────┐     ┌───────────────┐  │
│  │ Rate Limit  │ --> │ PII Filter  │ --> │ AI Proxy      │  │
│  │             │     │ (Level 2)   │     │               │  │
│  └─────────────┘     └─────────────┘     └───────┬───────┘  │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                       AI PROXY                               │
│  ┌─────────────┐     ┌─────────────┐     ┌───────────────┐  │
│  │ PII Filter  │ --> │ RAG Context │ --> │ LLM Request   │  │
│  │ (Level 3)   │     │ (pgvector)  │     │               │  │
│  └─────────────┘     └─────────────┘     └───────┬───────┘  │
│                                                   │          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    KILL SWITCH                          ││
│  │  - Manual trigger                                       ││
│  │  - Auto trigger on anomaly                              ││
│  │  - Instant disconnect from LLM                          ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                    LLM PROVIDER                              │
│  Primary:   OpenAI GPT-4 Turbo                              │
│  Fallback:  GigaChat / YandexGPT                            │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 PII Filter Implementation

#### 6.3.1 Уровень 1 (Клиент)
```typescript
// src/lib/ai/pii-filter.ts

const PII_PATTERNS = {
  phone: /(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
  passport: /\d{2}\s?\d{2}\s?\d{6}/g,
  snils: /\d{3}-\d{3}-\d{3}\s?\d{2}/g,
  inn: /\d{10,12}/g,
  email: /[\w.-]+@[\w.-]+\.\w+/g,
  address: /(?:ул\.|улица|пр\.|проспект|д\.|дом)\s*[\w\s\d,-]+/gi,
  name: /(?:меня зовут|я\s+)([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)*)/gi,
};

function filterPII(text: string): { filtered: string; found: PIIMatch[] } {
  const found: PIIMatch[] = [];
  let filtered = text;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      found.push({ type, value: match[0], index: match.index });
      filtered = filtered.replace(match[0], `[${type.toUpperCase()}]`);
    }
  }

  return { filtered, found };
}
```

#### 6.3.2 Уровень 2 (API Gateway)
```typescript
// NestJS Interceptor
@Injectable()
class PIIFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    if (request.body?.message) {
      const { filtered, found } = this.piiFilter.filter(request.body.message);

      if (found.length > 0) {
        this.logger.warn('PII detected', {
          userId: request.user.id,
          types: found.map(f => f.type),
        });
      }

      request.body.message = filtered;
    }

    return next.handle();
  }
}
```

#### 6.3.3 Уровень 3 (AI Proxy)
```typescript
// Финальная проверка перед отправкой в LLM
class AIProxyService {
  async processRequest(message: string, context: ChatContext) {
    // Третий уровень фильтрации
    const { filtered, found } = this.deepPIIFilter.analyze(message);

    if (found.length > 0) {
      // Логирование без самих данных
      await this.auditLog.record({
        type: 'pii_blocked',
        count: found.length,
        categories: [...new Set(found.map(f => f.type))],
      });
    }

    // RAG context
    const relevantDocs = await this.vectorSearch(filtered);

    // System prompt
    const systemPrompt = this.buildSystemPrompt(relevantDocs);

    // LLM request
    return this.llm.chat({
      system: systemPrompt,
      messages: context.messages,
    });
  }
}
```

### 6.4 RAG (Retrieval Augmented Generation)

#### 6.4.1 Vector Store (pgvector)
```sql
-- Расширение
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица документов
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100),          -- 115-ФЗ, КоАП, etc.
    chunk_index INT,
    embedding vector(1536),        -- OpenAI ada-002
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_docs_embedding
ON legal_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### 6.4.2 Embedding Pipeline
```typescript
class EmbeddingService {
  async indexDocument(doc: LegalDocument): Promise<void> {
    // Разбиение на chunks
    const chunks = this.splitIntoChunks(doc.content, 1000, 200);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunks[i],
      });

      await this.db.legalDocuments.insert({
        title: doc.title,
        content: chunks[i],
        source: doc.source,
        chunkIndex: i,
        embedding: embedding.data[0].embedding,
      });
    }
  }

  async search(query: string, limit = 5): Promise<LegalDocument[]> {
    const queryEmbedding = await this.embed(query);

    return this.db.$queryRaw`
      SELECT id, title, content, source,
             1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM legal_documents
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;
  }
}
```

### 6.5 Kill Switch

```typescript
// apps/api-ai/src/kill-switch.service.ts

interface KillSwitchState {
  active: boolean;
  reason?: string;
  activatedAt?: Date;
  activatedBy?: string;
}

@Injectable()
class KillSwitchService {
  private state: KillSwitchState = { active: false };

  // Ручное включение
  async activate(reason: string, userId: string): Promise<void> {
    this.state = {
      active: true,
      reason,
      activatedAt: new Date(),
      activatedBy: userId,
    };

    // Немедленное уведомление
    await this.alerting.critical('AI Kill Switch Activated', { reason });

    // Логирование
    await this.auditLog.record({
      action: 'kill_switch_activated',
      reason,
      userId,
    });
  }

  // Автоматическое срабатывание
  async checkAnomaly(metrics: AIMetrics): Promise<void> {
    const triggers = [
      metrics.piiLeakRate > 0.01,           // >1% PII в ответах
      metrics.errorRate > 0.1,               // >10% ошибок
      metrics.avgLatency > 30000,            // >30s latency
      metrics.costPerHour > 100,             // >$100/час
    ];

    if (triggers.some(t => t)) {
      await this.activate('Automatic: anomaly detected', 'system');
    }
  }

  isActive(): boolean {
    return this.state.active;
  }
}
```

### 6.6 API Endpoints

```typescript
// POST /api/v1/ai/chat
interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    citizenship?: string;
    region?: string;
    documentTypes?: string[];
  };
}

interface ChatResponse {
  message: string;
  conversationId: string;
  sources?: {
    title: string;
    source: string;
  }[];
  suggestedActions?: {
    type: string;
    label: string;
    action: string;
  }[];
}

// GET /api/v1/ai/suggestions
// Готовые вопросы для быстрого старта
interface SuggestionsResponse {
  suggestions: {
    category: string;
    questions: string[];
  }[];
}
```

### 6.7 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-4.1 | 3-уровневый PII фильтр работает |
| AC-4.2 | RAG возвращает релевантные документы |
| AC-4.3 | Kill Switch срабатывает < 1 секунды |
| AC-4.4 | Ответы содержат ссылки на источники |
| AC-4.5 | Fallback на резервный LLM работает |
| AC-4.6 | Rate limiting на AI запросы |

---

## 7. Модуль 5: Payments

### 7.1 Общее описание
Интеграция платежей через СБП и ЮKassa.

### 7.2 Платёжные провайдеры

| Провайдер | Назначение | Комиссия |
|-----------|------------|----------|
| **СБП (НСПК)** | Основной, РФ банки | 0.4-0.7% |
| **ЮKassa** | Карты, кошельки | 2.8-3.5% |

### 7.3 Тарифные планы

```typescript
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    features: [
      'Хранение 3 документов',
      'Калькулятор сроков',
      'Базовые уведомления',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Плюс',
    price: 9900,  // 99₽ в копейках
    period: 'month',
    features: [
      'Безлимит документов',
      'AI ассистент (50 запросов/мес)',
      'Приоритетные уведомления',
      'Cloud Safe (5 ГБ)',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Про',
    price: 29900,  // 299₽
    period: 'month',
    features: [
      'Всё из Плюс',
      'AI без лимитов',
      'Приоритетная поддержка',
      'Юридические консультации',
      'Cloud Safe (50 ГБ)',
    ],
  },
};
```

### 7.4 СБП Integration

```typescript
// apps/api-core/src/modules/billing/sbp.service.ts

interface SBPPaymentRequest {
  amount: number;           // Копейки
  orderId: string;
  description: string;
  returnUrl: string;
}

interface SBPPaymentResponse {
  paymentId: string;
  qrCode: string;           // Base64 QR image
  qrUrl: string;            // Deeplink
  expiresAt: Date;
}

@Injectable()
class SBPService {
  async createPayment(request: SBPPaymentRequest): Promise<SBPPaymentResponse> {
    // Создание заказа в банке-эквайере
    const response = await this.acquirerApi.createOrder({
      merchantId: this.config.merchantId,
      amount: request.amount,
      currency: 'RUB',
      orderId: request.orderId,
      description: request.description,
      sbpDetails: {
        qrType: 'dynamic',
        qrTtl: 900,  // 15 минут
      },
    });

    return {
      paymentId: response.paymentId,
      qrCode: response.qrCode,
      qrUrl: response.qrUrl,
      expiresAt: new Date(Date.now() + 900000),
    };
  }

  async handleWebhook(payload: SBPWebhookPayload): Promise<void> {
    // Верификация подписи
    if (!this.verifySignature(payload)) {
      throw new UnauthorizedException('Invalid signature');
    }

    const payment = await this.paymentsRepo.findByExternalId(payload.paymentId);

    if (payload.status === 'COMPLETED') {
      await this.activateSubscription(payment.userId, payment.planId);
      await this.paymentsRepo.updateStatus(payment.id, 'completed');
    }
  }
}
```

### 7.5 ЮKassa Integration

```typescript
// apps/api-core/src/modules/billing/yookassa.service.ts

import { YooKassa } from '@yookassa/sdk';

@Injectable()
class YooKassaService {
  private yookassa: YooKassa;

  constructor() {
    this.yookassa = new YooKassa({
      shopId: process.env.YOOKASSA_SHOP_ID,
      secretKey: process.env.YOOKASSA_SECRET_KEY,
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const payment = await this.yookassa.createPayment({
      amount: {
        value: (request.amount / 100).toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: request.returnUrl,
      },
      capture: true,
      description: request.description,
      metadata: {
        orderId: request.orderId,
        userId: request.userId,
        planId: request.planId,
      },
    });

    return {
      paymentId: payment.id,
      paymentUrl: payment.confirmation.confirmation_url,
      status: 'pending',
    };
  }
}
```

### 7.6 Webhook Security

```typescript
// Верификация webhook от ЮKassa
function verifyYooKassaWebhook(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.YOOKASSA_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 7.7 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-5.1 | СБП оплата работает (QR + deeplink) |
| AC-5.2 | ЮKassa оплата работает |
| AC-5.3 | Webhook обработка корректна |
| AC-5.4 | Подписка активируется после оплаты |
| AC-5.5 | Автопродление работает |
| AC-5.6 | Возврат средств возможен |

---

## 8. Модуль 6: Notifications

### 8.1 Общее описание
Многоканальная система уведомлений: Push, Telegram, Email.

### 8.2 Каналы

| Канал | Приоритет | Use Case |
|-------|-----------|----------|
| **Push (FCM/APNs)** | Высокий | Срочные уведомления |
| **Telegram Bot** | Средний | Напоминания, новости |
| **Email** | Низкий | Отчёты, документы |

### 8.3 Notification Types

```typescript
enum NotificationType {
  // Документы
  DOCUMENT_EXPIRING = 'document_expiring',
  DOCUMENT_EXPIRED = 'document_expired',

  // Патент
  PATENT_PAYMENT_DUE = 'patent_payment_due',
  PATENT_PAYMENT_OVERDUE = 'patent_payment_overdue',

  // Регистрация
  REGISTRATION_EXPIRING = 'registration_expiring',
  REGISTRATION_EXPIRED = 'registration_expired',

  // Миграционный учёт
  STAY_LIMIT_WARNING = 'stay_limit_warning',
  STAY_LIMIT_CRITICAL = 'stay_limit_critical',

  // Законы
  LAW_UPDATE = 'law_update',

  // Система
  BACKUP_REMINDER = 'backup_reminder',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
}
```

### 8.4 Smart Timing

```typescript
// Оптимальное время отправки
interface NotificationScheduler {
  // Учёт часового пояса пользователя
  getOptimalTime(userId: string, type: NotificationType): Date;

  // Не отправлять ночью (22:00 - 08:00 по локальному времени)
  isQuietHours(userId: string): boolean;

  // Escalation для критичных
  getEscalationSchedule(type: NotificationType): EscalationStep[];
}

const ESCALATION_SCHEDULES = {
  [NotificationType.PATENT_PAYMENT_DUE]: [
    { daysBefore: 30, channel: 'push', priority: 'normal' },
    { daysBefore: 14, channel: 'push', priority: 'normal' },
    { daysBefore: 7, channel: 'push', priority: 'high' },
    { daysBefore: 3, channel: 'push', priority: 'high', repeat: true },
    { daysBefore: 1, channel: 'push', priority: 'critical', repeat: true },
  ],
};
```

### 8.5 FCM Integration

```typescript
// apps/api-core/src/modules/notifications/fcm.service.ts

import * as admin from 'firebase-admin';

@Injectable()
class FCMService {
  async send(notification: PushNotification): Promise<void> {
    const message: admin.messaging.Message = {
      token: notification.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: notification.priority === 'critical' ? 'high' : 'normal',
        notification: {
          channelId: this.getChannelId(notification.type),
          sound: notification.priority === 'critical' ? 'alarm' : 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: notification.priority === 'critical' ? 'alarm.caf' : 'default',
            badge: notification.badge,
          },
        },
      },
    };

    await admin.messaging().send(message);
  }
}
```

### 8.6 Telegram Bot

```typescript
// apps/api-notify/src/telegram-bot.service.ts

import { Telegraf } from 'telegraf';

@Injectable()
class TelegramBotService {
  private bot: Telegraf;

  async sendNotification(chatId: string, notification: TelegramNotification) {
    const message = this.formatMessage(notification);

    await this.bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: notification.buttons ? {
        inline_keyboard: notification.buttons.map(btn => [{
          text: btn.text,
          url: btn.url,
        }]),
      } : undefined,
    });
  }

  private formatMessage(n: TelegramNotification): string {
    const icons = {
      warning: '⚠️',
      critical: '🚨',
      info: 'ℹ️',
      success: '✅',
    };

    return `${icons[n.severity]} <b>${n.title}</b>\n\n${n.body}`;
  }
}
```

### 8.7 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-6.1 | Push уведомления доставляются (FCM) |
| AC-6.2 | Telegram бот работает |
| AC-6.3 | Smart timing учитывает часовой пояс |
| AC-6.4 | Escalation для критичных работает |
| AC-6.5 | Snooze уведомлений работает |
| AC-6.6 | Настройки уведомлений сохраняются |

---

## 9. Frontend интеграция

### 9.1 API Client

```typescript
// src/lib/api/client.ts

import { createRequestSigner } from './signing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class APIClient {
  private accessToken: string | null = null;
  private signer = createRequestSigner();

  async request<T>(
    method: string,
    path: string,
    data?: unknown
  ): Promise<T> {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const body = data ? JSON.stringify(data) : '';

    const signature = await this.signer.sign({
      method,
      path,
      timestamp,
      nonce,
      body,
    });

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : '',
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body: body || undefined,
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return response.json();
  }

  // Typed methods
  auth = {
    device: (data: DeviceAuthRequest) =>
      this.request<DeviceAuthResponse>('POST', '/api/v1/auth/device', data),
    refresh: (data: RefreshRequest) =>
      this.request<RefreshResponse>('POST', '/api/v1/auth/refresh', data),
  };

  users = {
    me: () => this.request<UserProfile>('GET', '/api/v1/users/me'),
    update: (data: UpdateUserRequest) =>
      this.request<UserProfile>('PATCH', '/api/v1/users/me', data),
  };

  ai = {
    chat: (data: ChatRequest) =>
      this.request<ChatResponse>('POST', '/api/v1/ai/chat', data),
  };

  backup = {
    upload: (data: BackupUploadRequest) =>
      this.request<BackupUploadResponse>('POST', '/api/v1/backup', data),
    download: () =>
      this.request<BackupDownloadResponse>('GET', '/api/v1/backup/latest'),
  };
}

export const api = new APIClient();
```

### 9.2 React Query Hooks

```typescript
// src/lib/hooks/useUser.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.users.me(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.users.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// src/lib/hooks/useAI.ts

export function useAIChat() {
  return useMutation({
    mutationFn: api.ai.chat,
  });
}
```

### 9.3 Offline Sync

```typescript
// src/lib/sync/sync-manager.ts

class SyncManager {
  private db: Dexie;
  private api: APIClient;

  async sync(): Promise<SyncResult> {
    if (!navigator.onLine) {
      return { status: 'offline' };
    }

    const pendingActions = await this.db.syncQueue.toArray();
    const results: SyncItemResult[] = [];

    for (const action of pendingActions) {
      try {
        await this.executeAction(action);
        await this.db.syncQueue.delete(action.id);
        results.push({ id: action.id, status: 'success' });
      } catch (error) {
        results.push({ id: action.id, status: 'failed', error });
      }
    }

    return { status: 'complete', results };
  }

  async queueAction(action: SyncAction): Promise<void> {
    await this.db.syncQueue.add({
      ...action,
      createdAt: new Date(),
      retries: 0,
    });

    // Попробовать выполнить сразу если онлайн
    if (navigator.onLine) {
      this.sync();
    }
  }
}
```

### 9.4 Критерии приёмки

| ID | Критерий |
|----|----------|
| AC-7.1 | API client с подписью запросов |
| AC-7.2 | React Query hooks для всех endpoints |
| AC-7.3 | Offline queue работает |
| AC-7.4 | Auto-sync при восстановлении сети |
| AC-7.5 | Error handling с retry |
| AC-7.6 | Loading states во всех компонентах |

---

## 10. Тестирование

### 10.1 Стратегия тестирования

| Уровень | Инструмент | Coverage Target |
|---------|------------|-----------------|
| Unit | Vitest | > 80% |
| Integration | Vitest + Supertest | > 70% |
| E2E | Playwright | Critical paths |
| Load | k6 | 1000 RPS |

### 10.2 Unit Tests

```typescript
// Example: PII Filter test
describe('PIIFilter', () => {
  it('should mask phone numbers', () => {
    const input = 'Мой номер +79001234567';
    const { filtered } = filterPII(input);
    expect(filtered).toBe('Мой номер [PHONE]');
  });

  it('should mask passport numbers', () => {
    const input = 'Паспорт 45 06 123456';
    const { filtered } = filterPII(input);
    expect(filtered).toBe('Паспорт [PASSPORT]');
  });

  it('should mask multiple PII types', () => {
    const input = 'Иванов Иван, +79001234567, паспорт 4506 123456';
    const { filtered, found } = filterPII(input);
    expect(found).toHaveLength(3);
  });
});
```

### 10.3 E2E Tests

```typescript
// tests/e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should complete phone auth flow', async ({ page }) => {
    await page.goto('/auth/phone');

    await page.fill('[data-testid="phone-input"]', '+79001234567');
    await page.click('[data-testid="send-otp-button"]');

    await expect(page).toHaveURL('/auth/otp');

    // В тестовом окружении OTP = 123456
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-button"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

### 10.4 Load Tests

```javascript
// tests/load/api.js (k6)

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://api.migranthub.local/api/v1/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

---

## 11. Развёртывание

### 11.1 Инфраструктура

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────────────────┐ │
│  │   WAF   │  │   CDN   │  │       DDoS Protection       │ │
│  └────┬────┘  └────┬────┘  └─────────────┬───────────────┘ │
└───────┼────────────┼────────────────────┼───────────────────┘
        │            │                    │
        ▼            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     SELECTEL VPC                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   LOAD BALANCER                         ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                 │
│    ┌──────────────────────┼──────────────────────┐         │
│    │                      │                      │         │
│    ▼                      ▼                      ▼         │
│ ┌──────┐              ┌──────┐              ┌──────┐       │
│ │ API  │              │ API  │              │ API  │       │
│ │ Core │              │  AI  │              │Notify│       │
│ └──┬───┘              └──┬───┘              └──┬───┘       │
│    │                     │                     │           │
│    └─────────────────────┼─────────────────────┘           │
│                          │                                  │
│    ┌─────────────────────┼─────────────────────┐           │
│    │                     │                     │           │
│    ▼                     ▼                     ▼           │
│ ┌──────┐              ┌──────┐              ┌──────┐       │
│ │Postgr│              │Redis │              │Rabbit│       │
│ │ SQL  │              │      │              │  MQ  │       │
│ └──────┘              └──────┘              └──────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  api-core:
    build: ./apps/api-core
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/migranthub
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  api-ai:
    build: ./apps/api-ai
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgres://user:pass@postgres:5432/migranthub
    depends_on:
      - postgres
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  api-notify:
    build: ./apps/api-notify
    environment:
      - FCM_CREDENTIALS=${FCM_CREDENTIALS}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
    deploy:
      replicas: 1

  legal-core:
    build: ./apps/legal-core
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/migranthub
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - rabbitmq

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=migranthub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### 11.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: |
          docker build -t migranthub/api-core ./apps/api-core
          docker build -t migranthub/api-ai ./apps/api-ai
          docker build -t migranthub/api-notify ./apps/api-notify
      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin
          docker push migranthub/api-core
          docker push migranthub/api-ai
          docker push migranthub/api-notify

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Selectel
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/migranthub
            docker compose pull
            docker compose up -d --remove-orphans
```

---

## 12. Roadmap

### Phase 1: MVP (4 недели)

| Неделя | Задачи |
|--------|--------|
| 1 | Backend Core API + Identity Service |
| 2 | Document Processing (OCR) + Cloud Safe |
| 3 | Payments (СБП + ЮKassa) |
| 4 | Notifications + Frontend интеграция |

### Phase 2: AI + Polish (2 недели)

| Неделя | Задачи |
|--------|--------|
| 5 | AI Assistant + RAG |
| 6 | Testing + Bug fixes + Launch prep |

### Phase 3: Expansion (ongoing)

- B2B платформа
- Дополнительные сервисы
- Партнёрства

---

## 13. Приложения

### A. Глоссарий

| Термин | Определение |
|--------|-------------|
| ПДн | Персональные данные |
| 152-ФЗ | Федеральный закон о персональных данных |
| СБП | Система быстрых платежей |
| E2E | End-to-end (сквозное шифрование) |
| RAG | Retrieval Augmented Generation |
| PII | Personally Identifiable Information |

### B. Ссылки на документацию

- [Архитектура](./architecture/00-ARCHITECTURE-OVERVIEW.md)
- [Инфраструктура](./architecture/01-INFRASTRUCTURE.md)
- [База данных](./architecture/02-DATABASE.md)
- [API](./architecture/03-API.md)
- [Frontend](./architecture/04-FRONTEND.md)
- [Безопасность](./architecture/05-SECURITY.md)
- [Бизнес-логика](./architecture/06-BUSINESS-LOGIC.md)

### C. Контакты

| Роль | Ответственность |
|------|-----------------|
| Product Owner | Требования, приоритизация |
| Tech Lead | Архитектура, код-ревью |
| Backend Dev | API, база данных |
| Frontend Dev | UI, мобильное приложение |
| DevOps | Инфраструктура, CI/CD |

---

**Версия документа:** 1.0
**Дата создания:** 2025-01-25
**Последнее обновление:** 2025-01-25
