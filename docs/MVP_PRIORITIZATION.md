# MigrantHub: Приоритизация MVP

**Версия:** 1.0
**Дата:** 2025-01-25

---

## 1. Методология приоритизации

### 1.1 Критерии оценки

| Критерий | Вес | Описание |
|----------|-----|----------|
| **Ценность** | 40% | Насколько функция важна для пользователя |
| **Частота** | 25% | Как часто будет использоваться |
| **Сложность** | 20% | Трудозатраты на разработку (инверсия) |
| **Зависимости** | 15% | Блокирует ли другие функции |

### 1.2 MoSCoW Classification

| Категория | Описание | % от MVP |
|-----------|----------|----------|
| **Must Have** | Без этого приложение не имеет смысла | 100% |
| **Should Have** | Важно, но можно отложить на v1.1 | 0% в MVP |
| **Could Have** | Приятно иметь, низкий приоритет | 0% в MVP |
| **Won't Have** | Не в этой версии | - |

---

## 2. Анализ User Stories

### 2.1 Ключевые сценарии пользователя

```
Мигрант Алишер (29 лет, Узбекистан, работает в Москве):

1. "Хочу хранить все документы в одном месте" → DOCUMENTS
2. "Боюсь пропустить оплату патента" → REMINDERS
3. "Не понимаю, какие документы мне нужны" → AI ASSISTANT
4. "Хочу быстро проверить, нет ли у меня запрета" → BAN CHECK
5. "Нужно посчитать, сколько дней я могу находиться" → CALCULATOR
6. "Хочу получать уведомления о сроках" → NOTIFICATIONS
7. "Хочу чтобы данные не потерялись" → BACKUP
```

### 2.2 Матрица ценности

| Функция | Боль | Частота | Альтернатива | Score |
|---------|------|---------|--------------|-------|
| Хранение документов | Высокая | Ежедневно | Папка с бумагами | **95** |
| Напоминания о сроках | Критичная | Еженедельно | Календарь | **90** |
| Калькулятор сроков | Высокая | Ежемесячно | Ручной подсчёт | **85** |
| Проверка запрета | Критичная | Разово | Сайт МВД | **80** |
| AI консультации | Средняя | По необходимости | Юрист (дорого) | **75** |
| Push уведомления | Высокая | Пассивно | SMS | **70** |
| Облачный бэкап | Средняя | Редко | Нет | **65** |
| Оплата патента | Низкая | Ежемесячно | Банк | **50** |

---

## 3. MVP Scope Definition

### 3.1 Must Have (MVP v1.0)

#### Модуль 1: Базовая инфраструктура
```
┌─────────────────────────────────────────────────────────────┐
│                    MUST HAVE: CORE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [✓] Device-based Auth (без SMS!)                          │
│      - UUID устройства = идентификатор                     │
│      - Нет затрат на SMS gateway                           │
│      - Можно добавить phone auth позже                     │
│                                                             │
│  [✓] Минимальный Backend API                               │
│      - POST /auth/device                                    │
│      - GET/PATCH /users/me                                  │
│      - Health check                                         │
│                                                             │
│  [✓] PostgreSQL + Redis                                    │
│      - Users (анонимные)                                   │
│      - Settings                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Модуль 2: Документы (локально)
```
┌─────────────────────────────────────────────────────────────┐
│                  MUST HAVE: DOCUMENTS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [✓] Локальное хранение (IndexedDB)                        │
│      - Все документы на устройстве                         │
│      - Шифрование AES-256                                  │
│      - Без серверного хранения                             │
│                                                             │
│  [✓] Типы документов:                                      │
│      - Паспорт                                             │
│      - Миграционная карта                                  │
│      - Патент                                              │
│      - Регистрация                                         │
│                                                             │
│  [✓] Ручной ввод данных                                    │
│      - Формы с валидацией                                  │
│      - OCR → v1.1 (отложено)                               │
│                                                             │
│  [✓] Напоминания о сроках                                  │
│      - Локальные уведомления (Capacitor)                   │
│      - 30/14/7/3/1 день до истечения                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Модуль 3: Утилиты
```
┌─────────────────────────────────────────────────────────────┐
│                   MUST HAVE: UTILITIES                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [✓] Калькулятор сроков пребывания                         │
│      - 90/180 правило                                      │
│      - Расчёт оставшихся дней                              │
│      - Работает offline                                    │
│                                                             │
│  [✓] Проверка запрета на въезд                             │
│      - Интеграция с сервисами МВД                          │
│      - Кэширование результата                              │
│                                                             │
│  [✓] Информация о патенте                                  │
│      - Стоимость по регионам                               │
│      - Сроки оплаты                                        │
│      - Реквизиты                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Модуль 4: Локализация
```
┌─────────────────────────────────────────────────────────────┐
│                 MUST HAVE: LOCALIZATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [✓] 4 языка (уже реализовано):                            │
│      - Русский (основной)                                  │
│      - Узбекский                                           │
│      - Таджикский                                          │
│      - Кыргызский                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Should Have (v1.1 - через 2 недели после MVP)

