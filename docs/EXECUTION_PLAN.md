# План выполнения задач MigrantHub

> **Дата создания**: 2026-01-27
> **Обновлено**: 2026-01-28
> **Версия**: 2.0
> **Статус**: Waves 1-5 завершены

---

## Общий прогресс

```
Wave 1 ████████████████████ 100% ✅ Backend Base
Wave 2 ████████████████████ 100% ✅ Backend + Frontend
Wave 3 ████████████████████ 100% ✅ Frontend Dependencies
Wave 4 ███████████████████░  95% ✅ Локализация
Wave 5 ████████████████████ 100% ✅ Тестирование
Wave 6 ░░░░░░░░░░░░░░░░░░░░   0% ⏳ FE-BE Integration
Wave 7 ░░░░░░░░░░░░░░░░░░░░   0% ⏳ Mobile & Production
Wave 8 ░░░░░░░░░░░░░░░░░░░░   0% ⏳ Polish & Monitoring
```

---

## Принципы планирования

1. **1 задача = 1 контекстное окно** — каждая задача выполнима за один запуск агента
2. **Оценка сложности**:
   - S (Small): ~200-500 строк кода, 1-3 файла
   - M (Medium): ~500-1000 строк, 3-6 файлов
   - L (Large): ~1000-2000 строк, 6-10 файлов
   - XL: требует разбиения на подзадачи
3. **Параллельность**: задачи без зависимостей запускаются одновременно

---

## ✅ Волна 1: Backend Base — ЗАВЕРШЕНА

**Выполнено: 6 агентов параллельно**

| # | Задача | Статус | LOC | Файлы |
|---|--------|--------|-----|-------|
| 1.1 | Audit Log Module | ✅ | ~300 | audit.module.ts, audit.service.ts, audit-log.entity.ts |
| 1.2 | Recovery Verification | ✅ | ~500 | recovery.service.ts, verify-recovery.dto.ts |
| 1.3 | User Management | ✅ | ~600 | deadline-calculator.service.ts, calculate-deadlines.dto.ts |
| 1.4 | HMAC Signing | ✅ | ~400 | signing.service.ts, signing.guard.ts |
| 1.5 | Redis Cache | ✅ | ~200 | cache.module.ts, cache.service.ts |
| 1.6 | CI/CD Pipeline | ✅ | ~300 | ci.yml, cd-staging.yml, cd-production.yml |

---

## ✅ Волна 2: Backend + Frontend — ЗАВЕРШЕНА

**Выполнено: 5 агентов параллельно**

| # | Задача | Статус | LOC | Файлы |
|---|--------|--------|-----|-------|
| 2.1 | Legal Core Integration | ✅ | ~1000 | legal.module.ts, legal.controller.ts (12 endpoints), 6 DTOs |
| 2.2 | Ban Check МВД | ✅ | ~500 | mvd.client.ts (circuit breaker), ban-check.service.ts |
| 2.3 | Offline Queue & Sync | ✅ | ~600 | offlineQueue.ts, backgroundSync.ts, types.ts |
| 2.4 | UI Component Library | ✅ | ~1500 | Button, Card, Input, Modal, Sheet, Toast (8 компонентов) |
| 2.5 | Docker Production | ✅ | ~400 | docker-compose.prod.yml, nginx.conf |

---

## ✅ Волна 3: Frontend Dependencies — ЗАВЕРШЕНА

**Выполнено: 4 агента параллельно**

| # | Задача | Статус | LOC | Файлы |
|---|--------|--------|-----|-------|
| 3.1 | Recovery Page | ✅ | ~400 | app/(auth)/recovery/page.tsx |
| 3.2 | Reference Page | ✅ | ~500 | reference/page.tsx, CategoryList, LawCard, FormsList, FaqAccordion |
| 3.3 | Deep Links | ✅ | ~300 | lib/deepLinks.ts |
| 3.4 | Back Button | ✅ | ~150 | lib/backButton.ts, useBackButton.ts, usePreventBack.ts |

---

## ✅ Волна 4: Локализация — ЗАВЕРШЕНА (95%)

**Выполнено: 3 агента параллельно**

| # | Задача | Статус | Ключи |
|---|--------|--------|-------|
| 4.1 | English (en.json) | ✅ | 1708 |
| 4.2 | Uzbek/Tajik | ✅/⚠️ | 1708/1649 |
| 4.3 | Kyrgyz (ky.json) | ⚠️ | 1649 (-59) |

**Gap**: tg.json и ky.json не хватает 59 ключей (не критично).

---

## ✅ Волна 5: Тестирование — ЗАВЕРШЕНА

