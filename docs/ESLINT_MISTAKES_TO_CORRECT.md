# ESLint Mistakes to Correct

> Список ошибок линтера в проекте frontend. Все ошибки — code quality warnings, не влияют на работоспособность приложения.

## Статистика

| Категория | Количество | Критичность |
|-----------|------------|-------------|
| `no-unused-vars` | 45 | Низкая |
| `no-explicit-any` | 22 | Низкая |
| `no-require-imports` | 3 | Низкая |
| `no-var` | 2 | Низкая |
| `no-img-element` | 1 | Низкая |
| **Всего** | **~85** | — |

---

## 1. Неиспользуемые переменные (`@typescript-eslint/no-unused-vars`)

### Тесты

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `__tests__/components/ErrorBoundary.test.tsx` | 94 | `rerender` | Удалить или использовать |
| `__tests__/components/ui/LanguageSwitcher.test.tsx` | 3 | `LANGUAGES` | Удалить импорт |
| `__tests__/features/documents/document-status.test.ts` | 17 | `DocumentStatus` | Удалить импорт |
| `__tests__/features/documents/patent-validation.test.ts` | 23 | `PatentData` | Удалить импорт |
| `__tests__/features/documents/registration-validation.test.ts` | 239 | `type` | Удалить или использовать |
| `__tests__/features/status/legal-status.test.ts` | 48 | `today` | Удалить или использовать |
| `__tests__/lib/api/client.test.ts` | 56 | `tokenStorage` | Удалить или использовать |
| `tests/hooks/usePushNotifications.test.ts` | 24 | `originalWindow` | Удалить или использовать |
| `tests/hooks/useServiceWorker.test.ts` | 16 | `originalWindow` | Удалить или использовать |

### App Pages

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `app/(auth)/welcome/page.tsx` | 9 | `MISSION_ICONS` | Удалить или использовать |
| ~~`app/(main)/documents/page.tsx`~~ | ~~55~~ | ~~`selectedType`~~ | ✅ Исправлено (2026-01-25) |
| `app/(main)/services/page.tsx` | 5 | `FileText`, `Briefcase`, `Home`, `CreditCard` | Удалить импорты |

### Components

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `components/prototype/dashboard/HomeScreen.tsx` | 3 | `QrCode`, `Rocket`, `FileText`, `AlertTriangle`, `CreditCard`, `Grid3x3` | Удалить импорты |
| `components/prototype/dashboard/ServicesScreen.tsx` | 3 | `Plus` | Удалить импорт |
| `components/prototype/services/DocumentGenerator.tsx` | 4, 182 | `Home`, `Briefcase`, `FileCheck`, `Plus`, `FIELD_LABELS` | Удалить |
| `components/prototype/wizard/LegalizationWizard.tsx` | 215, 496, 833 | `additionalDocuments`, `renderQuickSelect`, `renderDataIntake` | Удалить или использовать |

### Features - Documents

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `features/documents/components/DocumentCard.tsx` | 14 | `DocumentStatus` | Удалить импорт |
| `features/documents/components/DocumentWizard.tsx` | 7, 10, 31, 33 | `FORMS_REGISTRY`, `getFormById`, `pdfGenerated`, `errors` | Удалить |
| `features/documents/components/DocumentsList.tsx` | 3, 12, 64 | `useEffect`, `ChevronDown`, `onDeleteDocument` | Удалить |
| ~~`features/documents/components/PatentForm.tsx`~~ | ~~8~~ | ~~`PATENT_REGIONS`, `calculateMonthlyPayment`~~ | ✅ Исправлено |
| `features/documents/formsRegistry.ts` | 1 | `z` | Удалить импорт |
| `features/documents/pdfGenerator.ts` | 2 | `FormDefinition` | Удалить импорт |
| `features/documents/sampleData/patentSamples.ts` | 48 | `_language` | Использовать или убрать параметр |

### Features - Payments

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `features/payments/components/PatentPayment.tsx` | 4, 7, 27, 50 | `Smartphone`, `calculateMonthlyPayment`, `isProcessing`, `sbpLink` | Удалить |
| `features/payments/patentPayment.ts` | 40 | `merchantId` | Удалить или использовать |

### Features - Other

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `features/profile/components/ProfileForm.tsx` | 98 | `imageUri` | Удалить |
| `features/services/components/MapScreen.tsx` | 4, 23 | `ChevronRight`, `selectedPOI`, `setSelectedPOI` | Удалить |
| `features/services/hooks/useStayPeriods.ts` | 153 | `userId` | Удалить или использовать |
| `features/services/poi.ts` | 190 | `lat`, `lng` | Удалить или использовать |

### Lib

| Файл | Строка | Переменная | Действие |
|------|--------|------------|----------|
| `lib/stores/profileStore.ts` | 95 | `get` | Удалить |

---

## 2. Использование `any` (`@typescript-eslint/no-explicit-any`)

### Тесты

| Файл | Строки |
|------|--------|
| `__tests__/features/documents/helpers/dataGenerator.ts` | 49, 100, 110 |
| `__tests__/features/documents/pdfGenerator.test.ts` | 316, 317, 318, 453, 454, 455 |
| `tests/hooks/useNotifications.test.tsx` | 167, 189, 236 |

### App Pages

