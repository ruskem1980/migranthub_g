# Требования из документации MigrantHub

> Версия: 1.0
> Дата: 2026-01-27
> Источники: TECHNICAL_SPECIFICATION.md, MVP_PRIORITIZATION.md, 00-ARCHITECTURE-OVERVIEW.md, 03-API.md, 04-FRONTEND.md, 06-BUSINESS-LOGIC.md

---

## Оглавление

1. [Backend Requirements](#backend-requirements)
   - [API Endpoints](#api-endpoints)
   - [Modules](#modules)
   - [Database](#database)
2. [Frontend Requirements](#frontend-requirements)
   - [Screens](#screens)
   - [Components](#components)
   - [Features](#features)
3. [MVP Scope](#mvp-scope)
4. [Post-MVP Features](#post-mvp-features)
5. [Типы документов](#типы-документов)
6. [Типы уведомлений](#типы-уведомлений)
7. [Архитектурные принципы](#архитектурные-принципы)
8. [Критерии приёмки](#критерии-приёмки-из-тз)
9. [Security Requirements](#security-requirements)
10. [Infrastructure Requirements](#infrastructure-requirements)
11. [Business Logic Requirements](#business-logic-requirements)
12. [Итоговая статистика](#итоговая-статистика-требований)

---

## Backend Requirements

### API Endpoints

#### Auth Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-001 | POST | /api/v1/auth/device/register | Регистрация устройства (Device Auth) | MVP | 03-API.md:126 |
| REQ-BE-002 | POST | /api/v1/auth/recovery/verify | Верификация кода восстановления | MVP | 03-API.md:159 |
| REQ-BE-003 | POST | /api/v1/auth/telegram | Авторизация через Telegram | Post-MVP (v1.2) | 03-API.md:184 |
| REQ-BE-004 | POST | /api/v1/auth/vk | Авторизация через VK ID | Post-MVP (v1.2) | 03-API.md:209 |
| REQ-BE-005 | POST | /api/v1/auth/refresh | Обновление токена | MVP | TECHNICAL_SPECIFICATION.md:147 |
| REQ-BE-006 | POST | /api/v1/auth/phone/send | Отправка OTP на телефон | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:393 |
| REQ-BE-007 | POST | /api/v1/auth/phone/verify | Верификация OTP | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:407 |

#### Users Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-010 | GET | /api/v1/users/profile | Получение профиля пользователя | MVP | 03-API.md:229 |
| REQ-BE-011 | PATCH | /api/v1/users/profile | Обновление профиля | MVP | 03-API.md:265 |
| REQ-BE-012 | POST | /api/v1/users/onboarding/complete | Завершение онбординга | MVP | 03-API.md:283 |
| REQ-BE-013 | POST | /api/v1/users/calculate | Расчёт дедлайнов | MVP | 03-API.md:318 |
| REQ-BE-014 | DELETE | /api/v1/users/account | Удаление аккаунта | MVP | 03-API.md:373 |

#### Billing Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-020 | GET | /api/v1/billing/products | Получение тарифных планов | Post-MVP (v1.2) | 03-API.md:404 |
| REQ-BE-021 | POST | /api/v1/billing/payments | Создание платежа | Post-MVP (v1.2) | 03-API.md:459 |
| REQ-BE-022 | POST | /api/v1/billing/promo/validate | Валидация промокода | Post-MVP (v1.2) | 03-API.md:499 |
| REQ-BE-023 | GET | /api/v1/billing/payments | История платежей | Post-MVP (v1.2) | 03-API.md:530 |
| REQ-BE-024 | POST | /api/v1/billing/subscription/cancel | Отмена подписки | Post-MVP (v1.2) | 03-API.md:566 |
| REQ-BE-025 | GET | /api/v1/billing/status | Статус биллинга | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:254 |

#### Backup Module (Cloud Safe)

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-030 | POST | /api/v1/backup/upload-url | Получение URL для загрузки | Post-MVP (v1.1) | 03-API.md:582 |
| REQ-BE-031 | POST | /api/v1/backup/{id}/confirm | Подтверждение загрузки | Post-MVP (v1.1) | 03-API.md:609 |
| REQ-BE-032 | GET | /api/v1/backup/list | Список бэкапов | Post-MVP (v1.1) | 03-API.md:624 |
| REQ-BE-033 | GET | /api/v1/backup/{id}/download-url | URL для скачивания | Post-MVP (v1.1) | 03-API.md:659 |
| REQ-BE-034 | DELETE | /api/v1/backup/{id} | Удаление бэкапа | Post-MVP (v1.1) | 03-API.md:680 |

#### AI Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-040 | POST | /api/v1/ai/chat | Отправка сообщения AI | Post-MVP (v1.2) | 03-API.md:694 |
| REQ-BE-041 | POST | /api/v1/ai/chat/stream | Стриминг ответа AI | Post-MVP (v1.2) | 03-API.md:737 |
| REQ-BE-042 | POST | /api/v1/ai/feedback | Обратная связь по ответу | Post-MVP (v1.2) | 03-API.md:759 |
| REQ-BE-043 | GET | /api/v1/ai/status | Статус AI сервиса | Post-MVP (v1.2) | 03-API.md:774 |
| REQ-BE-044 | GET | /api/v1/ai/suggestions | Предложенные вопросы | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:1003 |

#### Notifications Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-050 | POST | /api/v1/notifications/push/register | Регистрация push токена | Post-MVP (v1.1) | 03-API.md:800 |
| REQ-BE-051 | DELETE | /api/v1/notifications/push/unregister | Удаление push токена | Post-MVP (v1.1) | 03-API.md:814 |
| REQ-BE-052 | GET | /api/v1/notifications/settings | Настройки уведомлений | Post-MVP (v1.1) | 03-API.md:821 |
| REQ-BE-053 | PATCH | /api/v1/notifications/settings | Обновление настроек | Post-MVP (v1.1) | 03-API.md:857 |
| REQ-BE-054 | GET | /api/v1/notifications | Список уведомлений | Post-MVP (v1.1) | 03-API.md:879 |
| REQ-BE-055 | POST | /api/v1/notifications/read | Отметить как прочитанное | Post-MVP (v1.1) | 03-API.md:914 |
| REQ-BE-056 | POST | /api/v1/notifications/{id}/snooze | Отложить уведомление | Post-MVP (v1.1) | 03-API.md:926 |
| REQ-BE-057 | GET | /api/v1/notifications/badge | Счётчик непрочитанных | Post-MVP (v1.1) | 03-API.md:939 |
| REQ-BE-058 | GET | /api/v1/notifications/telegram/link | Ссылка на Telegram бот | Post-MVP (v1.1) | 03-API.md:964 |
| REQ-BE-059 | DELETE | /api/v1/notifications/telegram/disconnect | Отвязка Telegram | Post-MVP (v1.1) | 03-API.md:979 |
| REQ-BE-060 | GET | /api/v1/notifications/vk/link | Ссылка на VK Mini App | Post-MVP (v1.1) | 03-API.md:989 |

#### Legal Core Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-070 | GET | /api/v1/legal/categories | Категории справочника | MVP | 03-API.md:1013 |
| REQ-BE-071 | GET | /api/v1/legal/categories/{id}/items | Элементы категории | MVP | 03-API.md:1054 |
| REQ-BE-072 | GET | /api/v1/legal/laws | Поиск законов | MVP | 03-API.md:1080 |
| REQ-BE-073 | GET | /api/v1/legal/laws/{id} | Детали закона | MVP | 03-API.md:1105 |
| REQ-BE-074 | GET | /api/v1/legal/forms | Формы документов | MVP | 03-API.md:1139 |
| REQ-BE-075 | GET | /api/v1/legal/calculators/patent-price | Калькулятор стоимости патента | MVP | 03-API.md:1176 |
| REQ-BE-076 | POST | /api/v1/legal/calculators/stay | Калькулятор 90/180 | MVP | 03-API.md:1206 |
| REQ-BE-077 | GET | /api/v1/legal/regions | Список регионов | MVP | 03-API.md:1239 |
| REQ-BE-078 | GET | /api/v1/legal/faq | FAQ | MVP | 03-API.md:1269 |
| REQ-BE-079 | GET | /api/v1/legal/updates | Обновления законодательства | Post-MVP (v1.1) | 03-API.md:1295 |

#### Utilities Module

| ID | Метод | Путь | Описание | Приоритет | Источник |
|----|-------|------|----------|-----------|----------|
| REQ-BE-080 | GET | /api/v1/ban-check/{params} | Проверка запрета на въезд (proxy МВД) | MVP | MVP_PRIORITIZATION.md:265 |
| REQ-BE-081 | GET | /api/v1/patent/regions | Данные по регионам патента | MVP | MVP_PRIORITIZATION.md:266 |
| REQ-BE-082 | GET | /api/v1/health | Health check | MVP | MVP_PRIORITIZATION.md:268 |

---

### Modules

| ID | Модуль | Функция | Приоритет | Источник |
|----|--------|---------|-----------|----------|
| REQ-MOD-001 | Auth | Device-based авторизация (UUID устройства) | MVP | MVP_PRIORITIZATION.md:71 |
| REQ-MOD-002 | Auth | JWT токены (access 24h, refresh 30d) | MVP | TECHNICAL_SPECIFICATION.md:493 |
| REQ-MOD-003 | Auth | Rate limiting (5 req/min для auth) | MVP | TECHNICAL_SPECIFICATION.md:349 |
| REQ-MOD-004 | Auth | Request Signing (HMAC-SHA256) | MVP | TECHNICAL_SPECIFICATION.md:357 |
| REQ-MOD-005 | Auth | Phone Auth (SMS OTP) | Post-MVP (v1.1) | MVP_PRIORITIZATION.md:158 |
| REQ-MOD-006 | Auth | Telegram Auth | Post-MVP (v1.2) | MVP_PRIORITIZATION.md:171 |
| REQ-MOD-007 | Auth | VK ID Auth | Post-MVP (v1.2) | MVP_PRIORITIZATION.md:171 |
| REQ-MOD-008 | Users | CRUD профиля (анонимные данные) | MVP | TECHNICAL_SPECIFICATION.md:150 |
| REQ-MOD-009 | Users | Хранение настроек | MVP | TECHNICAL_SPECIFICATION.md:171 |
| REQ-MOD-010 | Users | Расчёт дедлайнов | MVP | 03-API.md:318 |
| REQ-MOD-011 | Backup | E2E шифрование (AES-256-GCM) | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:184 |
| REQ-MOD-012 | Backup | Upload/Download зашифрованных данных | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:187 |
| REQ-MOD-013 | Backup | История версий | Post-MVP (v1.1) | 03-API.md:639 |
| REQ-MOD-014 | Billing | Тарифные планы (free/plus/pro) | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:224 |
| REQ-MOD-015 | Billing | СБП интеграция | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:1079 |
| REQ-MOD-016 | Billing | ЮKassa интеграция | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:1139 |
| REQ-MOD-017 | Billing | Webhook обработка | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:1122 |
| REQ-MOD-018 | Billing | Промокоды | Post-MVP (v1.2) | 03-API.md:499 |
| REQ-MOD-019 | Notifications | Push (FCM/APNs) | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:1285 |
| REQ-MOD-020 | Notifications | Telegram бот | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:1324 |
| REQ-MOD-021 | Notifications | Smart timing (учёт часового пояса) | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:1259 |
| REQ-MOD-022 | Notifications | Escalation для критичных | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:1273 |
| REQ-MOD-023 | AI | 3-уровневый PII фильтр | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:770 |
| REQ-MOD-024 | AI | RAG (pgvector) | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:857 |
| REQ-MOD-025 | AI | Kill Switch | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:919 |
| REQ-MOD-026 | AI | OpenAI GPT-4 интеграция | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:764 |
| REQ-MOD-027 | Legal | Справочник законов | MVP (legal-core готов) | TECHNICAL_SPECIFICATION.md:54 |
| REQ-MOD-028 | Legal | Мониторинг изменений | MVP (legal-core готов) | TECHNICAL_SPECIFICATION.md:56 |
| REQ-MOD-029 | Health | Health check endpoint | MVP | MVP_PRIORITIZATION.md:268 |

---

### Database

| ID | Таблица | Описание | Приоритет | Источник |
|----|---------|----------|-----------|----------|
| REQ-DB-001 | users | Пользователи (без ПДн: device_id, citizenship_code, region_code, settings) | MVP | TECHNICAL_SPECIFICATION.md:275 |
| REQ-DB-002 | audit_log | Аудит лог (партиционированный) | MVP | TECHNICAL_SPECIFICATION.md:324 |
| REQ-DB-003 | backups | Зашифрованные бэкапы | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:292 |
| REQ-DB-004 | payments | Платежи | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:306 |
| REQ-DB-005 | legal_documents | Документы для RAG (с pgvector) | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:861 |

---

## Frontend Requirements

### Screens

| ID | Экран | Функциональность | Приоритет | Источник |
|----|-------|------------------|-----------|----------|
| REQ-FE-001 | Home (/) | Главная страница с чеклистом и дедлайнами | MVP | 04-FRONTEND.md:67 |
| REQ-FE-002 | Login (/login) | Страница авторизации | MVP | 04-FRONTEND.md:61 |
| REQ-FE-003 | Onboarding (/onboarding) | Онбординг нового пользователя | MVP | 04-FRONTEND.md:62 |
| REQ-FE-004 | Recovery (/recovery) | Восстановление доступа | MVP | 04-FRONTEND.md:63 |
| REQ-FE-005 | Documents (/documents) | Список документов | MVP | 04-FRONTEND.md:68 |
| REQ-FE-006 | Document Detail (/documents/[id]) | Детали документа | MVP | 04-FRONTEND.md:69 |
| REQ-FE-007 | Add Document (/documents/add) | Добавление документа | MVP | 04-FRONTEND.md:71 |
| REQ-FE-008 | Assistant (/assistant) | AI помощник | Post-MVP (v1.2) | 04-FRONTEND.md:72 |
| REQ-FE-009 | Reference (/reference) | Справочник | MVP | 04-FRONTEND.md:73 |
| REQ-FE-010 | Profile (/profile) | Профиль пользователя | MVP | 04-FRONTEND.md:74 |
| REQ-FE-011 | Offline Page (/offline) | Страница offline режима | MVP | 04-FRONTEND.md:1155 |

### Components

#### UI Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-001 | Button | Базовая кнопка | MVP | 04-FRONTEND.md:80 |
| REQ-COMP-002 | Card | Карточка | MVP | 04-FRONTEND.md:81 |
| REQ-COMP-003 | Input | Поле ввода | MVP | 04-FRONTEND.md:82 |
| REQ-COMP-004 | Modal | Модальное окно | MVP | 04-FRONTEND.md:83 |
| REQ-COMP-005 | Sheet | Нижний слайдер | MVP | 04-FRONTEND.md:84 |
| REQ-COMP-006 | Toast | Уведомление | MVP | 04-FRONTEND.md:85 |

#### Form Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-010 | DocumentForm | Форма документа | MVP | 04-FRONTEND.md:87 |
| REQ-COMP-011 | ProfileForm | Форма профиля | MVP | 04-FRONTEND.md:88 |
| REQ-COMP-012 | OnboardingForm | Форма онбординга | MVP | 04-FRONTEND.md:89 |

#### Document Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-020 | DocumentCard | Карточка документа | MVP | 04-FRONTEND.md:91 |
| REQ-COMP-021 | DocumentList | Список документов | MVP | 04-FRONTEND.md:92 |
| REQ-COMP-022 | DocumentScanner | Сканер документов (OCR) | Post-MVP (v1.1) | 04-FRONTEND.md:93 |
| REQ-COMP-023 | DeadlineBadge | Бейдж дедлайна | MVP | 04-FRONTEND.md:94 |

#### Assistant Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-030 | ChatMessage | Сообщение чата | Post-MVP (v1.2) | 04-FRONTEND.md:96 |
| REQ-COMP-031 | ChatInput | Ввод сообщения | Post-MVP (v1.2) | 04-FRONTEND.md:97 |
| REQ-COMP-032 | SourceCard | Карточка источника | Post-MVP (v1.2) | 04-FRONTEND.md:98 |

#### Navigation Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-040 | TabBar | Нижняя навигация (5 вкладок) | MVP | 04-FRONTEND.md:100 |
| REQ-COMP-041 | Header | Верхний хедер | MVP | 04-FRONTEND.md:101 |
| REQ-COMP-042 | BackButton | Кнопка назад | MVP | 04-FRONTEND.md:102 |

#### Shared Components

| ID | Компонент | Описание | Приоритет | Источник |
|----|-----------|----------|-----------|----------|
| REQ-COMP-050 | ErrorBoundary | Обработка ошибок | MVP | 04-FRONTEND.md:104 |
| REQ-COMP-051 | Loading | Индикатор загрузки | MVP | 04-FRONTEND.md:105 |
| REQ-COMP-052 | OfflineBanner | Баннер offline режима | MVP | 04-FRONTEND.md:106 |
| REQ-COMP-053 | SmartError | Умная ошибка с guidance | MVP | 04-FRONTEND.md:107 |

### Features

| ID | Функция | Описание | Приоритет | Источник |
|----|---------|----------|-----------|----------|
| REQ-FEAT-001 | Local Storage | IndexedDB (Dexie.js) для документов | MVP | 04-FRONTEND.md:529 |
| REQ-FEAT-002 | Encryption | AES-256-GCM шифрование PII полей | MVP | 04-FRONTEND.md:649 |
| REQ-FEAT-003 | Offline Queue | Очередь синхронизации для offline | MVP | 04-FRONTEND.md:366 |
| REQ-FEAT-004 | Background Sync | Фоновая синхронизация | MVP | 04-FRONTEND.md:779 |
| REQ-FEAT-005 | Service Worker | PWA с кэшированием | MVP | 04-FRONTEND.md:835 |
| REQ-FEAT-006 | Deep Links | Обработка deep links | MVP | 04-FRONTEND.md:985 |
| REQ-FEAT-007 | Back Button | Обработка кнопки назад (Android) | MVP | 04-FRONTEND.md:1020 |
| REQ-FEAT-008 | Localization | 5 языков (RU, UZ, TJ, KY, EN) | MVP | TECHNICAL_SPECIFICATION.md:43 |
| REQ-FEAT-009 | Zustand Stores | State management | MVP | 04-FRONTEND.md:179 |
| REQ-FEAT-010 | React Query | Server state caching | MVP | 04-FRONTEND.md:477 |
| REQ-FEAT-011 | Capacitor | Native mobile wrapper | MVP | 04-FRONTEND.md:1067 |
| REQ-FEAT-012 | OCR | Tesseract.js для распознавания | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:561 |
| REQ-FEAT-013 | Biometrics | Биометрическая защита | Post-MVP (v1.1) | 04-FRONTEND.md:49 |
| REQ-FEAT-014 | Push Notifications | Local notifications (Capacitor) | MVP | MVP_PRIORITIZATION.md:110 |
| REQ-FEAT-015 | Push Notifications | Remote push (FCM) | Post-MVP (v1.1) | MVP_PRIORITIZATION.md:207 |

---

## MVP Scope

### MVP v1.0 - Must Have

#### Backend MVP

| ID | Требование | Описание | Источник |
|----|------------|----------|----------|
| MVP-BE-001 | Device Auth | POST /auth/device | MVP_PRIORITIZATION.md:254 |
| MVP-BE-002 | Token Refresh | POST /auth/refresh | MVP_PRIORITIZATION.md:255 |
| MVP-BE-003 | User Profile | GET/PATCH /users/me | MVP_PRIORITIZATION.md:257-258 |
| MVP-BE-004 | Ban Check Proxy | GET /ban-check/:params | MVP_PRIORITIZATION.md:261 |
| MVP-BE-005 | Patent Regions | GET /patent/regions (static data) | MVP_PRIORITIZATION.md:262 |
| MVP-BE-006 | Health Check | GET /health | MVP_PRIORITIZATION.md:265 |

#### Database MVP

| ID | Требование | Описание | Источник |
|----|------------|----------|----------|
| MVP-DB-001 | Users table | Только device_id, citizenship_code, region_code, settings | MVP_PRIORITIZATION.md:281 |
| MVP-DB-002 | Audit log | Базовая таблица | MVP_PRIORITIZATION.md:291 |

#### Frontend MVP

| ID | Требование | Описание | Источник |
|----|------------|----------|----------|
| MVP-FE-001 | API Client Integration | Device auth flow | MVP_PRIORITIZATION.md:307 |
| MVP-FE-002 | Document Forms | Ручной ввод документов | MVP_PRIORITIZATION.md:308 |
| MVP-FE-003 | Local Notifications | Capacitor local notifications | MVP_PRIORITIZATION.md:309 |
| MVP-FE-004 | Stay Calculator | Логика расчёта 90/180 | MVP_PRIORITIZATION.md:310 |
| MVP-FE-005 | Ban Checker | Интеграция API proxy | MVP_PRIORITIZATION.md:311 |
| MVP-FE-006 | Offline Mode | Полировка offline | MVP_PRIORITIZATION.md:312 |
| MVP-FE-007 | Error Handling | Обработка ошибок | MVP_PRIORITIZATION.md:313 |

#### Уже реализовано (использовать)

| ID | Требование | Описание | Источник |
|----|------------|----------|----------|
| DONE-001 | Navigation | 5 вкладок | MVP_PRIORITIZATION.md:316 |
| DONE-002 | Localization | 5 языков | MVP_PRIORITIZATION.md:317 |
| DONE-003 | Auth UI | Phone + OTP flow | MVP_PRIORITIZATION.md:318 |
| DONE-004 | Document Wizard UI | UI для документов | MVP_PRIORITIZATION.md:319 |
| DONE-005 | Profile Form UI | UI профиля | MVP_PRIORITIZATION.md:320 |
| DONE-006 | Zustand Stores | State management | MVP_PRIORITIZATION.md:321 |
| DONE-007 | IndexedDB Setup | Dexie.js | MVP_PRIORITIZATION.md:322 |
| DONE-008 | PWA/Capacitor Config | Конфигурация | MVP_PRIORITIZATION.md:323 |

---

## Post-MVP Features

### v1.1 (2 недели после MVP)

| ID | Функция | Описание | Источник |
|----|---------|----------|----------|
| POST-001 | Phone Auth | SMS OTP авторизация | MVP_PRIORITIZATION.md:158 |
| POST-002 | Push Notifications | FCM push уведомления | MVP_PRIORITIZATION.md:159 |
| POST-003 | Cloud Safe | E2E backup | MVP_PRIORITIZATION.md:160 |
| POST-004 | OCR | Tesseract.js сканирование | MVP_PRIORITIZATION.md:161 |
| POST-005 | Telegram Bot | Уведомления через бот | MVP_PRIORITIZATION.md:162 |

### v1.2 (1 месяц после MVP)

| ID | Функция | Описание | Источник |
|----|---------|----------|----------|
| POST-010 | AI Assistant | Базовый Q&A | MVP_PRIORITIZATION.md:168 |
| POST-011 | RAG | Legal docs RAG | MVP_PRIORITIZATION.md:169 |
| POST-012 | Payments | СБП + ЮKassa | MVP_PRIORITIZATION.md:169 |
| POST-013 | Exam Trainer | Тренажёр экзамена | MVP_PRIORITIZATION.md:170 |
| POST-014 | Telegram Auth | Авторизация через Telegram | MVP_PRIORITIZATION.md:171 |

### v2.0+ (Won't Have в MVP)

| ID | Функция | Описание | Источник |
|----|---------|----------|----------|
| FUTURE-001 | B2B Platform | Платформа для работодателей | MVP_PRIORITIZATION.md:177 |
| FUTURE-002 | White-label | White-label для банков | MVP_PRIORITIZATION.md:178 |
| FUTURE-003 | Fintech Services | Финансовые сервисы | MVP_PRIORITIZATION.md:179 |
| FUTURE-004 | Global Expansion | Расширение за пределы РФ | MVP_PRIORITIZATION.md:180 |

---

## Типы документов

| ID | Тип | Код | Поля | Приоритет | Источник |
|----|-----|-----|------|-----------|----------|
| DOC-001 | Паспорт | passport | ФИО, дата рождения, номер, дата выдачи | MVP | TECHNICAL_SPECIFICATION.md:669 |
| DOC-002 | Миграционная карта | migration_card | Дата въезда, цель, срок пребывания | MVP | TECHNICAL_SPECIFICATION.md:672 |
| DOC-003 | Патент | patent | Номер, регион, срок действия | MVP | TECHNICAL_SPECIFICATION.md:673 |
| DOC-004 | Регистрация | registration | Адрес, срок действия | MVP | TECHNICAL_SPECIFICATION.md:674 |
| DOC-005 | ИНН | inn | Номер ИНН | MVP | TECHNICAL_SPECIFICATION.md:675 |
| DOC-006 | СНИЛС | snils | Номер СНИЛС | MVP | TECHNICAL_SPECIFICATION.md:676 |
| DOC-007 | Медосмотр | medical | Дата, срок действия | MVP | TECHNICAL_SPECIFICATION.md:677 |
| DOC-008 | Сертификат экзамена | exam_cert | Номер, дата, срок | MVP | TECHNICAL_SPECIFICATION.md:678 |

---

## Типы уведомлений

| ID | Тип | Приоритет | Дни напоминания | Источник |
|----|-----|-----------|-----------------|----------|
| NOTIF-001 | Истекает документ | High | 30, 14, 7, 3, 1 | TECHNICAL_SPECIFICATION.md:1236 |
| NOTIF-002 | Документ истёк | Critical | - | TECHNICAL_SPECIFICATION.md:1237 |
| NOTIF-003 | Оплата патента | Critical | 30, 14, 7, 3, 1 | TECHNICAL_SPECIFICATION.md:1240 |
| NOTIF-004 | Просрочка патента | Critical | - | TECHNICAL_SPECIFICATION.md:1241 |
| NOTIF-005 | Истекает регистрация | High | 7, 3, 1 | TECHNICAL_SPECIFICATION.md:1244 |
| NOTIF-006 | Истекла регистрация | Critical | - | TECHNICAL_SPECIFICATION.md:1245 |
| NOTIF-007 | Предупреждение 90/180 | High | 14, 7, 3, 1 | TECHNICAL_SPECIFICATION.md:1248 |
| NOTIF-008 | Критичный срок 90/180 | Critical | 0 | TECHNICAL_SPECIFICATION.md:1249 |
| NOTIF-009 | Обновление законов | Medium | - | TECHNICAL_SPECIFICATION.md:1252 |
| NOTIF-010 | Напоминание о бэкапе | Low | - | TECHNICAL_SPECIFICATION.md:1255 |
| NOTIF-011 | Истекает подписка | Normal | 7, 3, 1 | TECHNICAL_SPECIFICATION.md:1256 |

---

## Архитектурные принципы

| ID | Принцип | Описание | Источник |
|----|---------|----------|----------|
| ARCH-001 | Local-First | Все ПДн хранятся только на устройстве | 00-ARCHITECTURE-OVERVIEW.md:89 |
| ARCH-002 | Не оператор ПДн | Сервер не хранит персональные данные | 00-ARCHITECTURE-OVERVIEW.md:287 |
| ARCH-003 | E2E Encryption | Бэкапы шифруются на устройстве | 00-ARCHITECTURE-OVERVIEW.md:29 |
| ARCH-004 | Offline-capable | Основные функции работают без сети | 00-ARCHITECTURE-OVERVIEW.md:115 |
| ARCH-005 | Fault Isolation | Микросервисы изолированы (circuit breaker) | 00-ARCHITECTURE-OVERVIEW.md:137 |
| ARCH-006 | Privacy by Design | Data minimization, encryption, access control | 00-ARCHITECTURE-OVERVIEW.md:126 |

---

## Критерии приёмки (из ТЗ)

### Backend Core API

| ID | Критерий | Метрика | Источник |
|----|----------|---------|----------|
| AC-1.1 | API отвечает < 200ms (p95) | Latency | TECHNICAL_SPECIFICATION.md:375 |
| AC-1.2 | Uptime > 99.5% | Availability | TECHNICAL_SPECIFICATION.md:376 |
| AC-1.3 | Все endpoints в Swagger | Coverage | TECHNICAL_SPECIFICATION.md:377 |
| AC-1.4 | Unit tests > 80% coverage | Test coverage | TECHNICAL_SPECIFICATION.md:378 |
| AC-1.5 | E2E tests для critical flows | Test count | TECHNICAL_SPECIFICATION.md:379 |
| AC-1.6 | Логирование всех запросов | Audit | TECHNICAL_SPECIFICATION.md:380 |
| AC-1.7 | Rate limiting работает | Security | TECHNICAL_SPECIFICATION.md:381 |

### Identity Service

| ID | Критерий | Источник |
|----|----------|----------|
| AC-2.1 | SMS доставляется < 10 секунд | TECHNICAL_SPECIFICATION.md:517 |
| AC-2.2 | OTP валидация корректна | TECHNICAL_SPECIFICATION.md:518 |
| AC-2.3 | Telegram auth интегрирован | TECHNICAL_SPECIFICATION.md:519 |
| AC-2.4 | VK ID auth интегрирован | TECHNICAL_SPECIFICATION.md:520 |
| AC-2.5 | Rate limiting на SMS | TECHNICAL_SPECIFICATION.md:521 |
| AC-2.6 | Fallback между SMS провайдерами | TECHNICAL_SPECIFICATION.md:522 |

### Document Processing

| ID | Критерий | Источник |
|----|----------|----------|
| AC-3.1 | OCR паспорта РФ > 90% точность | TECHNICAL_SPECIFICATION.md:710 |
| AC-3.2 | OCR миграционной карты | TECHNICAL_SPECIFICATION.md:711 |
| AC-3.3 | OCR работает offline | TECHNICAL_SPECIFICATION.md:712 |
| AC-3.4 | Документы шифруются | TECHNICAL_SPECIFICATION.md:713 |
| AC-3.5 | Напоминания о сроках работают | TECHNICAL_SPECIFICATION.md:714 |
| AC-3.6 | Экспорт в PDF | TECHNICAL_SPECIFICATION.md:715 |

### AI Assistant

| ID | Критерий | Источник |
|----|----------|----------|
| AC-4.1 | 3-уровневый PII фильтр | TECHNICAL_SPECIFICATION.md:1016 |
| AC-4.2 | RAG релевантные документы | TECHNICAL_SPECIFICATION.md:1017 |
| AC-4.3 | Kill Switch < 1 секунды | TECHNICAL_SPECIFICATION.md:1018 |
| AC-4.4 | Ссылки на источники | TECHNICAL_SPECIFICATION.md:1019 |
| AC-4.5 | Fallback на резервный LLM | TECHNICAL_SPECIFICATION.md:1020 |
| AC-4.6 | Rate limiting на AI | TECHNICAL_SPECIFICATION.md:1021 |

### Payments

| ID | Критерий | Источник |
|----|----------|----------|
| AC-5.1 | СБП (QR + deeplink) | TECHNICAL_SPECIFICATION.md:1205 |
| AC-5.2 | ЮKassa работает | TECHNICAL_SPECIFICATION.md:1206 |
| AC-5.3 | Webhook обработка | TECHNICAL_SPECIFICATION.md:1207 |
| AC-5.4 | Подписка активируется | TECHNICAL_SPECIFICATION.md:1208 |
| AC-5.5 | Автопродление | TECHNICAL_SPECIFICATION.md:1209 |
| AC-5.6 | Возврат средств | TECHNICAL_SPECIFICATION.md:1210 |

### Notifications

| ID | Критерий | Источник |
|----|----------|----------|
| AC-6.1 | Push доставляются (FCM) | TECHNICAL_SPECIFICATION.md:1362 |
| AC-6.2 | Telegram бот работает | TECHNICAL_SPECIFICATION.md:1363 |
| AC-6.3 | Smart timing учитывает TZ | TECHNICAL_SPECIFICATION.md:1364 |
| AC-6.4 | Escalation работает | TECHNICAL_SPECIFICATION.md:1365 |
| AC-6.5 | Snooze работает | TECHNICAL_SPECIFICATION.md:1366 |
| AC-6.6 | Настройки сохраняются | TECHNICAL_SPECIFICATION.md:1367 |

### Frontend Integration

| ID | Критерий | Источник |
|----|----------|----------|
| AC-7.1 | API client с подписью | TECHNICAL_SPECIFICATION.md:1538 |
| AC-7.2 | React Query hooks | TECHNICAL_SPECIFICATION.md:1539 |
| AC-7.3 | Offline queue | TECHNICAL_SPECIFICATION.md:1540 |
| AC-7.4 | Auto-sync при сети | TECHNICAL_SPECIFICATION.md:1541 |
| AC-7.5 | Error handling с retry | TECHNICAL_SPECIFICATION.md:1542 |
| AC-7.6 | Loading states | TECHNICAL_SPECIFICATION.md:1543 |

---

## Статистика требований

| Категория | MVP | Post-MVP v1.1 | Post-MVP v1.2 | v2.0+ | Всего |
|-----------|-----|---------------|---------------|-------|-------|
| API Endpoints | 17 | 14 | 14 | - | 45 |
| Modules | 10 | 7 | 7 | 4 | 28 |
| Screens | 9 | - | 2 | - | 11 |
| Components | 20 | 2 | 4 | - | 26 |
| Features | 14 | 4 | - | - | 18 |
| **Итого** | **70** | **27** | **27** | **4** | **128** |

---

## Security Requirements

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-SEC-001 | Local-First | PII только на устройстве пользователя | MVP | 00-ARCHITECTURE-OVERVIEW.md:89-113 |
| REQ-SEC-002 | No PII on Server | Сервер не хранит ФИО, паспорт, адрес, телефон | MVP | 00-ARCHITECTURE-OVERVIEW.md:299-312 |
| REQ-SEC-003 | AES-256-GCM | Шифрование локальных данных | MVP | 00-ARCHITECTURE-OVERVIEW.md:106 |
| REQ-SEC-004 | E2E Backup | Бэкапы шифруются ключом пользователя | Post-MVP (v1.1) | 00-ARCHITECTURE-OVERVIEW.md:269-276 |
| REQ-SEC-005 | Rate Limiting | global: 100/min, auth: 5/min, backup: 10/hour | MVP | TECHNICAL_SPECIFICATION.md:345-353 |
| REQ-SEC-006 | Request Signing | HMAC-SHA256 подпись всех запросов | MVP | TECHNICAL_SPECIFICATION.md:356-369 |
| REQ-SEC-007 | JWT Auth | Access token 24h, Refresh token 30d | MVP | TECHNICAL_SPECIFICATION.md:493-511 |
| REQ-SEC-008 | PII Filter AI | 3-уровневый фильтр (client, gateway, proxy) | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:769-855 |
| REQ-SEC-009 | AI Kill Switch | Экстренное отключение AI при аномалиях | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:920-972 |
| REQ-SEC-010 | Webhook Signature | Проверка подписи платёжных webhooks | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:1186-1198 |
| REQ-SEC-011 | 152-FZ Compliance | Не оператор персональных данных | MVP | 00-ARCHITECTURE-OVERVIEW.md:282-338 |
| REQ-SEC-012 | OTP Security | 6 цифр, TTL 5 мин, 3 попытки, блок 15 мин | Post-MVP (v1.1) | TECHNICAL_SPECIFICATION.md:483-489 |
| REQ-SEC-013 | Biometric Access | Face ID / Fingerprint для доступа | Post-MVP (v1.1) | 04-FRONTEND.md:49 |

---

## Infrastructure Requirements

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-INFRA-001 | PostgreSQL 16 | Основная база данных | MVP | 00-ARCHITECTURE-OVERVIEW.md:377 |
| REQ-INFRA-002 | Redis 7 | Cache, sessions, rate limiting | MVP | 00-ARCHITECTURE-OVERVIEW.md:378 |
| REQ-INFRA-003 | RabbitMQ 3 | Message queue для событий | Post-MVP (v1.1) | 00-ARCHITECTURE-OVERVIEW.md:379 |
| REQ-INFRA-004 | S3/MinIO | Object storage для бэкапов | Post-MVP (v1.1) | 00-ARCHITECTURE-OVERVIEW.md:380 |
| REQ-INFRA-005 | Docker Compose | Контейнеризация сервисов | MVP | TECHNICAL_SPECIFICATION.md:1682-1772 |
| REQ-INFRA-006 | GitHub Actions | CI/CD pipeline | MVP | TECHNICAL_SPECIFICATION.md:1777-1829 |
| REQ-INFRA-007 | Cloudflare | WAF, CDN, DDoS protection | MVP | 00-ARCHITECTURE-OVERVIEW.md:385 |
| REQ-INFRA-008 | Sentry | Error monitoring | MVP | 00-ARCHITECTURE-OVERVIEW.md:389 |
| REQ-INFRA-009 | Grafana + Loki | Metrics и logs dashboard | Post-MVP | 00-ARCHITECTURE-OVERVIEW.md:389-390 |
| REQ-INFRA-010 | Selectel Cloud | Hosting (VPC) | MVP | 00-ARCHITECTURE-OVERVIEW.md:385 |
| REQ-INFRA-011 | pgvector | Vector extension для RAG | Post-MVP (v1.2) | TECHNICAL_SPECIFICATION.md:861-879 |

---

## Business Logic Requirements

### Subscription Plans

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-BIZ-001 | Free Plan | 3 документа, 5 AI вопросов/день, базовые напоминания | MVP | 06-BUSINESS-LOGIC.md:26-48 |
| REQ-BIZ-002 | Plus Plan | 99р/мес, безлимит документов, 30 AI, backup 500MB | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:50-65 |
| REQ-BIZ-003 | Pro Plan | 249р/мес, безлимит AI, backup 1GB, поддержка | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:67-87 |
| REQ-BIZ-004 | AI Packs | Pay-per-use пакеты: 10 за 49р, 30 за 99р, 100 за 249р | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:93-115 |
| REQ-BIZ-005 | Regional Pricing | UZ: 80%, TJ: 70%, KG: 75% от базовой цены | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:196-214 |
| REQ-BIZ-006 | Promo Codes | Скидки для студентов, многодетных, диаспор | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:155-188 |
| REQ-BIZ-007 | Referral Program | Приглашённый +30% скидка, пригласивший +1 месяц | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:172-175 |

### Deadline & Notification Logic

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-BIZ-010 | Registration Deadline | UZ: 7 дней, TJ: 15 дней, ЕАЭС: 30 дней | MVP | 06-BUSINESS-LOGIC.md:271-298 |
| REQ-BIZ-011 | Patent Payment | Напоминания за 30, 14, 7, 3, 1 день | MVP | 06-BUSINESS-LOGIC.md:281-284 |
| REQ-BIZ-012 | 90/180 Rule | Расчёт оставшихся дней, предупреждения | MVP | 06-BUSINESS-LOGIC.md:285-291 |
| REQ-BIZ-013 | Smart Timing | Отправка в активные часы пользователя | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:330-418 |
| REQ-BIZ-014 | Escalation | Telegram если push не прочитан через 4 часа | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:364-380 |
| REQ-BIZ-015 | Quiet Hours | Не отправлять с 22:00 до 08:00 | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:359-361 |

### Onboarding Flow

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-BIZ-020 | Phase 1: Trust | Welcome + Privacy экраны (2 шага) | MVP | 06-BUSINESS-LOGIC.md:487-515 |
| REQ-BIZ-021 | Phase 2: Value | Citizenship + Entry Date + Instant Result | MVP | 06-BUSINESS-LOGIC.md:517-553 |
| REQ-BIZ-022 | Phase 3: Complete | Purpose + Region + Notifications (skippable) | MVP | 06-BUSINESS-LOGIC.md:555-598 |
| REQ-BIZ-023 | A/B Testing | Тестирование вариантов онбординга | Post-MVP | 06-BUSINESS-LOGIC.md:604-644 |

### Legal Monitoring

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-BIZ-030 | Source Monitoring | Парсинг Consultant+, GARANT, МВД каждые 2 часа | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:652-722 |
| REQ-BIZ-031 | AI Analysis | Автоматический анализ изменений через GPT-4 | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:728-780 |
| REQ-BIZ-032 | User Notification | Уведомление затронутых по гражданству/региону | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:786-836 |
| REQ-BIZ-033 | Criticality Levels | critical/important/info классификация | Post-MVP (v1.1) | 06-BUSINESS-LOGIC.md:773-779 |

### B2B Features (Future)

| ID | Требование | Описание | Приоритет | Источник |
|----|------------|----------|-----------|----------|
| REQ-BIZ-040 | Employer Dashboard | Панель для работодателей | v2.0+ | 06-BUSINESS-LOGIC.md:846-892 |
| REQ-BIZ-041 | Employee Status API | API проверки статуса сотрудника (с согласием) | v2.0+ | 06-BUSINESS-LOGIC.md:866-890 |
| REQ-BIZ-042 | Diaspora Partnerships | 20% скидка через партнёрские коды | Post-MVP (v1.2) | 06-BUSINESS-LOGIC.md:900-928 |
| REQ-BIZ-043 | White-label | Кастомизация для банков | v2.0+ | 06-BUSINESS-LOGIC.md:934-968 |

---

## Conversion Triggers

| ID | Триггер | Действие | Offer | Источник |
|----|---------|----------|-------|----------|
| CONV-001 | 4-й документ | User добавляет 4-й документ | Plus -50% first month | 06-BUSINESS-LOGIC.md:221-230 |
| CONV-002 | AI лимит | Исчерпаны 5 вопросов/день | AI pack 10 за 49р | 06-BUSINESS-LOGIC.md:232-240 |
| CONV-003 | 5+ документов | Много документов без бэкапа | Cloud Safe предложение | 06-BUSINESS-LOGIC.md:242-249 |
| CONV-004 | 7 дней активности | Активный free пользователь | 7 дней Pro trial | 06-BUSINESS-LOGIC.md:251-260 |

---

## Always Free Features (Safety Critical)

| ID | Функция | Описание | Источник |
|----|---------|----------|----------|
| FREE-001 | Deadline Calculator | Расчёт 90/180, регистрации, патента | 06-BUSINESS-LOGIC.md:43 |
| FREE-002 | Critical Alerts | Срочные уведомления о дедлайнах | 06-BUSINESS-LOGIC.md:44 |
| FREE-003 | Legal Reference | Базовый справочник законов | 06-BUSINESS-LOGIC.md:45 |
| FREE-004 | Emergency Contacts | Контакты УФМС, посольств | 06-BUSINESS-LOGIC.md:46 |

---

## Итоговая статистика требований

| Категория | MVP | Post-MVP v1.1 | Post-MVP v1.2 | v2.0+ | Всего |
|-----------|-----|---------------|---------------|-------|-------|
| API Endpoints | 17 | 16 | 14 | - | 47 |
| Backend Modules | 10 | 7 | 7 | 4 | 28 |
| Database Tables | 2 | 1 | 2 | - | 5 |
| Frontend Screens | 10 | - | 1 | - | 11 |
| Frontend Components | 20 | 2 | 4 | - | 26 |
| Frontend Features | 14 | 4 | - | - | 18 |
| Security Requirements | 7 | 3 | 3 | - | 13 |
| Infrastructure | 8 | 2 | 1 | - | 11 |
| Business Logic | 12 | 7 | 6 | 4 | 29 |
| **Всего** | **100** | **42** | **38** | **8** | **188** |

---

*Документ создан: 2026-01-27*
*Источники: 6 файлов документации*
*Всего извлечено: 188 требований*
