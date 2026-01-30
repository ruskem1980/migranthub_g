# Оркестратор задач исправления

**Дата:** 2026-01-30
**Всего задач:** 8
**Порядок:** Последовательный (каждая задача в новом контекстном окне)

---

## Общие правила

1. Каждая задача выполняется в **новом контекстном окне**
2. После завершения задачи — **git commit**
3. Не изменять функционал — только исправления
4. Сохранять существующие паттерны кода

---

## ЗАДАЧА 1: Создание страницы AI ассистента

### Контекст
Компонент `AIChatPanel.tsx` существует, но страница `/ai` не создана.

### Цель
Создать страницу `/ai` которая отображает AI чат-бот.

### Шаги
1. Создать файл `apps/frontend/src/app/(main)/ai/page.tsx`
2. Импортировать и использовать компонент `AIChatPanel` из `@/components/assistant/AIChatPanel`
3. Добавить заголовок страницы и обёртку
4. Проверить что страница доступна

### Файлы
- **Создать:** `apps/frontend/src/app/(main)/ai/page.tsx`
- **Читать:** `apps/frontend/src/components/assistant/AIChatPanel.tsx`

### Код страницы
```tsx
'use client';

import { AIChatPanel } from '@/components/assistant/AIChatPanel';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AIChatPanel />
    </div>
  );
}
```

### Критерии готовности
- [ ] Файл создан
- [ ] Страница открывается по адресу /ai
- [ ] Чат-бот отображается и работает
- [ ] npm run build проходит без ошибок

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "feat(frontend): add AI assistant page /ai"
```

---

## ЗАДАЧА 2: Создание страницы FAQ / Ваши права

### Контекст
Компонент `FAQModal.tsx` существует с 22 вопросами на 5 языках. Нужна страница.

### Цель
Создать страницу `/faq` для отображения типовых вопросов.

### Шаги
1. Создать файл `apps/frontend/src/app/(main)/faq/page.tsx`
2. Адаптировать `FAQModal` для использования как страницы (без модального окна)
3. Добавить навигацию назад

### Файлы
- **Создать:** `apps/frontend/src/app/(main)/faq/page.tsx`
- **Читать:** `apps/frontend/src/components/prototype/services/FAQModal.tsx`

### Критерии готовности
- [ ] Страница создана
- [ ] FAQ отображается с категориями
- [ ] Поиск работает
- [ ] Все 5 языков поддерживаются

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "feat(frontend): add FAQ page /faq"
```

---

## ЗАДАЧА 3: Обновление UsefulSection — исправление ссылок

### Контекст
В `UsefulSection.tsx` ссылки ведут на `/ai` и `/rights`. Нужно обновить на созданные страницы.

### Цель
Исправить ссылки в UsefulSection и добавить кнопку FAQ.

### Шаги
1. Открыть `apps/frontend/src/components/anonymous/UsefulSection.tsx`
2. Заменить `/rights` на `/faq`
3. Проверить что `/ai` работает
4. Добавить новую кнопку FAQ если нужно

### Файлы
- **Изменить:** `apps/frontend/src/components/anonymous/UsefulSection.tsx`

### Критерии готовности
- [ ] Ссылка на AI работает
- [ ] Ссылка на FAQ работает
- [ ] Все кнопки в секции кликабельны

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "fix(frontend): update UsefulSection links to AI and FAQ"
```

---

## ЗАДАЧА 4: Добавление ключей локализации для навигации

### Контекст
В `BottomNavigation.tsx` используются ключи `nav.checklist`, `nav.checks`, `nav.sos`, `nav.login`, которые отсутствуют в файлах локализации.

### Цель
Добавить отсутствующие ключи во все 5 файлов локализации.

### Шаги
1. Открыть все файлы локализации:
   - `apps/frontend/src/locales/ru.json`
   - `apps/frontend/src/locales/en.json`
   - `apps/frontend/src/locales/uz.json`
   - `apps/frontend/src/locales/tg.json`
   - `apps/frontend/src/locales/ky.json`
2. Найти секцию `nav`
3. Добавить ключи:
   - `nav.checklist`
   - `nav.checks`
   - `nav.sos`
   - `nav.login`

### Переводы

**ru.json:**
```json
"nav": {
  "checklist": "Чек-лист",
  "checks": "Проверки",
  "sos": "SOS",
  "login": "Войти"
}
```

**en.json:**
```json
"nav": {
  "checklist": "Checklist",
  "checks": "Checks",
  "sos": "SOS",
  "login": "Login"
}
```

**uz.json:**
```json
"nav": {
  "checklist": "Roʻyxat",
  "checks": "Tekshirish",
  "sos": "SOS",
  "login": "Kirish"
}
```

**tg.json:**
```json
"nav": {
  "checklist": "Рӯйхат",
  "checks": "Санҷиш",
  "sos": "SOS",
  "login": "Даромадан"
}
```

**ky.json:**
```json
"nav": {
  "checklist": "Тизме",
  "checks": "Текшерүү",
  "sos": "SOS",
  "login": "Кирүү"
}
```

### Критерии готовности
- [ ] Все 4 ключа добавлены в ru.json
- [ ] Все 4 ключа добавлены в en.json
- [ ] Все 4 ключа добавлены в uz.json
- [ ] Все 4 ключа добавлены в tg.json
- [ ] Все 4 ключа добавлены в ky.json
- [ ] Навигация отображает текст вместо ключей

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "fix(i18n): add missing nav localization keys"
```

---

## ЗАДАЧА 5: Добавление ключей локализации для Patent Calculator

### Контекст
В `PatentCalculatorModal.tsx` используется ~17 ключей `services.patentCalculator.*`, которые отсутствуют.

### Цель
Добавить все отсутствующие ключи калькулятора патента.