**Выполнено: 4 агента параллельно**

| # | Задача | Статус | Файлы |
|---|--------|--------|-------|
| 5.1 | BE Unit Tests | ✅ | 11 spec файлов |
| 5.2 | BE E2E Tests | ✅ | 4 e2e-spec файлов |
| 5.3 | FE Unit Tests | ⚠️ | 20+ тестов (нет sync/, ui/) |
| 5.4 | FE E2E Tests | ✅ | 7 Playwright specs |

---

## 🆕 Бонус: Exam Module — РЕАЛИЗОВАН

**Не было в плане, но реализован полностью**

| Компонент | Файлы |
|-----------|-------|
| Backend | exam.controller.ts, exam.service.ts, 3 data files, 3 DTOs |
| Frontend | ExamHome, QuestionCard, ResultsScreen, ExamSession, ProgressBar, CategoryCard |

---

## ⏳ Волна 6: Frontend-Backend Integration

**Готово к запуску: 5 агентов параллельно**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Агент 6.1   │ │ Агент 6.2   │ │ Агент 6.3   │
│ Auth Int.   │ │ Profile Int │ │ Legal Int   │
│ M: ~400 LOC │ │ M: ~500 LOC │ │ M: ~600 LOC │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐
│ Агент 6.4   │ │ Агент 6.5   │
│ BanCheck Int│ │ Exam Int    │
│ M: ~300 LOC │ │ M: ~400 LOC │
└─────────────┘ └─────────────┘
```

### Агент 6.1: Auth Integration

```
## Задача: Интеграция Auth с реальным API

## Контекст
Frontend использует mock auth. Нужно подключить реальный API.

## Цель
Заменить mock на реальные вызовы POST /auth/device, POST /auth/refresh.

## Шаги
1. Изучить текущий authStore и API client
2. Обновить lib/api/auth.ts:
   - registerDevice() -> POST /api/v1/auth/device
   - refreshToken() -> POST /api/v1/auth/refresh
   - verifyRecovery() -> POST /api/v1/auth/recovery/verify
3. Обновить authStore:
   - Сохранение токенов в secure storage
   - Auto-refresh при истечении
4. Обновить middleware для добавления токена
5. Тестирование auth flow

## Файлы для изменения
- apps/frontend/src/lib/api/auth.ts
- apps/frontend/src/lib/stores/authStore.ts
- apps/frontend/src/lib/api/client.ts

## Критерии готовности
- [ ] Device registration работает
- [ ] Token refresh работает
- [ ] Recovery verification работает
- [ ] Токены сохраняются безопасно
```

### Агент 6.2: Profile Integration

```
## Задача: Интеграция Profile с API

## Контекст
ProfileForm сохраняет в localStorage. Нужно синхронизировать с сервером.

## Цель
Подключить GET/PATCH /users/me, POST /users/onboarding/complete.

## Шаги
1. Создать lib/api/users.ts:
   - getProfile() -> GET /api/v1/users/me
   - updateProfile() -> PATCH /api/v1/users/me
   - completeOnboarding() -> POST /api/v1/users/onboarding/complete
   - calculateDeadlines() -> POST /api/v1/users/calculate
   - deleteAccount() -> DELETE /api/v1/users/account
2. Обновить profileStore для sync с API
3. Интеграция с offline queue (если offline — сохранить в очередь)
4. Обновить ProfileForm для использования API

## Файлы для создания
- apps/frontend/src/lib/api/users.ts

## Файлы для изменения
- apps/frontend/src/lib/stores/profileStore.ts
- apps/frontend/src/features/profile/components/ProfileForm.tsx
```

### Агент 6.3: Legal API Integration

```
## Задача: Интеграция Legal Reference с API

## Контекст
Reference page использует статичные данные. Нужно подключить API.

