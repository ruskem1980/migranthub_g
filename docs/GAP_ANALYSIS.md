# GAP Analysis: MigrantHub

> **Версия**: 1.0
> **Дата**: 2026-01-27
> **Источники**: 01-REQUIREMENTS.md, 02-BACKEND-IMPLEMENTED.md, 03-FRONTEND-IMPLEMENTED.md

---

## Executive Summary

| Метрика | Значение |
|---------|----------|
| **Требований всего** | 188 |
| **Реализовано полностью** | 52 (28%) |
| **Реализовано частично** | 18 (10%) |
| **Не реализовано** | 118 (62%) |
| **MVP готовность** | ~65% |

### Резюме по областям

| Область | MVP требований | Реализовано | Готовность |
|---------|---------------|-------------|------------|
| Backend API | 17 endpoints | 7 endpoints | 41% |
| Backend Modules | 10 | 5 | 50% |
| Database | 2 таблицы | 1 таблица | 50% |
| Frontend Screens | 10 | 9 | 90% |
| Frontend Components | 20 | 18 | 90% |
| Frontend Features | 14 | 10 | 71% |
| Security | 7 | 5 | 71% |
| Infrastructure | 8 | 4 | 50% |

### Критические блокеры MVP

1. **Backend**: Отсутствуют endpoints для Legal Core (справочник, калькуляторы)
2. **Backend**: Ban Check - заглушка, нет реальной интеграции с МВД
3. **Backend**: Нет endpoint для расчёта дедлайнов `/users/calculate`
4. **Frontend**: Нет синхронизации с backend для documents/checklists
5. **Infrastructure**: Нет CI/CD pipeline

---

## GAP Table

### Backend API Endpoints

| REQ ID | Требование | IMP ID | Статус | Gap | Приоритет |
|--------|------------|--------|--------|-----|-----------|
| REQ-BE-001 | POST /auth/device/register | IMP-BE-001 | ✅ | - | MVP |
| REQ-BE-002 | POST /auth/recovery/verify | - | ❌ | Не реализовано | MVP |
| REQ-BE-003 | POST /auth/telegram | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-004 | POST /auth/vk | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-005 | POST /auth/refresh | IMP-BE-002 | ✅ | - | MVP |
| REQ-BE-006 | POST /auth/phone/send | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-007 | POST /auth/phone/verify | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-010 | GET /users/profile | IMP-BE-003 | ✅ | Путь: /users/me | MVP |
| REQ-BE-011 | PATCH /users/profile | IMP-BE-004 | ✅ | Путь: /users/me | MVP |
| REQ-BE-012 | POST /users/onboarding/complete | - | ❌ | Не реализовано | MVP |
| REQ-BE-013 | POST /users/calculate | - | ❌ | Не реализовано | MVP |
| REQ-BE-014 | DELETE /users/account | - | ❌ | Не реализовано | MVP |
| REQ-BE-020 | GET /billing/products | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-021 | POST /billing/payments | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-022 | POST /billing/promo/validate | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-023 | GET /billing/payments | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-024 | POST /billing/subscription/cancel | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-025 | GET /billing/status | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-030 | POST /backup/upload-url | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-031 | POST /backup/{id}/confirm | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-032 | GET /backup/list | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-033 | GET /backup/{id}/download-url | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-034 | DELETE /backup/{id} | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-040 | POST /ai/chat | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-041 | POST /ai/chat/stream | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-042 | POST /ai/feedback | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-043 | GET /ai/status | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-044 | GET /ai/suggestions | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BE-050 | POST /notifications/push/register | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-051 | DELETE /notifications/push/unregister | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-052 | GET /notifications/settings | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-053 | PATCH /notifications/settings | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-054 | GET /notifications | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-055 | POST /notifications/read | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-056 | POST /notifications/{id}/snooze | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-057 | GET /notifications/badge | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-058 | GET /notifications/telegram/link | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-059 | DELETE /notifications/telegram/disconnect | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-060 | GET /notifications/vk/link | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-070 | GET /legal/categories | - | ❌ | Не реализовано | MVP |
| REQ-BE-071 | GET /legal/categories/{id}/items | - | ❌ | Не реализовано | MVP |
| REQ-BE-072 | GET /legal/laws | - | ❌ | Не реализовано | MVP |
| REQ-BE-073 | GET /legal/laws/{id} | - | ❌ | Не реализовано | MVP |
| REQ-BE-074 | GET /legal/forms | - | ❌ | Не реализовано | MVP |
| REQ-BE-075 | GET /legal/calculators/patent-price | - | ⚠️ | Частично (patent/regions) | MVP |
| REQ-BE-076 | POST /legal/calculators/stay | - | ❌ | Не реализовано | MVP |
| REQ-BE-077 | GET /legal/regions | IMP-BE-006 | ✅ | Путь: utilities/patent/regions | MVP |
| REQ-BE-078 | GET /legal/faq | - | ❌ | Не реализовано | MVP |
| REQ-BE-079 | GET /legal/updates | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-BE-080 | GET /ban-check/{params} | IMP-BE-005 | ⚠️ | Заглушка (всегда NO_BAN) | MVP |
| REQ-BE-081 | GET /patent/regions | IMP-BE-006 | ✅ | - | MVP |
| REQ-BE-082 | GET /health | IMP-BE-007 | ✅ | - | MVP |