### Шаги
1. Открыть `apps/frontend/src/components/prototype/services/PatentCalculatorModal.tsx`
2. Найти все используемые ключи `t('services.patentCalculator.*')`
3. Добавить переводы во все 5 файлов локализации

### Ключи для добавления
```
services.patentCalculator.title
services.patentCalculator.subtitle
services.patentCalculator.selectRegion
services.patentCalculator.chooseRegion
services.patentCalculator.monthlyRate
services.patentCalculator.numberOfMonths
services.patentCalculator.calculating
services.patentCalculator.calculate
services.patentCalculator.totalAmount
services.patentCalculator.region
services.patentCalculator.baseRate
services.patentCalculator.coefficient
services.patentCalculator.monthlyPayment
services.patentCalculator.period
services.patentCalculator.infoNote
services.patentCalculator.loadError
services.patentCalculator.calcError
```

### Переводы (ru)
```json
"patentCalculator": {
  "title": "Калькулятор патента",
  "subtitle": "Рассчитайте стоимость патента",
  "selectRegion": "Выберите регион",
  "chooseRegion": "Выбрать регион",
  "monthlyRate": "Ежемесячный платеж",
  "numberOfMonths": "Количество месяцев",
  "calculating": "Расчет...",
  "calculate": "Рассчитать",
  "totalAmount": "Итого к оплате",
  "region": "Регион",
  "baseRate": "Базовая ставка",
  "coefficient": "Коэффициент",
  "monthlyPayment": "Ежемесячный платеж",
  "period": "Период",
  "infoNote": "Данные актуальны на текущую дату. Уточняйте информацию в МВД.",
  "loadError": "Ошибка загрузки данных",
  "calcError": "Ошибка расчета"
}
```

### Критерии готовности
- [ ] Все 17 ключей добавлены в ru.json
- [ ] Все 17 ключей добавлены в en.json
- [ ] Все 17 ключей добавлены в uz.json
- [ ] Все 17 ключей добавлены в tg.json
- [ ] Все 17 ключей добавлены в ky.json
- [ ] Калькулятор патента отображает текст вместо ключей

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "fix(i18n): add patentCalculator localization keys"
```

---

## ЗАДАЧА 6: Добавление ключей локализации для Patent Check

### Контекст
В `PatentCheckModal.tsx` используется ~33 ключа `services.patentCheck.*`, которые отсутствуют.

### Цель
Добавить все отсутствующие ключи проверки патента.

### Шаги
1. Открыть `apps/frontend/src/components/prototype/services/PatentCheckModal.tsx`
2. Найти все используемые ключи
3. Добавить переводы во все 5 файлов локализации

### Ключи для добавления
Смотри файл `AUDIT_ISSUES.md` — секция "Проверка патента"

### Критерии готовности
- [ ] Все 33 ключа добавлены во все файлы локализации
- [ ] Проверка патента отображает текст вместо ключей

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "fix(i18n): add patentCheck localization keys"
```

---

## ЗАДАЧА 7: Исправление hardcoded текстов

### Контекст
В нескольких компонентах используются hardcoded русские тексты вместо ключей локализации.

### Цель
Заменить hardcoded тексты на ключи t().

### Файлы для проверки
1. `apps/frontend/src/components/anonymous/CalculatorsSection.tsx` — строка 22
2. `apps/frontend/src/components/anonymous/UsefulSection.tsx` — строки 20, 23, 24, 35, 36, 58, 59
3. `apps/frontend/src/components/anonymous/AnonymousDashboard.tsx` — строки 28-32

### Критерии готовности
- [ ] Hardcoded тексты заменены на t()
- [ ] Соответствующие ключи добавлены в файлы локализации
- [ ] Приложение работает на всех 5 языках

### После завершения
```bash
npm run typecheck && npm run build
git add -A && git commit -m "fix(i18n): replace hardcoded texts with translation keys"
```

---

## ЗАДАЧА 8: Финальная проверка и тестирование

### Контекст
После всех исправлений нужно проверить что всё работает.

### Цель
Провести полное тестирование приложения.

### Шаги
1. Запустить `npm run build` — проверить отсутствие ошибок
2. Запустить `npm run dev` — проверить работу
3. Проверить каждую страницу:
   - `/` — главная
   - `/ai` — AI ассистент
   - `/faq` — FAQ
   - `/checks` — проверки
   - `/calculator` — калькулятор
   - `/exam` — экзамен
   - `/checklist` — чек-лист
   - `/sos` — SOS
4. Переключить языки и проверить переводы
5. Проверить навигацию

### Критерии готовности
- [ ] Build проходит без ошибок
- [ ] Все страницы открываются
- [ ] Все тексты локализованы (нет ключей на экране)
- [ ] Навигация работает
- [ ] AI чат работает
- [ ] FAQ открывается и фильтруется

### После завершения
```bash
git add -A && git commit -m "chore: complete audit fixes verification"
```

---

## Прогресс

| # | Задача | Статус | Коммит |
|---|--------|--------|--------|
| 1 | Страница AI | ⏳ Ожидает | - |
| 2 | Страница FAQ | ⏳ Ожидает | - |
| 3 | UsefulSection ссылки | ⏳ Ожидает | - |
| 4 | nav.* ключи | ⏳ Ожидает | - |
| 5 | patentCalculator.* ключи | ⏳ Ожидает | - |
| 6 | patentCheck.* ключи | ⏳ Ожидает | - |
| 7 | Hardcoded тексты | ⏳ Ожидает | - |
| 8 | Финальная проверка | ⏳ Ожидает | - |

---

## Как использовать

1. Открыть новое контекстное окно Claude
2. Скопировать содержимое нужной задачи
3. Выполнить задачу
4. Сделать commit
5. Обновить статус в этом файле
6. Перейти к следующей задаче
