# Блок 2: База данных

> Спецификация схемы базы данных MigrantHub

---

## Содержание

1. [Обзор архитектуры данных](#1-обзор-архитектуры-данных)
2. [Серверная БД (PostgreSQL)](#2-серверная-бд-postgresql)
3. [Локальная БД (IndexedDB)](#3-локальная-бд-indexeddb)
4. [Миграции](#4-миграции)
5. [Индексы и оптимизация](#5-индексы-и-оптимизация)
6. [Партиционирование](#6-партиционирование)

---

## 1. Обзор архитектуры данных

### 1.1 Принцип разделения данных

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────┐   │
│  │       DEVICE (IndexedDB)          │  │      SERVER (PostgreSQL)      │   │
│  │                                   │  │                               │   │
│  │  ПЕРСОНАЛЬНЫЕ ДАННЫЕ (PII)        │  │  АНОНИМНЫЕ МЕТАДАННЫЕ         │   │
│  │  ─────────────────────────        │  │  ─────────────────────        │   │
│  │                                   │  │                               │   │
│  │  ✓ ФИО                            │  │  ✓ device_id (UUID)           │   │
│  │  ✓ Паспортные данные              │  │  ✓ citizenship_code (UZ/TJ)   │   │
│  │  ✓ Дата рождения                  │  │  ✓ region_code (77/78)        │   │
│  │  ✓ Адрес                          │  │  ✓ entry_date                 │   │
│  │  ✓ Телефон                        │  │  ✓ purpose (work/study)       │   │
│  │  ✓ Сканы документов               │  │  ✓ is_eaeu (boolean)          │   │
│  │  ✓ Номера документов              │  │  ✓ subscription_type          │   │
│  │                                   │  │  ✓ telegram_id_hash (SHA256)  │   │
│  │  Зашифровано AES-256-GCM          │  │                               │   │
│  │  Ключ в Keychain/Keystore         │  │  ❌ НЕТ ПЕРСОНАЛЬНЫХ ДАННЫХ   │   │
│  │                                   │  │                               │   │
│  └───────────────────────────────────┘  └───────────────────────────────┘   │
│                                                                              │
│  CLOUD SAFE (S3)                                                             │
│  ──────────────                                                              │
│  E2E зашифрованные бэкапы                                                    │
│  Ключ шифрования только у пользователя                                       │
│  Сервер НЕ МОЖЕТ расшифровать                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Ключевые таблицы

| Группа | Таблицы | Назначение |
|--------|---------|------------|
| Users | users, devices, recovery_codes | Пользователи и устройства |
| Payments | subscriptions, payments, payment_events, promo_codes | Биллинг |
| Notifications | devices_push, messenger_connections, notifications, notification_settings | Уведомления |
| Legal | laws, law_versions, regions, form_templates, knowledge_chunks, faq | Справочник |
| Audit | audit_log, ai_request_log, security_events | Логирование |
| Backup | backups, backup_versions | Cloud Safe |

---

## 2. Серверная БД (PostgreSQL)

### 2.1 Схема: Users

```sql
-- ===================
-- EXTENSIONS
-- ===================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- для RAG

-- ===================
-- USERS (анонимные)
-- ===================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Анонимные метаданные (НЕ PII)
    citizenship_code VARCHAR(3) NOT NULL,        -- 'UZ', 'TJ', 'KG', 'KZ'
    region_code VARCHAR(10),                      -- '77' (Москва), '78' (СПб)
    entry_date DATE,                              -- Дата въезда
    purpose VARCHAR(20),                          -- 'work', 'study', 'family', 'tourism'
    is_eaeu BOOLEAN DEFAULT FALSE,               -- Гражданин ЕАЭС

    -- Связь с мессенджерами (ТОЛЬКО хеши)
    telegram_id_hash VARCHAR(64) UNIQUE,         -- SHA256(telegram_id)
    vk_id_hash VARCHAR(64) UNIQUE,               -- SHA256(vk_id)

    -- Онбординг и настройки
    onboarding_completed BOOLEAN DEFAULT FALSE,
    language VARCHAR(5) DEFAULT 'ru',            -- 'ru', 'uz', 'tg', 'ky', 'en'
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',

    -- Чеклист (что ещё нужно сделать)
    checklist JSONB DEFAULT '[]',
    /*
    Пример checklist:
    [
      {"id": "registration", "completed": false, "deadline": "2024-01-20"},
      {"id": "patent_payment", "completed": true, "completedAt": "2024-01-10"},
      {"id": "medical_exam", "completed": false}
    ]
    */

    -- Подписка
    subscription_type VARCHAR(20) DEFAULT 'free', -- 'free', 'plus', 'pro'
    subscription_until TIMESTAMPTZ,
    subscription_started_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT FALSE,

    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ                        -- Soft delete

);

-- Индексы
CREATE INDEX idx_users_citizenship ON users(citizenship_code);
CREATE INDEX idx_users_region ON users(region_code);
CREATE INDEX idx_users_subscription ON users(subscription_type, subscription_until);
CREATE INDEX idx_users_telegram_hash ON users(telegram_id_hash) WHERE telegram_id_hash IS NOT NULL;
CREATE INDEX idx_users_active ON users(last_active_at) WHERE deleted_at IS NULL;

-- ===================
-- DEVICES
-- ===================
CREATE TABLE devices (
    id UUID PRIMARY KEY,                          -- Генерируется на клиенте
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Информация об устройстве
    platform VARCHAR(10) NOT NULL,               -- 'ios', 'android', 'web'
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    device_model VARCHAR(100),
    locale VARCHAR(10),

    -- API ключи (для подписи запросов)
    api_key_hash VARCHAR(64) NOT NULL,           -- SHA256(api_key)
    api_key_created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Статус
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),

    -- Метаданные
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_active ON devices(is_active, last_seen_at);

-- ===================
-- RECOVERY CODES
-- ===================
CREATE TABLE recovery_codes (
    code_hash VARCHAR(64) PRIMARY KEY,            -- SHA256(recovery_code)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,                          -- NULL если не использован
    expires_at TIMESTAMPTZ,                       -- Опционально

    CONSTRAINT recovery_code_unused CHECK (used_at IS NULL OR used_at > created_at)
);

CREATE INDEX idx_recovery_codes_user ON recovery_codes(user_id);
```

### 2.2 Схема: Payments

```sql
-- ===================
-- SUBSCRIPTION PLANS
-- ===================
CREATE TABLE subscription_plans (
    id VARCHAR(20) PRIMARY KEY,                   -- 'free', 'plus', 'pro'
    name_ru VARCHAR(100) NOT NULL,
    name_uz VARCHAR(100),
    name_tg VARCHAR(100),

    price_monthly INTEGER NOT NULL,               -- в копейках
    price_yearly INTEGER NOT NULL,

    features JSONB NOT NULL,
    /*
    {
      "documents": "unlimited",
      "ai_questions": 30,
      "backup": true,
      "backup_size_mb": 500,
      "backup_versions": 5,
      "smart_reminders": true,
      "legal_updates": true,
      "priority_support": false,
      "family_members": 0
    }
    */

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- SUBSCRIPTIONS
-- ===================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(20) NOT NULL REFERENCES subscription_plans(id),

    status VARCHAR(20) NOT NULL,                  -- 'active', 'canceled', 'expired', 'past_due'
    period VARCHAR(10) NOT NULL,                  -- 'monthly', 'yearly'

    started_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    canceled_at TIMESTAMPTZ,

    -- Автопродление
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id VARCHAR(100),               -- ID способа оплаты в ЮKassa

    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, expires_at);

-- ===================
-- PAYMENTS
-- ===================
CREATE TABLE payments (
    id UUID PRIMARY KEY,                          -- ID от ЮKassa
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),

    amount INTEGER NOT NULL,                      -- в копейках
    currency VARCHAR(3) DEFAULT 'RUB',

    status VARCHAR(20) NOT NULL,                  -- 'pending', 'succeeded', 'canceled', 'refunded'
    payment_method VARCHAR(20),                   -- 'sbp', 'card', 'yookassa'

    -- Детали
    description TEXT,
    metadata JSONB,
    /*
    {
      "plan_id": "plus",
      "period": "monthly",
      "promo_code": "WELCOME50"
    }
    */

    -- Чек
    receipt_url TEXT,

    -- Временные метки
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status, created_at);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);

-- ===================
-- PAYMENT EVENTS (для отладки и аудита)
-- ===================
CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id),

    event_type VARCHAR(50) NOT NULL,              -- 'created', 'pending', 'succeeded', 'canceled', 'refunded'
    event_data JSONB,
    source VARCHAR(20),                           -- 'webhook', 'api', 'manual'

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);

-- ===================
-- PROMO CODES
-- ===================
CREATE TABLE promo_codes (
    code VARCHAR(50) PRIMARY KEY,
    discount_percent INTEGER,                     -- 10, 20, 50
    discount_amount INTEGER,                      -- фиксированная скидка в копейках

    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,

    applicable_plans VARCHAR(20)[],               -- ['plus', 'pro'] или NULL для всех
    applicable_periods VARCHAR(10)[],             -- ['monthly', 'yearly'] или NULL для всех

    -- Партнёрский код
    partner_id VARCHAR(50),                       -- для revenue share

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, valid_until);
```

### 2.3 Схема: Notifications

```sql
-- ===================
-- PUSH DEVICES
-- ===================
CREATE TABLE devices_push (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,

    push_token TEXT NOT NULL,
    push_provider VARCHAR(20) NOT NULL,           -- 'fcm', 'apns', 'rustore'

    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_devices_push_token ON devices_push(push_token);
CREATE INDEX idx_devices_push_device ON devices_push(device_id);

-- ===================
-- MESSENGER CONNECTIONS
-- ===================
CREATE TABLE messenger_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    messenger VARCHAR(20) NOT NULL,               -- 'telegram', 'vk'
    messenger_user_id_hash VARCHAR(64) NOT NULL,  -- SHA256(messenger_id)
    chat_id VARCHAR(100),                         -- Для отправки сообщений

    -- Настройки
    notifications_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME,                       -- 22:00
    quiet_hours_end TIME,                         -- 08:00

    connected_at TIMESTAMPTZ DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_messenger_connections_unique
    ON messenger_connections(messenger, messenger_user_id_hash)
    WHERE disconnected_at IS NULL;
CREATE INDEX idx_messenger_connections_user ON messenger_connections(user_id);

-- ===================
-- NOTIFICATION SETTINGS
-- ===================
CREATE TABLE notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Глобальные настройки
    enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- Настройки по типам
    deadline_reminders BOOLEAN DEFAULT TRUE,
    deadline_reminder_days INTEGER[] DEFAULT '{30, 14, 7, 3, 1}',

    legal_updates BOOLEAN DEFAULT TRUE,
    legal_updates_critical_only BOOLEAN DEFAULT FALSE,

    payment_reminders BOOLEAN DEFAULT TRUE,
    marketing BOOLEAN DEFAULT FALSE,

    -- Каналы
    channels_push BOOLEAN DEFAULT TRUE,
    channels_telegram BOOLEAN DEFAULT TRUE,
    channels_vk BOOLEAN DEFAULT TRUE,
    channels_email BOOLEAN DEFAULT FALSE,
    channels_sms BOOLEAN DEFAULT FALSE,           -- Только критичные

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- NOTIFICATIONS (история)
-- ===================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL,                    -- 'deadline', 'legal_update', 'payment', 'system'
    subtype VARCHAR(50),                          -- 'patent_payment', 'registration', etc.
    priority VARCHAR(10) DEFAULT 'normal',        -- 'critical', 'high', 'normal', 'low'

    title_key VARCHAR(100) NOT NULL,              -- i18n key
    body_key VARCHAR(100) NOT NULL,
    title_params JSONB,                           -- Параметры для интерполяции
    body_params JSONB,

    -- Связь с сущностями
    related_type VARCHAR(50),                     -- 'deadline', 'law', 'payment'
    related_id UUID,

    -- Доставка
    channels_attempted VARCHAR(20)[],             -- ['push', 'telegram']
    channels_delivered VARCHAR(20)[],

    -- Статус
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    acted_at TIMESTAMPTZ,                         -- Пользователь выполнил действие

    -- Snooze
    snoozed_until TIMESTAMPTZ,
    snooze_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type, subtype);

-- Партиционирование по месяцам (для большого объёма)
-- См. раздел 6. Партиционирование
```

### 2.4 Схема: Legal (Справочник)

```sql
-- ===================
-- REGIONS
-- ===================
CREATE TABLE regions (
    code VARCHAR(10) PRIMARY KEY,                 -- '77', '78', '50'
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Региональные параметры
    patent_price INTEGER,                         -- Стоимость патента в копейках
    patent_price_updated_at DATE,

    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',

    is_active BOOLEAN DEFAULT TRUE
);

-- ===================
-- LAWS
-- ===================
CREATE TABLE laws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,             -- '115-FZ', '109-FZ'
    name_ru TEXT NOT NULL,
    name_en TEXT,

    category VARCHAR(50),                         -- 'migration', 'labor', 'tax'
    current_version_id UUID,                      -- FK добавим после создания law_versions

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- LAW VERSIONS
-- ===================
CREATE TABLE law_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_id UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,

    version INTEGER NOT NULL,
    content TEXT NOT NULL,                        -- Текст закона (Markdown)
    summary TEXT,                                 -- Краткое описание изменений
    changes JSONB,                                -- Что изменилось
    /*
    {
      "added": ["Статья 5.1"],
      "modified": ["Статья 3 пункт 2"],
      "removed": []
    }
    */

    effective_date DATE NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by VARCHAR(100),

    -- Влияние на пользователей
    affects_deadlines BOOLEAN DEFAULT FALSE,
    affects_calculations BOOLEAN DEFAULT FALSE,
    affected_citizenships VARCHAR(3)[],           -- NULL = все
    affected_regions VARCHAR(10)[],               -- NULL = все
    criticality VARCHAR(10) DEFAULT 'info',       -- 'critical', 'important', 'info'

    UNIQUE(law_id, version)
);

CREATE INDEX idx_law_versions_law ON law_versions(law_id);
CREATE INDEX idx_law_versions_effective ON law_versions(effective_date);

-- Добавляем FK
ALTER TABLE laws ADD CONSTRAINT fk_laws_current_version
    FOREIGN KEY (current_version_id) REFERENCES law_versions(id);

-- ===================
-- FORM TEMPLATES
-- ===================
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,             -- 'migration_card', 'registration', 'patent'
    name_ru VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),

    category VARCHAR(50),                         -- 'migration', 'labor', 'tax'
    description_ru TEXT,
    description_en TEXT,

    -- Файлы
    template_url TEXT,                            -- URL шаблона PDF
    sample_url TEXT,                              -- URL образца заполнения
    instructions_ru TEXT,                         -- Инструкция по заполнению
    instructions_en TEXT,

    -- Метаданные
    required_for VARCHAR(3)[],                    -- Для каких гражданств обязательно
    regions VARCHAR(10)[],                        -- В каких регионах применяется

    version INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ===================
-- KNOWLEDGE CHUNKS (для RAG)
-- ===================
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    content TEXT NOT NULL,                        -- Текст чанка
    embedding vector(1536),                       -- OpenAI embedding

    -- Источник
    source_type VARCHAR(50),                      -- 'law', 'faq', 'guide', 'form'
    source_id UUID,                               -- ID закона/FAQ/etc
    source_url TEXT,

    -- Метаданные для фильтрации
    metadata JSONB,
    /*
    {
      "law_code": "115-FZ",
      "article": "5",
      "citizenship": ["UZ", "TJ"],
      "region": ["77"],
      "topic": "registration"
    }
    */

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для векторного поиска
CREATE INDEX idx_knowledge_chunks_embedding
    ON knowledge_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX idx_knowledge_chunks_source ON knowledge_chunks(source_type, source_id);

-- ===================
-- FAQ
-- ===================
CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    question_ru TEXT NOT NULL,
    question_uz TEXT,
    question_tg TEXT,
    question_ky TEXT,
    question_en TEXT,

    answer_ru TEXT NOT NULL,
    answer_uz TEXT,
    answer_tg TEXT,
    answer_ky TEXT,
    answer_en TEXT,

    category VARCHAR(50),                         -- 'registration', 'patent', 'documents'
    tags VARCHAR(50)[],

    -- Для каких пользователей релевантно
    citizenships VARCHAR(3)[],
    regions VARCHAR(10)[],
    purposes VARCHAR(20)[],

    -- Статистика
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faq_category ON faq(category);
CREATE INDEX idx_faq_active ON faq(is_active, sort_order);
```

### 2.5 Схема: Audit

```sql
-- ===================
-- AUDIT LOG
-- ===================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Кто
    device_id UUID,                               -- Может быть NULL для системных событий
    user_id UUID,

    -- Что
    event_type VARCHAR(50) NOT NULL,              -- 'AUTH', 'DATA_ACCESS', 'DATA_MODIFY', etc.
    action VARCHAR(100) NOT NULL,                 -- 'login', 'document_add', 'backup_create'
    resource VARCHAR(100),                        -- 'document', 'profile', 'subscription'
    resource_id UUID,

    -- Результат
    result VARCHAR(20) NOT NULL,                  -- 'success', 'failure', 'error'
    error_code VARCHAR(50),
    error_message TEXT,

    -- Контекст (БЕЗ PII!)
    metadata JSONB,
    /*
    {
      "citizenship": "UZ",
      "region": "77",
      "platform": "ios",
      "app_version": "1.2.0"
    }
    */

    -- IP (хешированный для приватности)
    ip_hash VARCHAR(64)

) PARTITION BY RANGE (timestamp);

-- Партиции по месяцам
CREATE TABLE audit_log_2024_01 PARTITION OF audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_log_2024_02 PARTITION OF audit_log
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... создавать автоматически через cron job

CREATE INDEX idx_audit_log_device ON audit_log(device_id, timestamp);
CREATE INDEX idx_audit_log_event ON audit_log(event_type, timestamp);
CREATE INDEX idx_audit_log_result ON audit_log(result, timestamp);

-- ===================
-- AI REQUEST LOG
-- ===================
CREATE TABLE ai_request_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    device_id UUID,

    -- Запрос (БЕЗ персональных данных!)
    request_hash VARCHAR(64),                     -- SHA256 запроса (для дедупликации)
    request_length INTEGER,
    request_language VARCHAR(5),

    -- Ответ
    response_length INTEGER,
    tokens_used INTEGER,
    model VARCHAR(50),

    -- RAG
    rag_chunks_used INTEGER,
    rag_sources TEXT[],

    -- Производительность
    latency_ms INTEGER,

    -- PII фильтр
    pii_detected BOOLEAN DEFAULT FALSE,
    pii_types VARCHAR(50)[],                      -- ['PASSPORT', 'PHONE']
    filter_level VARCHAR(20),                     -- 'client', 'gateway', 'proxy'

    -- Качество
    feedback VARCHAR(10),                         -- 'helpful', 'not_helpful'
    feedback_comment TEXT

) PARTITION BY RANGE (timestamp);

CREATE INDEX idx_ai_request_log_device ON ai_request_log(device_id, timestamp);
CREATE INDEX idx_ai_request_log_pii ON ai_request_log(pii_detected, timestamp);

-- ===================
-- SECURITY EVENTS
-- ===================
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    severity VARCHAR(10) NOT NULL,                -- 'critical', 'high', 'medium', 'low'
    event_type VARCHAR(50) NOT NULL,              -- 'BRUTE_FORCE', 'PII_LEAK', 'ANOMALY'

    device_id UUID,
    ip_hash VARCHAR(64),

    details JSONB NOT NULL,

    -- Реакция
    action_taken VARCHAR(50),                     -- 'blocked', 'alerted', 'none'
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    resolution_notes TEXT

) PARTITION BY RANGE (timestamp);

CREATE INDEX idx_security_events_severity ON security_events(severity, timestamp);
CREATE INDEX idx_security_events_device ON security_events(device_id, timestamp);
```

### 2.6 Схема: Backup (Cloud Safe)

```sql
-- ===================
-- BACKUPS
-- ===================
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Версионирование
    version INTEGER NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,

    -- Файл
    s3_key TEXT NOT NULL,                         -- Путь в S3
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(64) NOT NULL,                -- SHA256 зашифрованного файла

    -- Шифрование (метаданные, НЕ ключ!)
    encryption_salt TEXT NOT NULL,                -- Base64 encoded salt
    encryption_iv TEXT NOT NULL,                  -- Base64 encoded IV

    -- Статус
    status VARCHAR(20) DEFAULT 'active',          -- 'active', 'deleted', 'corrupted'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                       -- Для старых версий

    UNIQUE(user_id, version)
);

CREATE INDEX idx_backups_user ON backups(user_id);
CREATE INDEX idx_backups_current ON backups(user_id, is_current) WHERE is_current = TRUE;

-- ===================
-- BACKUP VERSIONS (история)
-- ===================
CREATE TABLE backup_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_id UUID NOT NULL REFERENCES backups(id) ON DELETE CASCADE,

    version INTEGER NOT NULL,
    s3_key TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(64) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_backup_versions_backup ON backup_versions(backup_id);
```

---

## 3. Локальная БД (IndexedDB)

### 3.1 Dexie.js Schema

```typescript
// lib/db/schema.ts

import Dexie, { Table } from 'dexie';

// ===================
// INTERFACES
// ===================

interface Profile {
  id: string;                     // 'profile' (singleton)

  // Персональные данные (зашифрованы)
  fullName?: string;
  birthDate?: string;
  citizenship: string;
  phone?: string;
  email?: string;
  address?: string;

  // Незашифрованные метаданные
  entryDate: string;
  purpose: string;
  region: string;
  isEAEU: boolean;

  // Синхронизация
  syncedAt?: Date;
  version: number;
}

interface Document {
  id: string;                     // UUID
  type: DocumentType;             // 'passport', 'migration_card', 'patent', etc.

  // Данные документа (зашифрованы)
  number?: string;
  series?: string;
  issuedDate?: string;
  expiresDate?: string;
  issuedBy?: string;

  // Сканы (зашифрованы)
  scans?: Scan[];

  // Метаданные
  status: DocumentStatus;         // 'valid', 'expiring', 'expired'
  daysUntilExpiry?: number;

  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  version: number;
}

interface Scan {
  id: string;
  data: Blob;                     // Зашифрованное изображение
  mimeType: string;
  createdAt: Date;
}

interface Deadline {
  id: string;
  type: DeadlineType;             // 'registration', 'patent_payment', '90_180', etc.
  date: Date;

  // Связь с документом
  documentId?: string;
  documentType?: DocumentType;

  // Статус
  status: DeadlineStatus;         // 'upcoming', 'urgent', 'overdue', 'completed'
  completedAt?: Date;

  // Уведомления
  notificationsSent: number[];    // Дни до дедлайна когда отправлены
  snoozedUntil?: Date;

  createdAt: Date;
  updatedAt: Date;
}

interface SyncQueueItem {
  id: string;
  action: SyncAction;             // 'create', 'update', 'delete'
  entity: SyncEntity;             // 'profile', 'document', 'deadline'
  entityId: string;
  payload: any;                   // Данные для синхронизации (анонимизированные)

  createdAt: Date;
  retries: number;
  lastError?: string;
}

interface CachedLaw {
  id: string;
  code: string;
  content: string;
  version: number;
  cachedAt: Date;
  expiresAt: Date;
}

interface Setting {
  key: string;
  value: any;
}

// ===================
// DATABASE CLASS
// ===================

class MigrantHubDB extends Dexie {
  profile!: Table<Profile>;
  documents!: Table<Document>;
  deadlines!: Table<Deadline>;
  syncQueue!: Table<SyncQueueItem>;
  cachedLaws!: Table<CachedLaw>;
  settings!: Table<Setting>;

  constructor() {
    super('MigrantHubDB');

    // Версионирование схемы
    this.version(1).stores({
      profile: 'id',
      documents: 'id, type, status, expiresDate',
      deadlines: 'id, type, date, status, documentId',
      syncQueue: 'id, action, entity, createdAt',
      cachedLaws: 'id, code, expiresAt',
      settings: 'key'
    });

    this.version(2).stores({
      // Добавляем новые индексы
      documents: 'id, type, status, expiresDate, updatedAt',
      deadlines: 'id, type, date, status, documentId, [type+status]'
    }).upgrade(tx => {
      // Миграция данных если нужно
      return tx.table('documents').toCollection().modify(doc => {
        if (!doc.version) doc.version = 1;
      });
    });

    // Добавляем middleware для шифрования
    this.use(encryptionMiddleware);
  }
}

export const db = new MigrantHubDB();

// ===================
// ENCRYPTION MIDDLEWARE
// ===================

const ENCRYPTED_FIELDS: Record<string, string[]> = {
  profile: ['fullName', 'birthDate', 'phone', 'email', 'address'],
  documents: ['number', 'series', 'issuedBy', 'scans']
};

const encryptionMiddleware = {
  stack: 'dbcore',
  name: 'encryptionMiddleware',
  create(downlevelDatabase: any) {
    return {
      ...downlevelDatabase,
      table(tableName: string) {
        const table = downlevelDatabase.table(tableName);
        const fieldsToEncrypt = ENCRYPTED_FIELDS[tableName];

        if (!fieldsToEncrypt) return table;

        return {
          ...table,

          // Шифруем при записи
          mutate: async (req: any) => {
            if (req.type === 'put' || req.type === 'add') {
              const encryptedValues = await Promise.all(
                req.values.map((value: any) =>
                  encryptFields(value, fieldsToEncrypt)
                )
              );
              req.values = encryptedValues;
            }
            return table.mutate(req);
          },

          // Расшифровываем при чтении
          get: async (req: any) => {
            const result = await table.get(req);
            if (result) {
              return decryptFields(result, fieldsToEncrypt);
            }
            return result;
          },

          query: async (req: any) => {
            const result = await table.query(req);
            result.result = await Promise.all(
              result.result.map((item: any) =>
                decryptFields(item, fieldsToEncrypt)
              )
            );
            return result;
          }
        };
      }
    };
  }
};
```

### 3.2 Encryption Utils

```typescript
// lib/crypto/encryption.ts

import { Preferences } from '@capacitor/preferences';

// Получаем ключ из Keychain/Keystore
async function getEncryptionKey(): Promise<CryptoKey> {
  const { value } = await Preferences.get({ key: 'encryption_key' });

  if (!value) {
    // Генерируем новый ключ
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Экспортируем и сохраняем
    const exported = await crypto.subtle.exportKey('raw', key);
    await Preferences.set({
      key: 'encryption_key',
      value: btoa(String.fromCharCode(...new Uint8Array(exported)))
    });

    return key;
  }

  // Импортируем существующий ключ
  const keyData = Uint8Array.from(atob(value), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Шифрование значения
async function encryptValue(value: any): Promise<string> {
  if (value === null || value === undefined) return value;

  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encoded = new TextEncoder().encode(JSON.stringify(value));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Формат: iv:ciphertext (base64)
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return `${ivBase64}:${ciphertextBase64}`;
}

// Расшифровка значения
async function decryptValue(encrypted: string): Promise<any> {
  if (!encrypted || !encrypted.includes(':')) return encrypted;

  const key = await getEncryptionKey();
  const [ivBase64, ciphertextBase64] = encrypted.split(':');

  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

// Шифрование полей объекта
async function encryptFields(
  obj: Record<string, any>,
  fields: string[]
): Promise<Record<string, any>> {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = await encryptValue(result[field]);
    }
  }

  return result;
}

// Расшифровка полей объекта
async function decryptFields(
  obj: Record<string, any>,
  fields: string[]
): Promise<Record<string, any>> {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && typeof result[field] === 'string') {
      try {
        result[field] = await decryptValue(result[field]);
      } catch {
        // Поле не зашифровано или повреждено
      }
    }
  }

  return result;
}
```

---

## 4. Миграции

### 4.1 Prisma Migrations

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp(map: "uuid-ossp"), pgcrypto, vector]
}

model User {
  id               String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  citizenshipCode  String    @map("citizenship_code") @db.VarChar(3)
  regionCode       String?   @map("region_code") @db.VarChar(10)
  entryDate        DateTime? @map("entry_date") @db.Date
  purpose          String?   @db.VarChar(20)
  isEaeu           Boolean   @default(false) @map("is_eaeu")

  telegramIdHash   String?   @unique @map("telegram_id_hash") @db.VarChar(64)
  vkIdHash         String?   @unique @map("vk_id_hash") @db.VarChar(64)

  onboardingCompleted Boolean @default(false) @map("onboarding_completed")
  language         String    @default("ru") @db.VarChar(5)
  timezone         String    @default("Europe/Moscow") @db.VarChar(50)

  checklist        Json      @default("[]")

  subscriptionType String    @default("free") @map("subscription_type") @db.VarChar(20)
  subscriptionUntil DateTime? @map("subscription_until")
  subscriptionStartedAt DateTime? @map("subscription_started_at")
  autoRenew        Boolean   @default(false) @map("auto_renew")

  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  lastActiveAt     DateTime  @default(now()) @map("last_active_at")
  deletedAt        DateTime? @map("deleted_at")

  devices          Device[]
  recoveryCodes    RecoveryCode[]
  subscriptions    Subscription[]
  payments         Payment[]
  notifications    Notification[]
  messengerConnections MessengerConnection[]
  backups          Backup[]

  @@map("users")
}

// ... остальные модели
```

### 4.2 Migration Commands

```bash
# Создание миграции
npx prisma migrate dev --name add_users_table

# Применение миграций в production
npx prisma migrate deploy

# Генерация Prisma Client
npx prisma generate

# Просмотр статуса миграций
npx prisma migrate status
```

---

## 5. Индексы и оптимизация

### 5.1 Основные индексы

```sql
-- ===================
-- USERS
-- ===================
CREATE INDEX idx_users_citizenship ON users(citizenship_code);
CREATE INDEX idx_users_region ON users(region_code);
CREATE INDEX idx_users_subscription ON users(subscription_type, subscription_until);
CREATE INDEX idx_users_telegram_hash ON users(telegram_id_hash) WHERE telegram_id_hash IS NOT NULL;
CREATE INDEX idx_users_active ON users(last_active_at) WHERE deleted_at IS NULL;

-- Композитный индекс для фильтрации
CREATE INDEX idx_users_filter ON users(citizenship_code, region_code, purpose)
    WHERE deleted_at IS NULL;

-- ===================
-- NOTIFICATIONS
-- ===================
CREATE INDEX idx_notifications_pending ON notifications(scheduled_for)
    WHERE sent_at IS NULL;
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at)
    WHERE read_at IS NULL;

-- ===================
-- KNOWLEDGE CHUNKS (RAG)
-- ===================
-- IVFFlat индекс для векторного поиска
CREATE INDEX idx_knowledge_chunks_embedding
    ON knowledge_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Для фильтрации по метаданным
CREATE INDEX idx_knowledge_chunks_metadata ON knowledge_chunks
    USING GIN (metadata jsonb_path_ops);

-- ===================
-- AUDIT LOG
-- ===================
-- BRIN индекс для временных данных (эффективнее для append-only)
CREATE INDEX idx_audit_log_timestamp_brin ON audit_log
    USING BRIN (timestamp);
```

### 5.2 Query Optimization

```sql
-- Пример оптимизированного запроса для получения ближайших дедлайнов
EXPLAIN ANALYZE
SELECT
    u.id,
    u.citizenship_code,
    u.region_code,
    n.type,
    n.scheduled_for
FROM users u
JOIN notifications n ON n.user_id = u.id
WHERE
    u.deleted_at IS NULL
    AND u.subscription_type != 'free'
    AND n.sent_at IS NULL
    AND n.scheduled_for <= NOW() + INTERVAL '7 days'
ORDER BY n.scheduled_for
LIMIT 100;

-- Должен использовать:
-- idx_users_active для фильтрации активных
-- idx_notifications_pending для pending уведомлений
```

---

## 6. Партиционирование

### 6.1 Партиционирование Audit Log

```sql
-- Создание партиционированной таблицы
CREATE TABLE audit_log (
    id UUID DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    device_id UUID,
    event_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    result VARCHAR(20) NOT NULL,
    metadata JSONB,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Автоматическое создание партиций (pg_partman)
SELECT partman.create_parent(
    p_parent_table => 'public.audit_log',
    p_control => 'timestamp',
    p_type => 'native',
    p_interval => 'monthly',
    p_premake => 3
);

-- Или вручную
CREATE TABLE audit_log_2024_01 PARTITION OF audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_log_2024_02 PARTITION OF audit_log
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Retention policy (удаление старых партиций)
-- Запускается по cron раз в месяц
DO $$
DECLARE
    partition_name TEXT;
    cutoff_date DATE := NOW() - INTERVAL '1 year';
BEGIN
    FOR partition_name IN
        SELECT tablename
        FROM pg_tables
        WHERE tablename LIKE 'audit_log_%'
        AND tablename < 'audit_log_' || TO_CHAR(cutoff_date, 'YYYY_MM')
    LOOP
        -- Архивируем в S3 перед удалением
        -- COPY partition_name TO PROGRAM 'aws s3 cp - s3://archive/...'

        EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
        RAISE NOTICE 'Dropped partition: %', partition_name;
    END LOOP;
END $$;
```

### 6.2 Автоматизация партиций

```typescript
// scripts/manage-partitions.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNextMonthPartitions() {
  const tables = ['audit_log', 'ai_request_log', 'security_events'];

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const partitionSuffix = nextMonth.toISOString().slice(0, 7).replace('-', '_');
  const startDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  const endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1);

  for (const table of tables) {
    const partitionName = `${table}_${partitionSuffix}`;

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${partitionName}
      PARTITION OF ${table}
      FOR VALUES FROM ('${startDate.toISOString()}') TO ('${endDate.toISOString()}')
    `);

    console.log(`Created partition: ${partitionName}`);
  }
}

// Запуск через GitHub Actions или cron
createNextMonthPartitions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Appendix: ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY RELATIONSHIP DIAGRAM                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │    users     │───────│   devices    │───────│ devices_push │            │
│  │              │ 1   n │              │ 1   n │              │            │
│  │  id          │       │  id          │       │  push_token  │            │
│  │  citizenship │       │  platform    │       │  provider    │            │
│  │  region      │       │  api_key_hash│       │              │            │
│  │  subscription│       │              │       └──────────────┘            │
│  └──────┬───────┘       └──────────────┘                                   │
│         │                                                                   │
│         │ 1                                                                 │
│         │                                                                   │
│    n    │    n                                                              │
│  ┌──────┴───────┐       ┌──────────────┐       ┌──────────────┐            │
│  │subscriptions │───────│   payments   │───────│payment_events│            │
│  │              │ 1   n │              │ 1   n │              │            │
│  │  plan_id     │       │  amount      │       │  event_type  │            │
│  │  status      │       │  status      │       │  event_data  │            │
│  └──────────────┘       └──────────────┘       └──────────────┘            │
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │     laws     │───────│ law_versions │       │  knowledge   │            │
│  │              │ 1   n │              │       │   _chunks    │            │
│  │  code        │       │  version     │       │              │            │
│  │  name        │       │  content     │       │  embedding   │            │
│  │  current_ver │       │  effective   │       │  metadata    │            │
│  └──────────────┘       └──────────────┘       └──────────────┘            │
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │  audit_log   │       │ai_request_log│       │security_event│            │
│  │ (partitioned)│       │ (partitioned)│       │ (partitioned)│            │
│  │              │       │              │       │              │            │
│  │  timestamp   │       │  timestamp   │       │  timestamp   │            │
│  │  event_type  │       │  tokens_used │       │  severity    │            │
│  │  metadata    │       │  pii_detected│       │  details     │            │
│  └──────────────┘       └──────────────┘       └──────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Документ: 02-DATABASE.md*
*Блок 2 из 6 архитектурной документации MigrantHub*