### Backend Modules

| REQ ID | Требование | IMP ID | Статус | Gap | Приоритет |
|--------|------------|--------|--------|-----|-----------|
| REQ-MOD-001 | Device-based авторизация | AuthModule | ✅ | - | MVP |
| REQ-MOD-002 | JWT токены (24h/30d) | JwtStrategy | ✅ | - | MVP |
| REQ-MOD-003 | Rate limiting (5 req/min auth) | ThrottlerModule | ✅ | - | MVP |
| REQ-MOD-004 | Request Signing (HMAC-SHA256) | - | ❌ | Не реализовано | MVP |
| REQ-MOD-005 | Phone Auth (SMS OTP) | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-006 | Telegram Auth | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-007 | VK ID Auth | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-008 | CRUD профиля | UsersModule | ✅ | - | MVP |
| REQ-MOD-009 | Хранение настроек | UsersService | ✅ | jsonb settings | MVP |
| REQ-MOD-010 | Расчёт дедлайнов | - | ❌ | Не реализовано | MVP |
| REQ-MOD-011 | E2E шифрование | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-012 | Upload/Download backup | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-013 | История версий backup | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-014 | Тарифные планы | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-015 | СБП интеграция | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-016 | ЮKassa интеграция | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-017 | Webhook обработка | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-018 | Промокоды | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-019 | Push (FCM/APNs) | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-020 | Telegram бот | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-021 | Smart timing | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-022 | Escalation | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-MOD-023 | 3-уровневый PII фильтр | SentryModule | ⚠️ | Только Sentry PII filter | Post-MVP v1.2 |
| REQ-MOD-024 | RAG (pgvector) | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-025 | AI Kill Switch | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-026 | OpenAI GPT-4 | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-MOD-027 | Справочник законов | - | ❌ | legal-core готов, не интегрирован | MVP |
| REQ-MOD-028 | Мониторинг изменений | - | ❌ | legal-core готов, не интегрирован | MVP |
| REQ-MOD-029 | Health check | HealthModule | ✅ | - | MVP |

### Database

| REQ ID | Требование | Статус | Gap | Приоритет |
|--------|------------|--------|-----|-----------|
| REQ-DB-001 | users table | ✅ | - | MVP |
| REQ-DB-002 | audit_log | ❌ | Не реализовано | MVP |
| REQ-DB-003 | backups | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-DB-004 | payments | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-DB-005 | legal_documents (pgvector) | ❌ | Не реализовано | Post-MVP v1.2 |

### Frontend Screens

| REQ ID | Требование | IMP ID | Статус | Gap | Приоритет |
|--------|------------|--------|--------|-----|-----------|
| REQ-FE-001 | Home (/) | IMP-FE-110 | ✅ | HomeScreen в prototype | MVP |
| REQ-FE-002 | Login (/login) | IMP-FE-010-013 | ✅ | welcome + auth flow | MVP |
| REQ-FE-003 | Onboarding (/onboarding) | IMP-FE-120-122 | ✅ | ProfilingScreen, AuditScreen, RoadmapScreen | MVP |
| REQ-FE-004 | Recovery (/recovery) | - | ❌ | Не реализовано | MVP |
| REQ-FE-005 | Documents (/documents) | IMP-FE-024 | ✅ | DocumentsScreen | MVP |
| REQ-FE-006 | Document Detail (/documents/[id]) | IMP-FE-025 | ✅ | - | MVP |
| REQ-FE-007 | Add Document (/documents/add) | IMP-FE-300 | ✅ | DocumentWizard | MVP |
| REQ-FE-008 | Assistant (/assistant) | IMP-FE-113 | ✅ | AssistantScreen (UI only) | Post-MVP v1.2 |
| REQ-FE-009 | Reference (/reference) | IMP-FE-112 | ⚠️ | Частично в ServicesScreen | MVP |
| REQ-FE-010 | Profile (/profile) | IMP-FE-020 | ✅ | ProfileForm | MVP |
| REQ-FE-011 | Offline Page (/offline) | IMP-FE-031 | ✅ | - | MVP |

