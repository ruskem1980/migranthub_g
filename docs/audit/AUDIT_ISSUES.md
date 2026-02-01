# Аудит MigrantHub — Список замечаний

**Дата аудита:** 2026-01-30
**Версия:** 1.0

---

## КРИТИЧЕСКИЕ ПРОБЛЕМЫ (Потеря функционала)

### 1. Отсутствующие страницы

| Проблема | Файл ссылки | Путь | Статус |
|----------|-------------|------|--------|
| Страница AI ассистента | `UsefulSection.tsx:52` | `/ai` | ❌ НЕ СУЩЕСТВУЕТ |
| Страница "Ваши права" | `UsefulSection.tsx:60` | `/rights` | ❌ НЕ СУЩЕСТВУЕТ |

**Компоненты ЕСТЬ, но не подключены:**
- `apps/frontend/src/components/assistant/AIChatPanel.tsx` — полноценный AI чат
- `apps/frontend/src/components/prototype/services/FAQModal.tsx` — FAQ с 22 вопросами на 5 языках

### 2. Отсутствующие ключи локализации

**Навигация (BottomNavigation.tsx):**
| Ключ | Строка |
|------|--------|
| `nav.checklist` | 27 |
| `nav.checks` | 28, 37 |
| `nav.sos` | 29, 38 |
| `nav.login` | 30 |

**Калькулятор патента (PatentCalculatorModal.tsx):**
| Ключ | Строка |
|------|--------|
| `services.patentCalculator.title` | 156 |
| `services.patentCalculator.subtitle` | 159 |
| `services.patentCalculator.selectRegion` | 200 |
| `services.patentCalculator.chooseRegion` | 209 |
| `services.patentCalculator.monthlyRate` | 260 |
| `services.patentCalculator.numberOfMonths` | 269 |
| `services.patentCalculator.calculating` | 332 |
| `services.patentCalculator.calculate` | 335 |
| `services.patentCalculator.totalAmount` | 343 |
| `services.patentCalculator.region` | 351 |
| `services.patentCalculator.baseRate` | 355 |
| `services.patentCalculator.coefficient` | 359 |
| `services.patentCalculator.monthlyPayment` | 363 |
| `services.patentCalculator.period` | 369 |
| `services.patentCalculator.infoNote` | 384 |
| `services.patentCalculator.loadError` | 66 |
| `services.patentCalculator.calcError` | 109 |

**Проверка патента (PatentCheckModal.tsx) — 33 ключа:**
- `services.patentCheck.title`
- `services.patentCheck.subtitle`
- `services.patentCheck.errorOccurred`
- `services.patentCheck.patentSeries`
- `services.patentCheck.seriesError`
- `services.patentCheck.patentNumber`
- `services.patentCheck.numberError`
- `services.patentCheck.additional`
- `services.patentCheck.checkPatent`
- `services.patentCheck.infoNote`
- `services.patentCheck.seriesAndNumber`
- `services.patentCheck.validUntil`
- `services.patentCheck.holder`
- `services.patentCheck.possibleReasons`
- `services.patentCheck.reason1`
- `services.patentCheck.reason2`
- `services.patentCheck.reason3`
- `services.patentCheck.recommendations`
- `services.patentCheck.recommendation1`
- `services.patentCheck.recommendation2`
- `services.patentCheck.recommendation3`
- `services.patentCheck.mockWarning`
- `services.patentCheck.fallbackWarning`
- `services.patentCheck.status.valid`
- `services.patentCheck.status.validSubtitle`
- `services.patentCheck.status.expired`
- `services.patentCheck.status.expiredSubtitle`
- `services.patentCheck.status.invalid`
- `services.patentCheck.status.invalidSubtitle`
- `services.patentCheck.status.notFound`
- `services.patentCheck.status.notFoundSubtitle`
- `services.patentCheck.status.error`
- `services.patentCheck.status.errorSubtitle`

**Всего отсутствующих ключей: ~54**

---

## ВЫСОКИЙ ПРИОРИТЕТ

### 3. Проблемы API Client

| Проблема | Файл | Строка | Риск |
|----------|------|--------|------|
| Token refresh race condition | `lib/api/client.ts` | 207-223 | Data corruption |
| Offline queue не синхронизируется | `lib/sync/backgroundSync.ts` | - | Lost updates |
| Hardcoded demo код `1234` | `auth/otp/page.tsx` | 120 | Security |
| Нет timeout для refresh | `lib/api/client.ts` | 225-250 | Hang |

### 4. Проблемы с защитой маршрутов

- Нет middleware для проверки аутентификации
- `/documents`, `/profile`, `/checks` доступны без авторизации
- Потенциальные бесконечные редиректы в `/login`

### 5. Trainer Store — прямые fetch вместо API client