| Файл | Строки |
|------|--------|
| `app/(auth)/auth/method/page.tsx` | 18, 19 |
| `app/(auth)/auth/phone/page.tsx` | 70, 71 |
| `app/(main)/profile/page.tsx` | 16 |
| `app/(main)/services/page.tsx` | 19 |

### Components

| Файл | Строки |
|------|--------|
| `components/prototype/wizard/LegalizationWizard.tsx` | 36, 1036 |

### Features

| Файл | Строки |
|------|--------|
| `features/documents/components/DocumentWizard.tsx` | 19, 29, 47 |
| `features/documents/formsRegistry.ts` | 170 |
| `features/documents/pdfGenerator.ts` | 6, 7 |
| `features/profile/components/ProfileForm.tsx` | 98 |

### Lib

| Файл | Строки |
|------|--------|
| `lib/constants/documents.ts` | 129 |

---

## 3. `require()` вместо `import` (`@typescript-eslint/no-require-imports`)

| Файл | Строка | Исправление |
|------|--------|-------------|
| `__tests__/components/ErrorBoundary.test.tsx` | 65 | Заменить на `import` |
| `__tests__/components/ui/LanguageSwitcher.test.tsx` | 12 | Заменить на `import` |
| `__tests__/features/documents/pdfGenerator.test.ts` | 113 | Заменить на `import` |

---

## 4. `var` вместо `let/const` (`no-var`)

| Файл | Строки | Исправление |
|------|--------|-------------|
| `__tests__/lib/api/client.test.ts` | 17, 22 | Заменить `var` на `let` или `const` |

---

## 5. `<img>` вместо `<Image>` (`@next/next/no-img-element`)

| Файл | Строка | Исправление |
|------|--------|-------------|
| `features/profile/components/PassportScanner.tsx` | 197 | Использовать `next/image` |

---

## Быстрое исправление

### Автоматическое удаление неиспользуемых импортов

```bash
cd apps/frontend
npx eslint --fix src/
```

> Примечание: `--fix` исправит только часть ошибок (форматирование). Неиспользуемые переменные нужно удалять вручную.

### Приоритет исправления

1. **Высокий**: `no-explicit-any` — может скрывать баги
2. **Средний**: `no-unused-vars` — мёртвый код увеличивает bundle
3. **Низкий**: остальные — стилистические

---

## Команды для проверки

```bash
# Запуск линтера
cd apps/frontend && npm run lint

# Проверка только определённых файлов
npx next lint --file src/features/documents/

# TypeScript проверка
npm run typecheck
```

---

## 6. Ошибки типов в тестах (`TypeScript`)

> Эти ошибки не блокируют тесты (все 685 проходят), но нарушают strict типизацию.

| Файл | Строки | Ошибка | Исправление |
|------|--------|--------|-------------|
| `__tests__/features/calculator/stay-calculator.test.ts` | 472, 492, 512, 532 | `Type 'null' is not assignable to type 'Date'` | Использовать `undefined` или сделать поле опциональным |
| `__tests__/features/calculator/stay-calculator.test.ts` | 473, 493, 513, 533 | `Type 'null' is not assignable to type 'number'` | Использовать `undefined` или сделать поле опциональным |
| `__tests__/features/calculator/stay-calculator.test.ts` | 553 | `'windowStart' does not exist in type 'StayCalculation'` | Удалить свойство или добавить в интерфейс |

**Решение:** Обновить интерфейс `StayCalculation` — сделать `nextResetDate` и `daysUntilReset` опциональными (`Date | null` и `number | null`).

---

## 7. Проблемы локализации (`i18n`)

> Не все переводы присутствуют во всех языках. Критично для EN.

### Статистика покрытия

| Локаль | Всего ключей | Отсутствует | Покрытие | Статус |
|--------|-------------|-----------|---------|--------|
| **RU** | 1183 | — | 100% | ✅ Baseline |
| **EN** | 124 | **1059** | 10.5% | 🔴 Критично |
| **KY** | 1183 | 0 | 100% | 🟡 150 не переведено |
| **TG** | 1173 | **10** | 99.2% | 🟡 Средне |
| **UZ** | 1183 | 0 | 100% | 🟢 7 не переведено |

### EN.JSON — требует полной переработки

**Отсутствующие секции (примеры):**
- `assistant.*`
- `audit.*`
- `auth.otp.*`, `auth.phone.*`, `auth.telegram.*`
- `dashboard.*` (частично)
- `documents.*` (частично)
- `legal.*`
- `onboarding.*`
- `payment.*`
- `profile.*`
- ...и ~1000 других ключей

### TG.JSON — отсутствуют 10 ключей

```
services.calculator.deportationMode.consequences.bank
services.calculator.deportationMode.consequences.leave
services.calculator.deportationMode.consequences.license
services.calculator.deportationMode.consequences.marriage
services.calculator.deportationMode.consequences.vehicle
services.calculator.deportationMode.consequences.work
services.calculator.deportationMode.description
services.calculator.deportationMode.subtitle
services.calculator.deportationMode.title
services.calculator.deportationMode.warning
```

### Приоритет исправления

1. 🔴 **Срочно**: EN.JSON — добавить ~1000 переводов
2. 🟡 **Важно**: TG.JSON — добавить 10 новых ключей
3. 🟢 **Желательно**: KY.JSON — перевести названия городов (150 ключей)
4. 🟢 **Желательно**: UZ.JSON — перевести 7 оставшихся ключей

---

*Создано: 2026-01-25*
*Обновлено: 2026-01-25*