### Frontend Components

| REQ ID | Требование | IMP ID | Статус | Gap | Приоритет |
|--------|------------|--------|--------|-----|-----------|
| REQ-COMP-001 | Button | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-002 | Card | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-003 | Input | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-004 | Modal | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-005 | Sheet | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-006 | Toast | - | ⚠️ | Tailwind, нет UI Kit | MVP |
| REQ-COMP-010 | DocumentForm | IMP-FE-303-310 | ✅ | Множество форм | MVP |
| REQ-COMP-011 | ProfileForm | IMP-FE-340 | ✅ | - | MVP |
| REQ-COMP-012 | OnboardingForm | IMP-FE-120 | ✅ | ProfilingScreen | MVP |
| REQ-COMP-020 | DocumentCard | IMP-FE-301 | ✅ | - | MVP |
| REQ-COMP-021 | DocumentList | IMP-FE-302 | ✅ | - | MVP |
| REQ-COMP-022 | DocumentScanner (OCR) | IMP-FE-341 | ⚠️ | PassportScanner (mock) | Post-MVP v1.1 |
| REQ-COMP-023 | DeadlineBadge | - | ⚠️ | В HomeScreen inline | MVP |
| REQ-COMP-030 | ChatMessage | IMP-FE-113 | ✅ | В AssistantScreen | Post-MVP v1.2 |
| REQ-COMP-031 | ChatInput | IMP-FE-113 | ✅ | В AssistantScreen | Post-MVP v1.2 |
| REQ-COMP-032 | SourceCard | - | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-COMP-040 | TabBar | IMP-FE-101 | ✅ | DashboardLayout | MVP |
| REQ-COMP-041 | Header | IMP-FE-101 | ✅ | DashboardLayout | MVP |
| REQ-COMP-042 | BackButton | - | ⚠️ | Inline в компонентах | MVP |
| REQ-COMP-050 | ErrorBoundary | IMP-FE-201 | ✅ | С Sentry | MVP |
| REQ-COMP-051 | Loading | - | ⚠️ | Inline spinners | MVP |
| REQ-COMP-052 | OfflineBanner | IMP-FE-501 | ✅ | useOnlineStatus | MVP |
| REQ-COMP-053 | SmartError | - | ❌ | Не реализовано | MVP |

### Frontend Features

| REQ ID | Требование | IMP ID | Статус | Gap | Приоритет |
|--------|------------|--------|--------|-----|-----------|
| REQ-FEAT-001 | Local Storage (IndexedDB) | IMP-FE-950 | ✅ | Dexie.js | MVP |
| REQ-FEAT-002 | Encryption (AES-256-GCM) | IMP-FE-952 | ✅ | lib/crypto | MVP |
| REQ-FEAT-003 | Offline Queue | - | ❌ | Не реализовано | MVP |
| REQ-FEAT-004 | Background Sync | - | ❌ | Не реализовано | MVP |
| REQ-FEAT-005 | Service Worker (PWA) | IMP-FE-502 | ✅ | useServiceWorker | MVP |
| REQ-FEAT-006 | Deep Links | - | ❌ | Не реализовано | MVP |
| REQ-FEAT-007 | Back Button (Android) | - | ❌ | Не реализовано | MVP |
| REQ-FEAT-008 | Localization (5 языков) | IMP-FE-700-704 | ⚠️ | ru полный, остальные частично | MVP |
| REQ-FEAT-009 | Zustand Stores | IMP-FE-400-403 | ✅ | 4 stores | MVP |
| REQ-FEAT-010 | React Query | IMP-FE-600 | ✅ | API Client | MVP |
| REQ-FEAT-011 | Capacitor | - | ⚠️ | Конфиг есть, плагины не интегрированы | MVP |
| REQ-FEAT-012 | OCR (Tesseract.js) | IMP-FE-341 | ⚠️ | Mock implementation | Post-MVP v1.1 |
| REQ-FEAT-013 | Biometrics | - | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-FEAT-014 | Push Notifications (Local) | IMP-FE-960 | ✅ | lib/notifications | MVP |
| REQ-FEAT-015 | Push Notifications (FCM) | - | ❌ | Не реализовано | Post-MVP v1.1 |

### Security Requirements