## Цель
Подключить все /legal/* endpoints.

## Шаги
1. Создать lib/api/legal.ts:
   - getMetadata() -> GET /legal/metadata
   - getCategories() -> GET /legal/categories
   - getCategoryById() -> GET /legal/categories/:id
   - getCategoryItems() -> GET /legal/categories/:id/items
   - getLaws() -> GET /legal/laws
   - getLawById() -> GET /legal/laws/:id
   - getForms() -> GET /legal/forms
   - getFormById() -> GET /legal/forms/:id
   - getFaq() -> GET /legal/faq
   - getPatentRegions() -> GET /legal/calculators/patent/regions
   - calculatePatent() -> POST /legal/calculators/patent
   - calculateStay() -> POST /legal/calculators/stay
2. Добавить React Query hooks для кэширования
3. Обновить Reference page components
4. Кэширование для offline доступа

## Файлы для создания
- apps/frontend/src/lib/api/legal.ts
- apps/frontend/src/hooks/useLegal.ts

## Файлы для изменения
- apps/frontend/src/features/reference/components/*.tsx
```

### Агент 6.4: Ban Check Integration

```
## Задача: Интеграция Ban Check с API

## Контекст
BanChecker компонент не подключен к реальному API.

## Цель
Подключить GET /utilities/ban-check.

## Шаги
1. Создать lib/api/utilities.ts:
   - checkBan() -> GET /utilities/ban-check
   - getPatentRegions() -> GET /utilities/patent/regions
2. Обновить BanChecker component
3. Добавить loading/error states
4. Кэширование результата (1 час)

## Файлы для создания
- apps/frontend/src/lib/api/utilities.ts

## Файлы для изменения
- apps/frontend/src/features/services/components/BanChecker.tsx
```

### Агент 6.5: Exam Integration

```
## Задача: Интеграция Exam с API

## Контекст
Exam feature использует локальные данные. Нужно подключить API.

## Цель
Подключить /exam/* endpoints.

## Шаги
1. Создать lib/api/exam.ts:
   - getCategories() -> GET /exam/categories
   - getQuestions() -> GET /exam/questions?category=X
   - submitAnswer() -> POST /exam/answer
   - getProgress() -> GET /exam/progress
2. Обновить ExamSession component
3. Сохранение прогресса на сервере
4. Offline режим (кэширование вопросов)

## Файлы для создания
- apps/frontend/src/lib/api/exam.ts

## Файлы для изменения
- apps/frontend/src/features/exam/components/*.tsx
```

---

## ⏳ Волна 7: Mobile & Production

**Запускается после Wave 6**

| # | Задача | LOC | Описание |
|---|--------|-----|----------|
| 7.1 | iOS Build | ~200 | Capacitor iOS, certificates, App Store prep |
| 7.2 | Android Build | ~200 | Capacitor Android, signing, Play Store prep |
| 7.3 | Push Notifications | ~500 | FCM/APNs backend + frontend integration |
| 7.4 | Production Deploy | ~300 | SSL certificates, domain, monitoring setup |
| 7.5 | App Store Assets | — | Screenshots, descriptions, metadata |

---

## ⏳ Волна 8: Polish & Monitoring

**Запускается после Wave 7**

| # | Задача | LOC | Описание |
|---|--------|-----|----------|
| 8.1 | Sentry Full | ~200 | FE + BE error tracking, source maps |
| 8.2 | Analytics | ~300 | User events, funnels, retention |
| 8.3 | Performance | ~400 | Bundle optimization, lazy loading |
| 8.4 | Security Audit | — | OWASP check, penetration testing |

---

## Сводная таблица

| Волна | Агентов | Статус | Время |
|-------|---------|--------|-------|
| 1 | 6 | ✅ Завершена | — |
| 2 | 5 | ✅ Завершена | — |
| 3 | 4 | ✅ Завершена | — |
| 4 | 3 | ✅ Завершена (95%) | — |
| 5 | 4 | ✅ Завершена | — |
| **6** | **5** | ⏳ Готова к запуску | ~2ч параллельно |
| 7 | 5 | ⏳ Ожидает Wave 6 | ~3ч параллельно |
| 8 | 4 | ⏳ Ожидает Wave 7 | ~2ч параллельно |

---

## Команды запуска Wave 6

```bash
# Терминал 1
claude "Выполни задачу Агента 6.1 (Auth Integration) из docs/EXECUTION_PLAN.md"

# Терминал 2
claude "Выполни задачу Агента 6.2 (Profile Integration) из docs/EXECUTION_PLAN.md"

# Терминал 3
claude "Выполни задачу Агента 6.3 (Legal Integration) из docs/EXECUTION_PLAN.md"

# Терминал 4
claude "Выполни задачу Агента 6.4 (Ban Check Integration) из docs/EXECUTION_PLAN.md"

# Терминал 5
claude "Выполни задачу Агента 6.5 (Exam Integration) из docs/EXECUTION_PLAN.md"
```

---

## Оставшиеся gaps (не критичные)

| Gap | Приоритет | Волна |
|-----|-----------|-------|
| tg.json -59 ключей | Низкий | 4 (доделать) |
| ky.json -59 ключей | Низкий | 4 (доделать) |
| Тесты lib/sync/ | Средний | 5 (доделать) |
| Тесты components/ui/ | Средний | 5 (доделать) |
| useDeepLinks hook | Средний | 3 (доделать) |

---

*Обновлено: 2026-01-28*
*Версия: 2.0*
