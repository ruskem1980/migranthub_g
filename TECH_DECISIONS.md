# MigrantHub - Технические решения

> Документ создан по результатам аудита фронтенда (40 вопросов)
> Дата: 2026-01-23

---

## Сводная таблица решений

| # | Тема | Решение |
|---|------|---------|
| 1 | Приоритет разработки | Identity Service (SMS + Max + Telegram) |
| 2 | Auth UI | Адаптивный (по платформе) |
| 3 | Мобильная платформа | Capacitor (iOS, Android, RuStore) |
| 4 | State Management | TanStack Query + Zustand |
| 5 | Хранение данных | Гибрид (сервер РФ + зашифрованный кэш) |
| 6 | Онбординг | Адаптивный (по языку/опыту) |
| 7 | Главный экран | Полный концепт (дашборд) |
| 8 | Документы | Просмотр + загрузка |
| 9 | Сервисы | Сбалансированный подход |
| 10 | AI-ассистент | LLM интеграция (GigaChat/YandexGPT) |
| 11 | SOS | SOS-кнопка с выбором ситуации |
| 12 | Push-уведомления | Гибрид (FCM + RuStore + Telegram) |
| 13 | Локализация | RU + UZ + TJ + KG + AI на лету |
| 14 | Формы | React Hook Form + Zod |
| 15 | Тестирование | Vitest + RTL + Playwright |
| 16 | Аналитика | Yandex.Metrika + PostHog (self-hosted) |
| 17 | Платежи | СБП + ЮKassa |
| 18 | Карты | Yandex.Карты + 2ГИС |
| 19 | Проверка запретов | API партнёра |
| 20 | Структура компонентов | Гибрид /components + /features |
| 21 | Обработка ошибок | Полная (PostHog + offline fallbacks) |
| 22 | Offline | Full PWA (SW + Background Sync + IndexedDB) |
| 23 | PDF генерация | Гибрид клиент/сервер |
| 24 | Переводчик | Deeplink на Яндекс.Переводчик (бесплатно) |
| 25 | Загрузка/OCR | Сжатие + capacitor-cyrillic-ocr (на устройстве) |
| 26 | Анимации | CSS only (Tailwind transitions) |
| 27 | Доступность | Средняя (ARIA, focus, контрастность) |
| 28 | Тёмная тема | Системная (prefers-color-scheme) |
| 29 | Деплой | Selectel/VK Cloud (Россия, 152-ФЗ) |
| 30 | CI/CD | GitHub Actions |
| 31 | Мониторинг | Sentry (ошибки) + PostHog (аналитика) |
| 32 | Безопасность | Максимальная (CSP + WAF + DDoS) |
| 33 | Кэширование | Service Worker |
| 34 | Изображения | Next.js Image (WebP, lazy, blur) |
| 35 | Feature Flags | PostHog (для A/B тестов) |
| 36 | Локальная БД | IndexedDB (Dexie.js) |
| 37 | Голосовой ввод | Web Speech API (бесплатно) |
| 38 | In-App уведомления | Toast + Badge + Inbox |
| 39 | API версии | URL версионирование (/api/v1/) |
| 40 | Документация | JSDoc + Storybook |

---

## Технологический стек

### Frontend Core
```
Framework:       Next.js 14 (App Router)
Mobile:          Capacitor 6.x (iOS, Android, RuStore)
Styling:         Tailwind CSS 3.x
UI Components:   shadcn/ui
Icons:           Lucide React
```

### State & Data
```
Server State:    TanStack Query v5
Client State:    Zustand
Forms:           React Hook Form + Zod
Local Storage:   IndexedDB (Dexie.js)
Caching:         Service Worker (Workbox)
```

### Mobile Features
```
OCR:             capacitor-cyrillic-ocr
Camera:          @capacitor/camera
Speech:          Web Speech API
Push:            @capacitor/push-notifications + RuStore SDK
```

### Testing
```
Unit:            Vitest
Components:      React Testing Library
E2E:             Playwright
```

### Analytics & Monitoring
```
Analytics:       Yandex.Metrika + PostHog (self-hosted)
Errors:          Sentry
Feature Flags:   PostHog
```

### External Services
```
Maps:            Yandex.Maps API + 2GIS API
Payments:        СБП + ЮKassa
AI/LLM:          GigaChat / YandexGPT
Translator:      Яндекс.Переводчик (deeplink)
```

### Infrastructure
```
Hosting:         Selectel / VK Cloud (Россия)
CI/CD:           GitHub Actions
Security:        Cloudflare (WAF + DDoS)
CDN:             Selectel CDN (при росте)
```

---

## Детальные решения

### 1. Аутентификация

**Стратегия:** Adaptive Auth (по платформе)

| Платформа | Основной метод | Резервный |
|-----------|----------------|-----------|
| iOS (App Store) | SMS OTP | Apple Sign-In |
| Android (Google Play) | SMS OTP | Google Sign-In |
| Android (RuStore) | Max (VK ID) | SMS OTP |
| PWA / Web | SMS OTP | Telegram Login |

```typescript
// Определение метода авторизации
const getAuthMethod = () => {
  if (Capacitor.getPlatform() === 'ios') return 'sms';
  if (isRuStoreInstall()) return 'max';
  if (isTelegramWebApp()) return 'telegram';
  return 'sms';
};
```

### 2. Offline-First архитектура