| REQ ID | Требование | Статус | Gap | Приоритет |
|--------|------------|--------|-----|-----------|
| REQ-SEC-001 | Local-First | ✅ | IndexedDB + profileStore | MVP |
| REQ-SEC-002 | No PII on Server | ✅ | User entity без ПДн | MVP |
| REQ-SEC-003 | AES-256-GCM | ✅ | lib/crypto/encryption.ts | MVP |
| REQ-SEC-004 | E2E Backup | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-SEC-005 | Rate Limiting | ✅ | ThrottlerModule | MVP |
| REQ-SEC-006 | Request Signing | ❌ | Не реализовано | MVP |
| REQ-SEC-007 | JWT Auth | ✅ | JwtStrategy | MVP |
| REQ-SEC-008 | PII Filter AI | ⚠️ | Только Sentry filter | Post-MVP v1.2 |
| REQ-SEC-009 | AI Kill Switch | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-SEC-010 | Webhook Signature | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-SEC-011 | 152-FZ Compliance | ✅ | Архитектура соответствует | MVP |
| REQ-SEC-012 | OTP Security | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-SEC-013 | Biometric Access | ❌ | Не реализовано | Post-MVP v1.1 |

### Infrastructure Requirements

| REQ ID | Требование | Статус | Gap | Приоритет |
|--------|------------|--------|-----|-----------|
| REQ-INFRA-001 | PostgreSQL 16 | ✅ | Настроен | MVP |
| REQ-INFRA-002 | Redis 7 | ⚠️ | Упоминается, не используется | MVP |
| REQ-INFRA-003 | RabbitMQ 3 | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-INFRA-004 | S3/MinIO | ❌ | Не реализовано | Post-MVP v1.1 |
| REQ-INFRA-005 | Docker Compose | ⚠️ | Базовый, неполный | MVP |
| REQ-INFRA-006 | GitHub Actions | ❌ | Не реализовано | MVP |
| REQ-INFRA-007 | Cloudflare | ❌ | Не настроено | MVP |
| REQ-INFRA-008 | Sentry | ✅ | SentryModule | MVP |
| REQ-INFRA-009 | Grafana + Loki | ❌ | Не реализовано | Post-MVP |
| REQ-INFRA-010 | Selectel Cloud | ❌ | Не настроено | MVP |
| REQ-INFRA-011 | pgvector | ❌ | Не реализовано | Post-MVP v1.2 |

### Business Logic Requirements

| REQ ID | Требование | Статус | Gap | Приоритет |
|--------|------------|--------|-----|-----------|
| REQ-BIZ-001 | Free Plan | ⚠️ | subscriptionType в User, логика не реализована | MVP |
| REQ-BIZ-002 | Plus Plan | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BIZ-003 | Pro Plan | ❌ | Не реализовано | Post-MVP v1.2 |
| REQ-BIZ-010 | Registration Deadline | ⚠️ | Frontend есть, backend нет | MVP |
| REQ-BIZ-011 | Patent Payment reminder | ⚠️ | Frontend есть, backend нет | MVP |
| REQ-BIZ-012 | 90/180 Rule | ✅ | StayCalculator frontend | MVP |
| REQ-BIZ-020 | Phase 1: Trust | ✅ | Welcome screen | MVP |
| REQ-BIZ-021 | Phase 2: Value | ✅ | ProfilingScreen | MVP |
| REQ-BIZ-022 | Phase 3: Complete | ✅ | AuditScreen + RoadmapScreen | MVP |

---

## План доработок

### MVP Critical (блокеры релиза)