| Функция | Причина отложения | Зависимости |
|---------|-------------------|-------------|
| **Phone Auth (SMS OTP)** | Затраты на SMS, сложность | SMS gateway |
| **Push Notifications (FCM)** | Требует backend | Notification service |
| **Cloud Safe (E2E backup)** | Сложная криптография | Backup API |
| **OCR сканирование** | Tesseract.js тяжёлый | - |
| **Telegram бот** | Дополнительный канал | Bot API |

### 3.3 Could Have (v1.2 - через месяц)

| Функция | Причина | Зависимости |
|---------|---------|-------------|
| **AI Assistant** | Затраты на LLM, PII риски | OpenAI API, RAG |
| **Платежи (СБП/ЮKassa)** | Сертификация, договоры | Payment gateway |
| **Экзаменационный тренажёр** | Контент нужен | Legal content |
| **Telegram Auth** | Альтернатива phone | Telegram API |

### 3.4 Won't Have (v2.0+)

| Функция | Причина |
|---------|---------|
| B2B платформа | Требует product-market fit |
| White-label | Сначала B2C |
| Финтех сервисы | Лицензирование |
| Глобальная экспансия | Фокус на РФ |

---

## 4. MVP Feature Matrix

### 4.1 Детальная разбивка

```
                              MVP v1.0    v1.1    v1.2    v2.0
                              --------    ----    ----    ----
AUTHENTICATION
├─ Device ID auth               ✅         -       -       -
├─ Phone OTP                    ❌         ✅      -       -
├─ Telegram auth                ❌         ❌      ✅      -
└─ VK ID auth                   ❌         ❌      ✅      -

DOCUMENTS
├─ Local storage (encrypted)    ✅         -       -       -
├─ Manual data entry            ✅         -       -       -
├─ OCR scanning                 ❌         ✅      -       -
├─ Document templates           ✅         -       -       -
└─ PDF export                   ✅         -       -       -

REMINDERS
├─ Local notifications          ✅         -       -       -
├─ Push notifications (FCM)     ❌         ✅      -       -
├─ Telegram notifications       ❌         ✅      -       -
└─ Smart timing                 ❌         ❌      ✅      -

UTILITIES
├─ Stay calculator              ✅         -       -       -
├─ Ban checker                  ✅         -       -       -
├─ Patent info                  ✅         -       -       -
├─ Exam trainer                 ❌         ❌      ✅      -
└─ Maps (МФЦ, ФМС)             ❌         ✅      -       -

BACKUP
├─ Local export                 ✅         -       -       -
├─ Cloud Safe (E2E)             ❌         ✅      -       -
└─ Cross-device sync            ❌         ❌      ✅      -

AI ASSISTANT
├─ Basic Q&A                    ❌         ❌      ✅      -
├─ RAG (legal docs)             ❌         ❌      ✅      -
├─ PII filter                   ❌         ❌      ✅      -
└─ Kill switch                  ❌         ❌      ✅      -

PAYMENTS
├─ СБП                          ❌         ❌      ✅      -
├─ ЮKassa                       ❌         ❌      ✅      -
├─ Subscriptions                ❌         ❌      ✅      -
└─ In-app purchases             ❌         ❌      ❌      ✅

LOCALIZATION
├─ Russian                      ✅         -       -       -
├─ Uzbek                        ✅         -       -       -
├─ Tajik                        ✅         -       -       -
├─ Kyrgyz                       ✅         -       -       -
└─ English                      ✅         -       -       -

Legend: ✅ Included  ❌ Not included  - Already done
```

---

## 5. Technical MVP Scope

### 5.1 Backend (Минимум)