```
┌─────────────────────────────────────────────────┐
│  UI Layer                                       │
│  └─ React Components                            │
├─────────────────────────────────────────────────┤
│  Data Layer                                     │
│  ├─ TanStack Query (server cache)               │
│  ├─ Zustand (UI state)                          │
│  └─ Dexie.js (IndexedDB wrapper)                │
├─────────────────────────────────────────────────┤
│  Sync Layer                                     │
│  ├─ Service Worker (Workbox)                    │
│  ├─ Background Sync API                         │
│  └─ Conflict Resolution                         │
├─────────────────────────────────────────────────┤
│  Network Layer                                  │
│  └─ API Client (fetch + retry)                  │
└─────────────────────────────────────────────────┘
```

### 3. OCR Pipeline (сканирование паспорта)

```typescript
// 1. Захват изображения
const photo = await Camera.getPhoto({
  quality: 90,
  resultType: CameraResultType.Uri
});

// 2. Сжатие на клиенте
const compressed = await imageCompression(photo.blob, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});

// 3. OCR на устройстве (бесплатно)
const result = await CyrillicOcr.recognizeText({
  imagePath: compressed.path,
  language: 'rus'
});

// 4. Парсинг и автозаполнение
const parsed = parsePassportText(result.text);
form.setValue('fullName', parsed.fullName);
form.setValue('passportNumber', parsed.passportNumber);
```

### 4. Push-уведомления (мультиплатформенные)

```typescript
// Определение канала доставки
const getPushChannel = async (userId: string) => {
  const platform = Capacitor.getPlatform();

  if (platform === 'ios' || platform === 'android') {
    // FCM для iOS и Google Play Android
    const token = await PushNotifications.register();
    return { channel: 'fcm', token };
  }

  if (isRuStoreInstall()) {
    // RuStore Push SDK
    const token = await RuStorePush.getToken();
    return { channel: 'rustore', token };
  }

  // Telegram fallback для PWA
  return { channel: 'telegram', chatId: user.telegramChatId };
};
```

### 5. Локализация (i18n)

**Поддерживаемые языки:**
- Русский (ru) - основной
- Узбекский (uz) - латиница + кириллица
- Таджикский (tg)
- Кыргызский (ky)

**Структура:**
```
/locales
├── ru.json       # Русский
├── uz-Latn.json  # Узбекский (латиница)
├── uz-Cyrl.json  # Узбекский (кириллица)
├── tg.json       # Таджикский
└── ky.json       # Кыргызский
```

**AI-перевод на лету:**
```typescript
// Если языка нет в статике — переводим через LLM
const t = (key: string, locale: string) => {
  const static = translations[locale]?.[key];
  if (static) return static;

  // Fallback на русский + AI перевод
  return translateOnFly(translations.ru[key], locale);
};
```

### 6. Безопасность

**Content Security Policy:**
```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' mc.yandex.ru;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: *.yandex.ru;
  connect-src 'self' api.migranthub.ru *.yandex.ru;
  frame-ancestors 'none';
`;
```

**Защита от атак:**
- CSRF токены для всех форм
- HttpOnly + Secure + SameSite cookies
- Rate limiting на API
- WAF (Cloudflare) для защиты от DDoS
- Input sanitization (DOMPurify)

### 7. Структура проекта

```
/apps/frontend/src
├── /app                    # Next.js App Router
│   ├── /(auth)            # Авторизация
│   ├── /(main)            # Основные экраны
│   └── /api               # API routes
├── /components
│   ├── /ui                # shadcn/ui компоненты
│   └── /shared            # Общие компоненты
├── /features              # Фичи (по доменам)
│   ├── /auth
│   ├── /documents
│   ├── /profile
│   └── /services
├── /lib
│   ├── /api               # API клиент
│   ├── /hooks             # Custom hooks
│   ├── /stores            # Zustand stores
│   └── /utils             # Утилиты
├── /locales               # i18n файлы
└── /types                 # TypeScript типы
```

---

## Примерная стоимость (ежемесячно)

| Сервис | Стоимость | Примечание |
|--------|-----------|------------|
| Selectel VPS | ~3000 ₽ | 2 vCPU, 4GB RAM |
| Selectel S3 | ~500 ₽ | 50GB storage |
| Cloudflare | $0 | Free tier достаточен |
| Sentry | $0 | Free tier (5K events) |
| PostHog | $0 | Self-hosted |
| Yandex.Metrika | $0 | Бесплатно |
| СБП | ~1% | Комиссия с транзакций |
| GigaChat | ~500 ₽ | По использованию |
| **Итого** | **~4000-5000 ₽/мес** | Для MVP |

---

## Roadmap технических задач

### Phase 1: MVP Core
- [ ] Настройка Capacitor для iOS/Android/RuStore
- [ ] Реализация адаптивной авторизации
- [ ] PWA с offline-режимом (Service Worker)
- [ ] Базовые формы с валидацией
- [ ] Профиль пользователя + OCR паспорта

### Phase 2: Services
- [ ] Интеграция Yandex.Maps + 2GIS
- [ ] Интеграция СБП + ЮKassa
- [ ] AI-ассистент (GigaChat)
- [ ] Push-уведомления (FCM + RuStore)

### Phase 3: Polish
- [ ] Storybook для компонентов
- [ ] E2E тесты (Playwright)
- [ ] Performance оптимизация
- [ ] A/B тестирование (PostHog)

---

## Ссылки

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [capacitor-cyrillic-ocr](https://github.com/leechy/capacitor-cyrillic-ocr)
- [Dexie.js](https://dexie.org)
- [PostHog](https://posthog.com)