| # | Задача | Тип | Сложность | Зависит от | Файлы |
|---|--------|-----|-----------|------------|-------|
| 1 | Audit Log Table | BE | S | - | migration, audit.entity.ts |
| 2 | Recovery Code Verification | BE | M | - | auth/recovery/* |
| 3 | Onboarding Complete Endpoint | BE | S | - | users/users.controller.ts |
| 4 | Calculate Deadlines Endpoint | BE | M | - | users/calculate.service.ts |
| 5 | Delete Account Endpoint | BE | S | - | users/users.controller.ts |
| 6 | Legal Core Integration | BE | L | legal-core ready | legal/legal.module.ts |
| 7 | Ban Check Real Integration | BE | M | МВД API access | utilities/ban-check.service.ts |
| 8 | Request Signing (HMAC) | BE | M | - | common/guards/signing.guard.ts |
| 9 | Offline Queue | FE | M | - | lib/sync/offlineQueue.ts |
| 10 | Background Sync | FE | M | 9 | lib/sync/backgroundSync.ts |
| 11 | GitHub Actions CI/CD | INFRA | M | - | .github/workflows/* |
| 12 | Docker Compose Production | INFRA | M | - | docker-compose.prod.yml |

### MVP High Priority (до релиза)

| # | Задача | Тип | Сложность | Зависит от | Файлы |
|---|--------|-----|-----------|------------|-------|
| 13 | UI Component Library | FE | L | - | components/ui/* |
| 14 | SmartError Component | FE | S | 13 | components/SmartError.tsx |
| 15 | DeadlineBadge Component | FE | S | 13 | components/DeadlineBadge.tsx |
| 16 | Reference Page (Full) | FE | M | 6 | app/(main)/reference/* |
| 17 | Recovery Page | FE | M | 2 | app/(auth)/recovery/* |
| 18 | Deep Links Handler | FE | M | - | lib/deepLinks.ts |
| 19 | Back Button Handler | FE | S | - | lib/backButton.ts |
| 20 | Localization Complete | FE | L | - | locales/*.json |
| 21 | Redis Integration | BE | S | - | cache.module.ts |
| 22 | Capacitor Plugins Full | FE | M | - | capacitor.config.ts |

### MVP Nice-to-Have (желательно до релиза)

| # | Задача | Тип | Сложность | Зависит от | Файлы |
|---|--------|-----|-----------|------------|-------|
| 23 | Unit Tests Backend | TEST | L | - | **/*.spec.ts |
| 24 | E2E Tests Backend | TEST | M | 23 | test/e2e/* |
| 25 | Unit Tests Frontend | TEST | L | - | **/*.test.tsx |
| 26 | Cloudflare Setup | INFRA | S | - | infrastructure docs |
| 27 | Selectel Deployment | INFRA | M | 11, 12 | terraform/* |

### Post-MVP v1.1 (2 недели после MVP)

| # | Задача | Тип | Сложность | Зависит от | Файлы |
|---|--------|-----|-----------|------------|-------|
| 28 | Phone Auth (SMS OTP) | BE | L | - | auth/phone/* |
| 29 | Push Notifications Backend | BE | L | RabbitMQ | notifications/* |
| 30 | Cloud Safe (E2E Backup) | BE | XL | S3/MinIO | backup/* |
| 31 | Real OCR (Tesseract.js) | FE | M | - | lib/ocr/* |
| 32 | Biometric Auth | FE | M | Capacitor | lib/biometrics.ts |
| 33 | Telegram Bot | BE | L | - | telegram-bot/* |
| 34 | Legal Updates Monitoring | BE | M | 6 | legal/updates/* |

### Post-MVP v1.2 (1 месяц после MVP)

| # | Задача | Тип | Сложность | Зависит от | Файлы |
|---|--------|-----|-----------|------------|-------|
| 35 | AI Assistant Backend | BE | XL | pgvector | ai/* |
| 36 | RAG Integration | BE | XL | 35 | ai/rag/* |
| 37 | Billing Module (СБП + ЮKassa) | BE | XL | - | billing/* |
| 38 | Telegram Auth | BE | M | 33 | auth/telegram/* |
| 39 | VK ID Auth | BE | M | - | auth/vk/* |
| 40 | AI Kill Switch | BE | M | 35 | ai/killswitch/* |
| 41 | Exam Trainer | FE | L | - | features/exam/* |

---

## GitHub Issues

### Issue 1: [BE] Audit Log Table

```
Title: [BE] Implement Audit Log Table and Service
Labels: backend, mvp-critical, database
Milestone: MVP v1.0

## Description
Создать таблицу audit_log для логирования всех действий пользователей согласно спецификации.

## Requirements
- REQ-DB-002: Аудит лог (партиционированный)
- AC-1.6: Логирование всех запросов

## Tasks
- [ ] Создать миграцию для таблицы audit_log
- [ ] Создать AuditLog entity
- [ ] Создать AuditService для записи логов
- [ ] Интегрировать с LoggingInterceptor
- [ ] Добавить партиционирование по месяцам

## Files
- apps/api-core/src/modules/audit/audit.entity.ts
- apps/api-core/src/modules/audit/audit.service.ts
- apps/api-core/src/modules/audit/audit.module.ts
- migrations/*_create_audit_log.ts

## Acceptance Criteria
- [ ] Все HTTP запросы логируются
- [ ] Содержит: userId, action, resource, timestamp, ip, userAgent
- [ ] Партиционирование работает
```

---

### Issue 2: [BE] Recovery Code Verification

```
Title: [BE] Implement Recovery Code Verification Endpoint
Labels: backend, mvp-critical, auth
Milestone: MVP v1.0

## Description
Реализовать POST /api/v1/auth/recovery/verify для восстановления доступа по коду.

## Requirements
- REQ-BE-002: POST /auth/recovery/verify

## Tasks
- [ ] Создать RecoveryController
- [ ] Создать RecoveryService
- [ ] Создать VerifyRecoveryDto
- [ ] Добавить rate limiting (3 попытки)
- [ ] Генерация нового recovery code после успешной верификации

## Files
- apps/api-core/src/modules/auth/recovery/recovery.controller.ts
- apps/api-core/src/modules/auth/recovery/recovery.service.ts
- apps/api-core/src/modules/auth/recovery/dto/verify-recovery.dto.ts

## Acceptance Criteria
- [ ] Endpoint доступен POST /api/v1/auth/recovery/verify
- [ ] Валидирует recovery code
- [ ] Rate limiting 3 попытки / 15 минут
- [ ] Возвращает новые токены при успехе
```

---

### Issue 3: [BE] User Management Endpoints

```
Title: [BE] Complete User Management Endpoints
Labels: backend, mvp-critical, users
Milestone: MVP v1.0

## Description
Добавить недостающие endpoints для управления пользователем.

## Requirements
- REQ-BE-012: POST /users/onboarding/complete
- REQ-BE-013: POST /users/calculate
- REQ-BE-014: DELETE /users/account

## Tasks
- [ ] Добавить completeOnboarding() в UsersController
- [ ] Добавить calculateDeadlines() endpoint
- [ ] Добавить deleteAccount() endpoint
- [ ] Создать DeadlineCalculatorService
- [ ] Создать соответствующие DTOs

## Files
- apps/api-core/src/modules/users/users.controller.ts
- apps/api-core/src/modules/users/users.service.ts
- apps/api-core/src/modules/users/deadline-calculator.service.ts
- apps/api-core/src/modules/users/dto/calculate-deadline.dto.ts

## Acceptance Criteria
- [ ] POST /users/onboarding/complete работает
- [ ] POST /users/calculate возвращает дедлайны
- [ ] DELETE /users/account удаляет аккаунт и все данные
```

---

### Issue 4: [BE] Legal Core Integration

```
Title: [BE] Integrate Legal Core Module into API
Labels: backend, mvp-critical, legal
Milestone: MVP v1.0

## Description
Интегрировать готовый legal-core модуль в api-core для предоставления справочника законов.

## Requirements
- REQ-BE-070-078: Legal endpoints
- REQ-MOD-027: Справочник законов
- REQ-MOD-028: Мониторинг изменений

## Tasks
- [ ] Создать LegalModule в api-core
- [ ] Импортировать функционал из apps/legal-core
- [ ] Создать LegalController с endpoints:
  - GET /legal/categories
  - GET /legal/categories/{id}/items
  - GET /legal/laws
  - GET /legal/laws/{id}
  - GET /legal/forms
  - GET /legal/calculators/patent-price
  - POST /legal/calculators/stay
  - GET /legal/faq
- [ ] Добавить Swagger документацию

## Files
- apps/api-core/src/modules/legal/legal.module.ts
- apps/api-core/src/modules/legal/legal.controller.ts
- apps/api-core/src/modules/legal/legal.service.ts
- apps/api-core/src/modules/legal/dto/*

## Acceptance Criteria
- [ ] Все 9 MVP endpoints работают
- [ ] Данные из legal-core доступны через API
- [ ] Swagger документация полная
```

---

### Issue 5: [BE] Ban Check Real Integration

```
Title: [BE] Implement Real MVD Ban Check Integration
Labels: backend, mvp-critical, utilities
Milestone: MVP v1.0

## Description
Заменить заглушку Ban Check на реальную интеграцию с API МВД.

## Requirements
- REQ-BE-080: GET /ban-check/{params}

## Current State
- BanCheckService.checkBan() всегда возвращает NO_BAN (заглушка)

## Tasks
- [ ] Исследовать API МВД: https://services.fms.gov.ru/info-service.htm?sid=2000
- [ ] Реализовать HTTP client для МВД
- [ ] Добавить обработку ошибок и timeout
- [ ] Добавить retry logic
- [ ] Добавить caching (Redis) для частых запросов
- [ ] Добавить rate limiting на уровне сервиса

## Files
- apps/api-core/src/modules/utilities/ban-check/ban-check.service.ts
- apps/api-core/src/modules/utilities/ban-check/mvd-client.ts

## Acceptance Criteria
- [ ] Реальные запросы к API МВД
- [ ] Timeout 10 секунд
- [ ] Retry 3 раза
- [ ] Caching 1 час
- [ ] Graceful degradation при недоступности МВД
```

---

### Issue 6: [BE] Request Signing (HMAC-SHA256)

```
Title: [BE] Implement Request Signing with HMAC-SHA256
Labels: backend, mvp-critical, security
Milestone: MVP v1.0

## Description
Реализовать подпись всех запросов HMAC-SHA256 согласно спецификации.

## Requirements
- REQ-MOD-004: Request Signing (HMAC-SHA256)
- REQ-SEC-006: Request Signing

## Tasks
- [ ] Создать SigningGuard
- [ ] Генерация ключа подписи при device auth
- [ ] Хранение ключа в User entity
- [ ] Валидация подписи в header X-Signature
- [ ] Документация формата подписи

## Signature Format
```
X-Signature: HMAC-SHA256(timestamp + method + path + body, secretKey)
X-Timestamp: <unix timestamp>
```

## Files
- apps/api-core/src/common/guards/signing.guard.ts
- apps/api-core/src/modules/auth/signing.service.ts

## Acceptance Criteria
- [ ] Все protected endpoints требуют подпись
- [ ] Timestamp не старше 5 минут
- [ ] Подпись валидируется корректно
```

---

### Issue 7: [FE] Offline Queue & Background Sync

```
Title: [FE] Implement Offline Queue and Background Sync
Labels: frontend, mvp-critical, offline
Milestone: MVP v1.0

## Description
Реализовать очередь операций для offline режима и фоновую синхронизацию.

## Requirements
- REQ-FEAT-003: Offline Queue
- REQ-FEAT-004: Background Sync
- ARCH-004: Offline-capable

## Tasks
- [ ] Создать OfflineQueue class
- [ ] Хранение операций в IndexedDB
- [ ] Background sync при восстановлении сети
- [ ] Conflict resolution strategy
- [ ] UI индикатор pending operations
- [ ] Интеграция с useOnlineStatus hook

## Files
- apps/frontend/src/lib/sync/offlineQueue.ts
- apps/frontend/src/lib/sync/backgroundSync.ts
- apps/frontend/src/lib/sync/conflictResolver.ts
- apps/frontend/src/hooks/useOfflineQueue.ts

## Acceptance Criteria
- [ ] Операции сохраняются при offline
- [ ] Автоматическая синхронизация при online
- [ ] UI показывает pending count
- [ ] Конфликты разрешаются корректно
```

---

### Issue 8: [INFRA] GitHub Actions CI/CD

```
Title: [INFRA] Setup GitHub Actions CI/CD Pipeline
Labels: infrastructure, mvp-critical, devops
Milestone: MVP v1.0

## Description
Настроить CI/CD pipeline для автоматического тестирования и деплоя.

## Requirements
- REQ-INFRA-006: GitHub Actions

## Tasks
- [ ] CI workflow: lint, type-check, test
- [ ] CD workflow: build, push to registry
- [ ] Separate workflows for api-core и frontend
- [ ] Environment secrets configuration
- [ ] Deploy to staging on PR merge
- [ ] Deploy to production on release

## Files
- .github/workflows/ci.yml
- .github/workflows/cd-staging.yml
- .github/workflows/cd-production.yml

## Acceptance Criteria
- [ ] CI запускается на каждый PR
- [ ] Все проверки проходят
- [ ] Автодеплой на staging
- [ ] Manual approval для production
```

---

### Issue 9: [INFRA] Docker Compose Production

```
Title: [INFRA] Complete Docker Compose for Production
Labels: infrastructure, mvp-critical, devops
Milestone: MVP v1.0

## Description
Доработать Docker Compose конфигурацию для production окружения.

## Requirements
- REQ-INFRA-005: Docker Compose

## Tasks
- [ ] docker-compose.prod.yml с production настройками
- [ ] Nginx reverse proxy конфигурация
- [ ] SSL/TLS termination
- [ ] Health checks для всех сервисов
- [ ] Volume management для persistence
- [ ] Resource limits

## Files
- docker-compose.prod.yml
- nginx/nginx.conf
- nginx/ssl/*

## Acceptance Criteria
- [ ] docker-compose up -f docker-compose.prod.yml работает
- [ ] SSL работает
- [ ] Health checks проходят
- [ ] Volumes persistent
```

---

### Issue 10: [FE] UI Component Library

```
Title: [FE] Create Reusable UI Component Library
Labels: frontend, mvp, ui
Milestone: MVP v1.0

## Description
Создать библиотеку переиспользуемых UI компонентов.

## Requirements
- REQ-COMP-001-006: Button, Card, Input, Modal, Sheet, Toast

## Tasks
- [ ] Button component (variants: primary, secondary, danger, ghost)
- [ ] Card component (with header, footer variants)
- [ ] Input component (text, password, date, select)
- [ ] Modal component (with overlay, close button)
- [ ] Sheet component (bottom slide-up)
- [ ] Toast component (success, error, warning, info)
- [ ] Storybook documentation

## Files
- apps/frontend/src/components/ui/Button.tsx
- apps/frontend/src/components/ui/Card.tsx
- apps/frontend/src/components/ui/Input.tsx
- apps/frontend/src/components/ui/Modal.tsx
- apps/frontend/src/components/ui/Sheet.tsx
- apps/frontend/src/components/ui/Toast.tsx
- apps/frontend/src/components/ui/index.ts

## Acceptance Criteria
- [ ] Все 6 компонентов созданы
- [ ] TypeScript типы
- [ ] Tailwind стили
- [ ] Accessible (ARIA)
```

---

### Issue 11: [FE] Localization Completion

```
Title: [FE] Complete Localization for All Languages
Labels: frontend, mvp, i18n
Milestone: MVP v1.0

## Description
Завершить переводы для всех 5 языков.

## Requirements
- REQ-FEAT-008: Localization (5 языков: RU, UZ, TJ, KY, EN)

## Current State
- ru.json: ~1670 ключей (complete)
- en.json: partial
- uz.json: partial
- tg.json: partial
- ky.json: partial

## Tasks
- [ ] Экспорт всех ключей из ru.json
- [ ] Профессиональный перевод на английский
- [ ] Профессиональный перевод на узбекский
- [ ] Профессиональный перевод на таджикский
- [ ] Профессиональный перевод на кыргызский
- [ ] Review native speakers

## Files
- apps/frontend/src/locales/en.json
- apps/frontend/src/locales/uz.json
- apps/frontend/src/locales/tg.json
- apps/frontend/src/locales/ky.json

## Acceptance Criteria
- [ ] 100% ключей переведено для всех языков
- [ ] Review от native speakers
- [ ] Нет missing translations warnings
```

---

### Issue 12: [FE] Recovery Page

```
Title: [FE] Implement Recovery Page
Labels: frontend, mvp, auth
Milestone: MVP v1.0

## Description
Создать страницу восстановления доступа.

## Requirements
- REQ-FE-004: Recovery (/recovery)

## Tasks
- [ ] Создать страницу /recovery
- [ ] Форма ввода recovery code
- [ ] Интеграция с POST /auth/recovery/verify
- [ ] Error handling
- [ ] Success flow -> redirect to home

## Files
- apps/frontend/src/app/(auth)/recovery/page.tsx
- apps/frontend/src/features/auth/components/RecoveryForm.tsx

## Acceptance Criteria
- [ ] Страница /recovery доступна
- [ ] Recovery code принимается
- [ ] Ошибки отображаются
- [ ] Успешное восстановление работает
```

---

## Рекомендации

### 1. Приоритеты разработки

Рекомендуемый порядок разработки для MVP:

**Неделя 1-2: Backend Critical**
1. Audit Log Table (#1)
2. User Management Endpoints (#3)
3. Legal Core Integration (#4)
4. Ban Check Real Integration (#5)

**Неделя 3: Security & Infrastructure**
5. Request Signing (#6)
6. GitHub Actions CI/CD (#8)
7. Docker Compose Production (#9)

**Неделя 4: Frontend Critical**
8. Offline Queue & Background Sync (#7)
9. UI Component Library (#10)
10. Recovery Page (#12)

**Неделя 5: Polish**
11. Localization Completion (#11)
12. Testing (23-25)

### 2. Архитектурные рекомендации

1. **Legal Core**: Использовать готовый apps/legal-core как библиотеку, не переписывать
2. **Ban Check**: Реализовать circuit breaker для МВД API
3. **Offline**: Использовать Workbox для Service Worker
4. **State**: Рассмотреть миграцию с Zustand на TanStack Query для server state

### 3. Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| МВД API недоступен | Высокая | Высокое | Graceful degradation, manual fallback |
| Переводы задерживаются | Средняя | Среднее | Приоритет ru + en, остальные в v1.0.1 |
| Capacitor баги | Средняя | Высокое | Тестирование на реальных устройствах рано |
| Performance issues | Низкая | Среднее | Lighthouse CI в pipeline |

### 4. Метрики готовности MVP

| Метрика | Target | Текущее |
|---------|--------|---------|
| Backend API Coverage | 100% MVP endpoints | 41% |
| Frontend Screens | 100% | 90% |
| Localization | 100% ru, 80% others | 100% ru, ~30% others |
| Test Coverage | >80% | 0% |
| Lighthouse Score | >90 | Unknown |
| Uptime SLA | 99.5% | N/A |

---

*Документ создан: 2026-01-27*
*Всего issues для MVP: 12 critical + 15 high priority = 27*
*Оценка времени до MVP: 5-6 недель*