```typescript
// apps/api-core - ТОЛЬКО эти endpoints для MVP

// Auth
POST   /api/v1/auth/device      // Device registration
POST   /api/v1/auth/refresh     // Token refresh

// User (anonymous)
GET    /api/v1/users/me         // Get profile
PATCH  /api/v1/users/me         // Update settings

// Utilities (proxy to external)
GET    /api/v1/ban-check/:params  // Proxy to МВД
GET    /api/v1/patent/regions     // Static data

// Health
GET    /api/v1/health           // Health check
```

**Что НЕ нужно для MVP:**
- ❌ Backup endpoints (Cloud Safe)
- ❌ AI endpoints
- ❌ Payment endpoints
- ❌ Notification service
- ❌ Legal-core интеграция

### 5.2 Database (Минимум)

```sql
-- ТОЛЬКО 2 таблицы для MVP

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(64) UNIQUE NOT NULL,
    citizenship_code VARCHAR(3),
    region_code VARCHAR(10),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}'
);
```

### 5.3 Frontend (Дорабатываем)

```
Текущий статус: 70-80% готово

Нужно доработать для MVP:
├─ [ ] API client integration (device auth)
├─ [ ] Document forms (manual entry)
├─ [ ] Local notifications (Capacitor)
├─ [ ] Stay calculator (logic)
├─ [ ] Ban checker (API proxy)
├─ [ ] Offline mode polish
└─ [ ] Error handling

Уже готово (использовать как есть):
├─ [✓] Navigation (5 tabs)
├─ [✓] Localization (5 languages)
├─ [✓] Auth UI flow
├─ [✓] Document wizard UI
├─ [✓] Profile form UI
├─ [✓] Zustand stores
├─ [✓] IndexedDB setup
└─ [✓] PWA/Capacitor config
```

### 5.4 Infrastructure (Минимум)

```yaml
# docker-compose.mvp.yml

version: '3.8'

services:
  # ТОЛЬКО 3 сервиса для MVP

  api-core:
    build: ./apps/api-core
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=migranthub
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

# НЕ НУЖНО для MVP:
# - api-ai
# - api-notify
# - rabbitmq
# - legal-core (уже есть отдельно)
```

---

## 6. MVP Development Roadmap

### 6.1 Sprint Plan (2 недели)

```
SPRINT 1 (Неделя 1): Backend + Integration
═══════════════════════════════════════════

День 1-2: Backend Setup
├─ [ ] NestJS проект (api-core)
├─ [ ] PostgreSQL schema
├─ [ ] Redis connection
├─ [ ] Docker Compose
└─ [ ] Health endpoint

День 3-4: Auth Module
├─ [ ] Device auth endpoint
├─ [ ] JWT generation
├─ [ ] Refresh token logic
├─ [ ] Auth guard
└─ [ ] Rate limiting

День 5: User Module
├─ [ ] User CRUD
├─ [ ] Settings storage
├─ [ ] Validation (class-validator)
└─ [ ] Swagger docs

День 6-7: Utilities API
├─ [ ] Ban check proxy
├─ [ ] Patent regions data
├─ [ ] Error handling
└─ [ ] Logging (Pino)


SPRINT 2 (Неделя 2): Frontend + Polish
═══════════════════════════════════════════

День 8-9: Frontend Integration
├─ [ ] API client setup
├─ [ ] Device auth flow
├─ [ ] Token storage (secure)
├─ [ ] Auto-refresh logic
└─ [ ] Error handling UI

День 10-11: Documents Feature
├─ [ ] Document forms completion
├─ [ ] Local storage encryption
├─ [ ] Expiry date tracking
├─ [ ] Local notifications setup
└─ [ ] PDF export

День 12: Utilities
├─ [ ] Stay calculator logic
├─ [ ] Ban checker integration
├─ [ ] Patent info display
└─ [ ] Offline caching

День 13: Testing & QA
├─ [ ] Unit tests (critical paths)
├─ [ ] Manual testing
├─ [ ] Bug fixes
└─ [ ] Performance check

День 14: Release Prep
├─ [ ] Production build
├─ [ ] App Store assets
├─ [ ] Play Store assets
├─ [ ] Release notes
└─ [ ] Monitoring setup (Sentry)
```

### 6.2 Milestones

| Milestone | Дата | Критерии готовности |
|-----------|------|---------------------|
| **M1: Backend Ready** | День 7 | API работает, тесты проходят |
| **M2: Integration Done** | День 11 | Frontend + Backend связаны |
| **M3: Feature Complete** | День 13 | Все MVP фичи работают |
| **M4: Release** | День 14 | Готово к публикации |

---

## 7. MVP Success Metrics