**Файл:** `lib/stores/trainerStore.ts` (строки 68-77, 82-94)
- Не использует единый API клиент
- Нет обработки токенов
- Нет offline queue

---

## СРЕДНИЙ ПРИОРИТЕТ

### 6. Обработка ошибок

| Страница | Проблема |
|----------|----------|
| `/documents` | `deleteDocument()` без обработки ошибок в UI |
| `/documents` | `alert()` для ошибок (плохой UX) |
| `/calculator` | Нет обработки ошибок для `addPeriod()`, `updatePeriod()` |
| Modals | Многие modals без try-catch |

### 7. Loading States

| Компонент | Проблема |
|-----------|----------|
| `/checks` | Нет loading indicator |
| ProfileForm | Нет loading при submit |
| DocumentsList | Нет spinner при refresh |

### 8. Query Cache Configuration

- `staleTime: 5 мин` может быть долго для динамических данных
- `gcTime: 30 мин` — память может заполниться

### 9. Document Check Store — Hardcoded TODO

**Файл:** `lib/stores/documentCheckStore.ts` (строки 280-356)
```typescript
number: '12345678', // TODO: Add patent number to profile
permitType: 'RVP',  // TODO: Add permit type to profile
```

### 10. PII Detection не используется

**Файл:** `lib/stores/chatStore.ts`
- Функция `detectPII()` экспортируется, но никогда не вызывается при отправке сообщений

---

## НИЗКИЙ ПРИОРИТЕТ

### 11. Math.random() shuffle

**Файл:** `features/exam/hooks/useExamApi.ts` (строки 110-117)
- Неправильный shuffle algorithm (biased)

### 12. Language Store — двойная синхронизация cookie

**Файл:** `lib/stores/languageStore.ts`
- Cookie устанавливается дважды

### 13. Чувствительные данные в localStorage

**Файл:** `lib/stores/authStore.ts`
- `user` объект с `citizenshipCode`, `regionCode`, `entryDate` в localStorage

---

## СТАТИСТИКА

| Категория | Количество |
|-----------|------------|
| Критические проблемы | 2 (отсутствующие страницы) |
| Отсутствующих ключей локализации | 54 |
| Проблем API/Security | 4 |
| Проблем UX | 7 |
| Проблем архитектуры | 5 |
| **ВСЕГО** | **72** |

---

## СВЕРКА ФУНКЦИЙ (БЫЛО vs СТАЛО)

### Функции из старого прототипа

| Функция | Статус | Где должна быть |
|---------|--------|-----------------|
| SOS | ✅ ЕСТЬ | Главная + /sos |
| Калькулятор 90 дней | ✅ ЕСТЬ | Главная |
| Калькулятор патента | ⚠️ Нет локализации | Главная |
| Проверка запрета въезда | ✅ ЕСТЬ | /checks |
| Проверка паспорта | ✅ ЕСТЬ | /checks |
| Проверка патента | ⚠️ Нет локализации | /checks |
| Проверка ИНН | ✅ ЕСТЬ | /checks |
| Чек-лист мигранта | ✅ ЕСТЬ | /checklist |
| Экзамен по русскому | ✅ ЕСТЬ | /exam |
| **AI Чат-бот** | ❌ СТРАНИЦА НЕ СУЩЕСТВУЕТ | /ai |
| **FAQ (Типовые вопросы)** | ❌ НЕ ПОДКЛЮЧЕН | Главная или /faq |
| **Ваши права** | ❌ СТРАНИЦА НЕ СУЩЕСТВУЕТ | /rights |
| Справочник (законы) | ✅ ЕСТЬ | /reference |

### Потерянные компоненты

1. **AIChatPanel** (`components/assistant/AIChatPanel.tsx`)
   - Полноценный AI чат с PII фильтром
   - Quick questions
   - История чата

2. **FAQModal** (`components/prototype/services/FAQModal.tsx`)
   - 22 вопроса на 5 языках
   - Категории: патент, РВП, регистрация, документы, права
   - Поиск по вопросам

3. **AssistantScreen** (`components/prototype/dashboard/AssistantScreen.tsx`)
   - Интегрированный экран ассистента

---

## РЕКОМЕНДАЦИИ

### Немедленно (P0)

1. Создать страницу `/ai` с компонентом `AIChatPanel`
2. Создать страницу `/rights` или `/faq` с компонентом `FAQModal`
3. Добавить отсутствующие ключи локализации

### В спринте (P1)

4. Исправить token refresh race condition
5. Убрать hardcoded demo код
6. Интегрировать offline queue sync
7. Добавить middleware для защиты маршрутов

### На будущее (P2)

8. Переписать trainerStore на apiClient
9. Заменить alert() на Toast
10. Добавить тесты для stores