### 7.1 Launch Metrics (первые 30 дней)

| Метрика | Target | Измерение |
|---------|--------|-----------|
| Downloads | 1,000 | Store analytics |
| DAU | 100 | Backend analytics |
| Retention D7 | 30% | Cohort analysis |
| Documents saved | 500 | Local analytics |
| Crash-free rate | 99% | Sentry |

### 7.2 Validation Hypotheses

| Гипотеза | Метрика | Успех |
|----------|---------|-------|
| "Мигранты будут хранить документы в приложении" | Docs per user > 2 | ✓ если да |
| "Напоминания о сроках ценны" | Notification click rate > 20% | ✓ если да |
| "Калькулятор сроков востребован" | Calculator usage > 50% | ✓ если да |
| "Проверка запрета нужна" | Ban check usage > 30% | ✓ если да |

---

## 8. Risk Assessment

### 8.1 MVP Risks

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| Низкий retention | Средняя | Высокий | Фокус на core value (документы) |
| Технические баги | Средняя | Средний | Тщательное тестирование |
| Store rejection | Низкая | Высокий | Следовать guidelines |
| Конкуренты | Низкая | Средний | Быстрый выход на рынок |

### 8.2 Cut Decisions

Если не успеваем в 2 недели, режем в таком порядке:

1. ❌ Ban checker → можно добавить в v1.0.1
2. ❌ PDF export → можно добавить в v1.0.1
3. ❌ Patent info → статичная страница
4. ⚠️ Calculator → критично, не резать
5. ⚠️ Documents → критично, не резать
6. ⚠️ Reminders → критично, не резать

---

## 9. Post-MVP Roadmap

### 9.1 Version Timeline

```
v1.0 (MVP)          v1.1              v1.2              v2.0
    │                 │                 │                 │
    │   2 недели      │   2 недели      │   4 недели      │
    │─────────────────│─────────────────│─────────────────│
    │                 │                 │                 │
    │ • Device auth   │ • Phone OTP     │ • AI Assistant  │ • B2B Platform
    │ • Documents     │ • Push notif    │ • Payments      │ • Partnerships
    │ • Calculator    │ • Cloud Safe    │ • Exam trainer  │ • White-label
    │ • Ban check     │ • OCR           │ • Maps          │ • Fintech
    │ • Reminders     │ • Telegram bot  │ • Analytics     │
    │                 │                 │                 │
    └─────────────────┴─────────────────┴─────────────────┘

    Сейчас          +2 недели        +1 месяц         +3 месяца
```

### 9.2 Feature Unlock Triggers

| Версия | Trigger для начала разработки |
|--------|-------------------------------|
| v1.1 | MVP DAU > 50 |
| v1.2 | v1.1 retention D7 > 25% |
| v2.0 | v1.2 revenue > 0 или 10K users |

---

## 10. Action Items

### 10.1 Immediate Next Steps

```
СЕГОДНЯ:
□ Создать apps/api-core (NestJS scaffold)
□ Настроить Docker Compose для dev
□ Создать GitHub Issues из этого документа

ЗАВТРА:
□ Реализовать device auth
□ Начать интеграцию frontend

ДО КОНЦА НЕДЕЛИ:
□ Backend MVP ready
□ Frontend integration started
```

### 10.2 Team Allocation

| Роль | Фокус MVP | Загрузка |
|------|-----------|----------|
| Backend Dev | api-core, auth, utilities | 100% |
| Frontend Dev | Integration, documents, polish | 100% |
| Designer | App Store assets, icons | 20% |
| QA | Testing последние 2 дня | 50% |

---

## Резюме: MVP в одном слайде

```
┌─────────────────────────────────────────────────────────────┐
│                    MigrantHub MVP v1.0                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CORE VALUE: Все документы в одном месте + напоминания     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  ДОКУМЕНТЫ  │  │ НАПОМИНАНИЯ │  │ КАЛЬКУЛЯТОР │         │
│  │  (локально) │  │  (локально) │  │   СРОКОВ    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  + Проверка запрета  + 4 языка  + Offline работа          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Timeline: 2 недели                                        │
│  Backend:  3 endpoints (auth, user, ban-check)             │
│  Infra:    PostgreSQL + Redis (минимум)                    │
│  Cost:     ~$50/месяц (Selectel)                           │
│                                                             │
│  Success:  1000 downloads, 30% D7 retention                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Документ создан:** 2025-01-25
**Следующий шаг:** Создание задач в трекере
