# MigrantHub: План реализации UX/UI улучшений

> **Основан на:** [usability.md](./usability.md)
> **Дата:** 30 января 2026

---

## Инструкция по использованию

1. Выполняйте задачи **последовательно** в рамках каждой фазы
2. Задачи внутри фазы можно выполнять **параллельно** (если не указано иное)
3. После каждой задачи запускайте указанную команду тестирования
4. Переходите к следующей фазе только после завершения текущей

---

# ФАЗА 1: QUICK WINS (1-2 дня)

## Задача 1.1: Улучшение Bottom Navigation

**Оценка:** 1 файл, ~50 строк

### Промпт для агента:

```
## Задача: Улучшение Bottom Navigation

## Контекст
Текущая навигация в DashboardLayout.tsx использует неинтуитивные иконки
(ShieldCheck, Wallet, LayoutGrid) которые непонятны целевой аудитории —
трудовым мигрантам с базовым техническим уровнем.

## Цель
Сделать нижнюю навигацию понятнее:
1. Заменить иконки на более интуитивные
2. Сделать текстовые подписи всегда видимыми (не только при активации)
3. Увеличить размер текста подписей

## Файлы для изменения
- apps/frontend/src/components/prototype/DashboardLayout.tsx

## Шаги
1. Прочитай файл DashboardLayout.tsx
2. Замени иконки в массиве tabs:
   - home: ShieldCheck → Home (из lucide-react)
   - documents: Wallet → FolderOpen
   - services: LayoutGrid → Wrench
   - assistant: Bot → MessageCircle
   - sos: Siren → AlertTriangle (оставить красным)
3. Убери условное отображение текста — подписи должны быть всегда видны
4. Увеличь размер текста с text-xs до text-sm
5. Добавь font-medium ко всем подписям

## Критерии готовности
- [ ] Все 5 иконок заменены
- [ ] Текст подписей виден всегда (не только при active)
- [ ] Размер текста увеличен
- [ ] Приложение компилируется без ошибок

## После завершения
cd apps/frontend && npm run build && npm run dev
# Проверь визуально навигацию на localhost:3000/dashboard
```

---

## Задача 1.2: Семантическая цветовая система

**Оценка:** 1 файл, ~30 строк

### Промпт для агента:

```
## Задача: Добавить CSS-переменные для семантических цветов

## Контекст
Сейчас в приложении используются произвольные градиенты и цвета.
Нужно ввести семантическую цветовую систему для консистентности.

## Цель
Добавить CSS-переменные для семантических цветов в globals.css

## Файлы для изменения
- apps/frontend/src/app/globals.css

## Шаги
1. Прочитай файл globals.css
2. Добавь в :root секцию новые переменные:

```css
/* Semantic colors */
--color-success: 142 76% 36%;      /* Зелёный - безопасно/готово */
--color-success-light: 142 76% 95%;
--color-warning: 45 93% 47%;       /* Жёлтый - внимание */
--color-warning-light: 45 93% 95%;
--color-danger: 0 84% 60%;         /* Красный - срочно/опасно */
--color-danger-light: 0 84% 95%;
--color-info: 208 100% 50%;        /* Синий - информация */
--color-info-light: 208 100% 95%;
```

3. Добавь соответствующие классы в Tailwind (если используется extend)

## Критерии готовности
- [ ] Переменные добавлены в globals.css
- [ ] Нет ошибок CSS
- [ ] Приложение компилируется

## После завершения
cd apps/frontend && npm run build
```

---

## Задача 1.3: Группировка документов в чеклисте

**Оценка:** 1 файл, ~100 строк

### Промпт для агента:

```
## Задача: Группировка документов по уровням

## Контекст
В HomeScreen.tsx (строки 642-694) чеклист из 11 документов показывается
плоским списком без группировки. Пользователю непонятна иерархия важности.

## Цель
Разбить документы на логические группы с заголовками:
- ОСНОВА (паспорт)
- ВЪЕЗД И ПРЕБЫВАНИЕ (миг.карта, регистрация)
- РАБОТА (патент, контракт, грин-карта, образование)
- ПОДДЕРЖКА (ИНН, СНИЛС, страховка, чеки, семья)

## Файлы для изменения
- apps/frontend/src/components/prototype/dashboard/HomeScreen.tsx

## Шаги
1. Прочитай HomeScreen.tsx, найди секцию Document Checklist (~строка 638)
2. Реорганизуй массив документов в группы:

```tsx
const documentGroups = [
  {
    title: t('documents.groups.foundation'),
    docs: [{ id: 'passport', label: `🛂 ${t('documents.types.passport')}` }]
  },
  {
    title: t('documents.groups.entry'),
    docs: [
      { id: 'mig_card', label: `🎫 ${t('documents.types.migCard')}` },
      { id: 'registration', label: `📋 ${t('documents.types.registration')}` },
    ]
  },
  {
    title: t('documents.groups.work'),
    docs: [
      { id: 'patent', label: `📄 ${t('documents.types.patent')}` },
      { id: 'contract', label: `📝 ${t('documents.types.contract')}` },
      { id: 'green_card', label: `💳 ${t('documents.types.greenCard')}` },
      { id: 'education', label: `🎓 ${t('documents.types.education')}` },
    ]
  },
  {
    title: t('documents.groups.support'),
    docs: [
      { id: 'inn', label: `🔢 ${t('documents.types.inn')}` },
      { id: 'insurance', label: `🩺 ${t('documents.types.insurance')}` },
      { id: 'receipts', label: `🧾 ${t('documents.types.receipts')}` },
      { id: 'family', label: `💍 ${t('documents.types.family')}` },
    ]
  },
];
```

3. Обнови JSX для отображения групп с заголовками
4. Добавь визуальное разделение между группами (border-t или margin)

## Критерии готовности
- [ ] Документы разбиты на 4 группы
- [ ] Каждая группа имеет заголовок
- [ ] Визуальное разделение между группами
- [ ] Функционал чекбоксов работает как прежде

## После завершения
cd apps/frontend && npm run build && npm run dev
# Открой профиль и проверь чеклист документов
```

---

## Задача 1.4: Упрощение Hero-секции

**Оценка:** 1 файл, ~150 строк

### Промпт для агента:

```
## Задача: Упростить Hero-секцию на главном экране

## Контекст
Текущая Hero-секция в HomeScreen.tsx содержит 4 кнопки со сложными
градиентами, что создаёт визуальный шум. Нужно упростить до 2-х
главных действий + сетка из 4 простых кнопок.

## Цель
Редизайн Hero-секции:
1. Оставить 2 главные кнопки (Легализация + Проверка запрета)
2. Убрать сложные градиенты, использовать solid colors
3. Перенести Калькулятор и Заявления в простую сетку ниже

## Файлы для изменения
- apps/frontend/src/components/prototype/dashboard/HomeScreen.tsx

## Шаги
1. Прочитай HomeScreen.tsx, найди Hero Section (~строка 189)
2. Упрости стили главных кнопок:
   - Легализация: bg-blue-600 (без градиента)
   - Проверка запрета: bg-amber-500 (без градиента)
3. Убери декоративные элементы (круги, backdrop-blur)
4. Для второстепенных кнопок (Калькулятор, Заявления) создай простую сетку:

```tsx
{/* Secondary Actions */}
<div className="grid grid-cols-4 gap-2 mt-4">
  <button className="flex flex-col items-center p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300">
    <Calculator className="w-6 h-6 text-teal-600 mb-1" />
    <span className="text-xs text-gray-700">{t('services.items.calculator.title')}</span>
  </button>
  {/* ... остальные кнопки */}
</div>
```

5. Убери hover-эффекты с opacity transition (слишком сложно)

## Критерии готовности
- [ ] 2 главные кнопки с solid colors
- [ ] Второстепенные кнопки в простой сетке
- [ ] Убраны сложные градиенты и декоративные элементы
- [ ] Визуально чище и понятнее

## После завершения
cd apps/frontend && npm run build && npm run dev
# Проверь главный экран на localhost:3000/dashboard
```

---

## Задача 1.5: Добавить переводы для групп документов

**Оценка:** 4 файла, ~20 строк каждый

### Промпт для агента:

```
## Задача: Добавить i18n ключи для групп документов

## Контекст
После задачи 1.3 нужны переводы для заголовков групп документов.

## Цель
Добавить переводы для documents.groups.* на все 4 языка

## Файлы для изменения
- apps/frontend/src/lib/i18n/locales/ru.json
- apps/frontend/src/lib/i18n/locales/en.json
- apps/frontend/src/lib/i18n/locales/uz.json
- apps/frontend/src/lib/i18n/locales/ky.json

## Шаги
1. Прочитай один из файлов локализации
2. Найди секцию "documents"
3. Добавь в каждый файл:

Для ru.json:
```json
"documents": {
  "groups": {
    "foundation": "ОСНОВА",
    "entry": "ВЪЕЗД И ПРЕБЫВАНИЕ",
    "work": "РАБОТА",
    "support": "ПОДДЕРЖКА"
  }
}
```

Для en.json:
```json
"documents": {
  "groups": {
    "foundation": "FOUNDATION",
    "entry": "ENTRY & STAY",
    "work": "WORK",
    "support": "SUPPORT"
  }
}
```

Для uz.json:
```json
"documents": {
  "groups": {
    "foundation": "ASOS",
    "entry": "KIRISH VA TURISH",
    "work": "ISH",
    "support": "QO'LLAB-QUVVATLASH"
  }
}
```

Для ky.json:
```json
"documents": {
  "groups": {
    "foundation": "НЕГИЗ",
    "entry": "КИРҮҮ ЖАНА ТУРУШУ",
    "work": "ИШ",
    "support": "КОЛДОО"
  }
}
```

## Критерии готовности
- [ ] Все 4 файла локализации обновлены
- [ ] Ключи идентичны во всех файлах
- [ ] JSON валиден (нет синтаксических ошибок)

## После завершения
cd apps/frontend && npm run build
# Переключи язык в приложении и проверь отображение групп
```

---

# ФАЗА 2: UX IMPROVEMENTS (3-5 дней)

## Задача 2.1: Компонент ProgressRoadmap

**Оценка:** 1 новый файл, ~150 строк

### Промпт для агента:

```
## Задача: Создать компонент визуализации прогресса легализации

## Контекст
Пользователь не видит свой "путь легализации". Нужен визуальный
roadmap, показывающий какие документы есть и каких не хватает.

## Цель
Создать переиспользуемый компонент ProgressRoadmap

## Файлы для создания
- apps/frontend/src/components/ui/ProgressRoadmap.tsx

## Шаги
1. Создай новый компонент:

```tsx
'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface RoadmapStep {
  id: string;
  label: string;
  completed: boolean;
  current?: boolean;
}

interface ProgressRoadmapProps {
  steps: RoadmapStep[];
  className?: string;
}

export function ProgressRoadmap({ steps, className }: ProgressRoadmapProps) {
  const { t } = useTranslation();
  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn('bg-white rounded-2xl p-4 border-2 border-gray-100', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          {t('progress.title')}
        </h3>
        <span className="text-sm text-gray-500">
          {progress}% ({completedCount}/{steps.length})
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-4">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            {/* Connector line */}
            {index > 0 && (
              <div className={cn(
                'absolute h-0.5 w-full -left-1/2',
                steps[index - 1].completed ? 'bg-green-500' : 'bg-gray-200'
              )} />
            )}

            {/* Step circle */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center relative z-10',
              step.completed
                ? 'bg-green-500 text-white'
                : step.current
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-400'
            )}>
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'text-xs mt-1 text-center max-w-[60px]',
              step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

2. Экспортируй из index файла (если есть)

## Критерии готовности
- [ ] Компонент создан и компилируется
- [ ] Принимает массив шагов с completed/current
- [ ] Показывает процент и прогресс-бар
- [ ] Визуально понятная цепочка шагов

## После завершения
cd apps/frontend && npm run build
# Компонент будет использован в следующей задаче
```

---

## Задача 2.2: Интеграция ProgressRoadmap в HomeScreen

**Оценка:** 1 файл, ~50 строк

### Промпт для агента:

```
## Задача: Добавить ProgressRoadmap на главный экран

## Контекст
Компонент ProgressRoadmap создан в задаче 2.1.
Теперь нужно интегрировать его в HomeScreen.

## Зависимости
- Задача 2.1 должна быть выполнена

## Цель
Показать прогресс легализации на главном экране

## Файлы для изменения
- apps/frontend/src/components/prototype/dashboard/HomeScreen.tsx

## Шаги
1. Импортируй компонент:
```tsx
import { ProgressRoadmap } from '@/components/ui/ProgressRoadmap';
```

2. Создай массив шагов на основе checkedDocs:
```tsx
const roadmapSteps = useMemo(() => [
  { id: 'passport', label: t('documents.types.passport'), completed: checkedDocs.includes('passport') },
  { id: 'mig_card', label: t('documents.types.migCard'), completed: checkedDocs.includes('mig_card') },
  { id: 'registration', label: t('documents.types.registration'), completed: checkedDocs.includes('registration') },
  { id: 'patent', label: t('documents.types.patent'), completed: checkedDocs.includes('patent') },
  { id: 'inn', label: t('documents.types.inn'), completed: checkedDocs.includes('inn') },
  { id: 'insurance', label: t('documents.types.insurance'), completed: checkedDocs.includes('insurance') },
], [checkedDocs, t]);
```

3. Добавь компонент после Hero Section:
```tsx
{/* Progress Roadmap */}
<div className="px-4 mt-4">
  <ProgressRoadmap steps={roadmapSteps} />
</div>
```

## Критерии готовности
- [ ] Компонент отображается на главном экране
- [ ] Прогресс обновляется при изменении checkedDocs
- [ ] Визуально корректно на мобильных устройствах

## После завершения
cd apps/frontend && npm run dev
# Открой dashboard, отметь документы в профиле, проверь обновление roadmap
```

---

## Задача 2.3: Wizard для формы паспорта (Шаг 1 — Структура)

**Оценка:** 1 файл, ~200 строк

### Промпт для агента:

```
## Задача: Создать Wizard-обёртку для формы паспорта

## Контекст
Текущая PassportForm показывает все 15+ полей одновременно.
Нужно разбить на 4 шага для лучшего UX.

## Цель
Создать компонент PassportWizard с пошаговым вводом

## Файлы для создания
- apps/frontend/src/features/documents/components/PassportWizard.tsx

## Шаги
1. Создай компонент с 4 шагами:

```tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passportSchema, type PassportFormData } from '../schemas/passport.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';

const STEPS = [
  { id: 'personal', fields: ['lastName', 'firstName', 'middleName', 'birthDate', 'gender'] },
  { id: 'passport', fields: ['passportNumber', 'passportSeries', 'citizenship'] },
  { id: 'dates', fields: ['issueDate', 'expiryDate', 'issuedBy'] },
  { id: 'additional', fields: ['birthPlace', 'lastNameLatin', 'firstNameLatin'] },
];

interface PassportWizardProps {
  initialData?: Partial<PassportFormData>;
  onSubmit: (data: PassportFormData) => void;
  onCancel: () => void;
}

export function PassportWizard({ initialData, onSubmit, onCancel }: PassportWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<PassportFormData>({
    resolver: zodResolver(passportSchema),
    defaultValues: initialData,
  });

  const currentStepConfig = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    const isValid = await trigger(currentStepConfig.fields as any);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('wizard.step')} {currentStep + 1} {t('wizard.of')} {STEPS.length}
          </span>
          <span className="text-sm font-medium">
            {t(`passport.steps.${currentStepConfig.id}`)}
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4">
        {/* Render fields for current step */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <Input
              label={t('passport.fields.lastName')}
              {...register('lastName')}
              error={errors.lastName?.message}
            />
            <Input
              label={t('passport.fields.firstName')}
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            {/* ... остальные поля шага */}
          </div>
        )}
        {/* Аналогично для других шагов */}
      </form>

      {/* Navigation buttons */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          {!isFirstStep ? (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('wizard.back')}
            </Button>
          ) : (
            <Button variant="secondary" onClick={onCancel} className="flex-1">
              {t('common.cancel')}
            </Button>
          )}

          {isLastStep ? (
            <Button type="submit" className="flex-1">
              {t('common.save')}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {t('wizard.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Критерии готовности
- [ ] Компонент создан с 4 шагами
- [ ] Прогресс-индикатор работает
- [ ] Валидация по шагам (trigger)
- [ ] Навигация вперёд/назад

## После завершения
cd apps/frontend && npm run build
```

---

## Задача 2.4: Добавить переводы для Wizard

**Оценка:** 4 файла, ~30 строк каждый

### Промпт для агента:

```
## Задача: Добавить i18n ключи для Wizard

## Контекст
PassportWizard из задачи 2.3 требует переводы для шагов и навигации.

## Зависимости
- Задача 2.3

## Файлы для изменения
- apps/frontend/src/lib/i18n/locales/ru.json
- apps/frontend/src/lib/i18n/locales/en.json
- apps/frontend/src/lib/i18n/locales/uz.json
- apps/frontend/src/lib/i18n/locales/ky.json

## Шаги
1. Добавь в каждый файл локализации:

Для ru.json:
```json
"wizard": {
  "step": "Шаг",
  "of": "из",
  "next": "Далее",
  "back": "Назад",
  "finish": "Готово"
},
"passport": {
  "steps": {
    "personal": "Личные данные",
    "passport": "Паспортные данные",
    "dates": "Даты и выдача",
    "additional": "Дополнительно"
  }
}
```

Для en.json:
```json
"wizard": {
  "step": "Step",
  "of": "of",
  "next": "Next",
  "back": "Back",
  "finish": "Finish"
},
"passport": {
  "steps": {
    "personal": "Personal Info",
    "passport": "Passport Details",
    "dates": "Dates & Issue",
    "additional": "Additional"
  }
}
```

2. Аналогично для uz.json и ky.json

## Критерии готовности
- [ ] Все 4 файла обновлены
- [ ] JSON валиден
- [ ] Ключи соответствуют использованию в PassportWizard

## После завершения
cd apps/frontend && npm run build
```

---

## Задача 2.5: Компонент DatePickerSimple

**Оценка:** 1 новый файл, ~120 строк

### Промпт для агента:

```
## Задача: Создать упрощённый DatePicker для ЦА

## Контекст
Стандартный input type="date" непонятен пользователям.
Нужен компонент с 3 отдельными dropdown: День, Месяц, Год.

## Цель
Создать интуитивный DatePicker для мигрантов

## Файлы для создания
- apps/frontend/src/components/ui/DatePickerSimple.tsx

## Шаги
1. Создай компонент:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface DatePickerSimpleProps {
  value?: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export function DatePickerSimple({
  value,
  onChange,
  label,
  error,
  minYear = 1950,
  maxYear = 2030,
}: DatePickerSimpleProps) {
  const { t, language } = useTranslation();

  const [day, setDay] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDay(date.getDate());
      setMonth(date.getMonth() + 1);
      setYear(date.getFullYear());
    }
  }, [value]);

  // Update parent when all fields are filled
  useEffect(() => {
    if (day && month && year) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange(dateStr);
    }
  }, [day, month, year, onChange]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = MONTHS_RU; // TODO: localize
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <select
          value={day}
          onChange={(e) => setDay(e.target.value ? Number(e.target.value) : '')}
          className={cn(
            'px-3 py-3 bg-white border-2 rounded-xl text-center',
            error ? 'border-red-300' : 'border-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <option value="">{t('date.day')}</option>
          {days.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : '')}
          className={cn(
            'px-3 py-3 bg-white border-2 rounded-xl',
            error ? 'border-red-300' : 'border-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <option value="">{t('date.month')}</option>
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
          className={cn(
            'px-3 py-3 bg-white border-2 rounded-xl text-center',
            error ? 'border-red-300' : 'border-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <option value="">{t('date.year')}</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

## Критерии готовности
- [ ] Компонент создан
- [ ] 3 отдельных dropdown для дня, месяца, года
- [ ] Синхронизация с ISO форматом даты
- [ ] Поддержка error state

## После завершения
cd apps/frontend && npm run build
```

---

## Задача 2.6: Calendar Timeline для калькулятора

**Оценка:** 1 файл, ~200 строк

### Промпт для агента:

```
## Задача: Добавить Calendar Timeline в калькулятор 90/180

## Контекст
Текущий калькулятор показывает только круговой прогресс.
Нужно добавить визуализацию дней в виде календаря.

## Цель
Добавить компонент календаря, показывающий дни пребывания

## Файлы для изменения
- apps/frontend/src/features/services/components/StayCalculator.tsx

## Шаги
1. Прочитай текущий StayCalculator.tsx
2. Добавь компонент CalendarGrid:

```tsx
function CalendarGrid({ entries, year, month }: {
  entries: { date: string; inRussia: boolean }[];
  year: number;
  month: number;
}) {
  const { t } = useTranslation();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const entry = entries.find(e => e.date === date);
    return {
      day: i + 1,
      inRussia: entry?.inRussia ?? false,
    };
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
      <div className="text-center font-semibold mb-3">
        {new Date(year, month).toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: (firstDayOfWeek + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map(({ day, inRussia }) => (
          <div
            key={day}
            className={cn(
              'aspect-square flex items-center justify-center rounded-lg text-sm font-medium',
              inRussia
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-50 text-gray-400'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span className="text-xs text-gray-600">{t('calculator.inRussia')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 rounded" />
          <span className="text-xs text-gray-600">{t('calculator.abroad')}</span>
        </div>
      </div>
    </div>
  );
}
```

3. Интегрируй CalendarGrid после основного прогресса

## Критерии готовности
- [ ] Календарь показывает текущий месяц
- [ ] Дни в РФ выделены зелёным
- [ ] Легенда понятна
- [ ] Компонент компилируется

## После завершения
cd apps/frontend && npm run dev
# Открой /calculator и проверь отображение календаря
```

---

# ФАЗА 3: MAJOR REDESIGN (1-2 недели)

## Задача 3.1: Редизайн HomeScreen — Приоритетные карточки

**Оценка:** 1 файл, ~300 строк (большая задача)

### Промпт для агента:

```
## Задача: Полный редизайн HomeScreen с приоритетными карточками

## Контекст
Текущий HomeScreen перегружен информацией. Нужен новый дизайн
с фокусом на приоритетных задачах пользователя.

## Цель
Создать новую структуру главного экрана:
1. Header с аватаром, статусом и днями
2. Блок "Требует внимания" (срочные задачи)
3. Прогресс легализации (roadmap)
4. Быстрые действия (сетка 2x2)

## Файлы для изменения
- apps/frontend/src/components/prototype/dashboard/HomeScreen.tsx

## Новая структура:

```tsx
export function HomeScreen() {
  // ... existing hooks and state

  // Calculate urgent tasks
  const urgentTasks = useMemo(() => {
    const tasks = [];

    // Patent expiring
    if (daysRemaining <= 7 && checkedDocs.includes('patent')) {
      tasks.push({
        id: 'patent',
        type: 'urgent',
        title: t('tasks.patent.title'),
        description: t('tasks.patent.expiresIn', { days: daysRemaining }),
        action: t('payment.pay'),
        actionUrl: '/payment',
      });
    }

    // Registration expiring (mock)
    // ... add more task logic

    return tasks;
  }, [daysRemaining, checkedDocs, t]);

  return (
    <div className="h-full overflow-y-auto pb-4 bg-gray-50">
      {/* Compact Header */}
      <div className="px-4 py-3 bg-white border-b sticky top-0 z-20">
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Name */}
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfileEdit(true)} className="...">
              {userInitials}
            </button>
            <div>
              <h2 className="font-semibold text-gray-900">{editFullName}</h2>
              <p className="text-xs text-gray-500">{countryName}</p>
            </div>
          </div>

          {/* Right: Status + Days */}
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <DaysCounter days={daysRemaining} />
          </div>
        </div>
      </div>

      {/* Urgent Tasks Section */}
      {urgentTasks.length > 0 && (
        <div className="px-4 py-4">
          <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {t('dashboard.urgent')} ({urgentTasks.length})
          </h3>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <UrgentTaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Progress Roadmap */}
      <div className="px-4 py-2">
        <ProgressRoadmap steps={roadmapSteps} />
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={FileCheck}
            title={t('dashboard.hero.title')}
            subtitle={t('dashboard.hero.subtitle')}
            onClick={() => setShowWizard(true)}
            color="blue"
          />
          <QuickActionCard
            icon={ShieldAlert}
            title={t('services.banCheck.title')}
            subtitle={t('services.banCheck.subtitle')}
            onClick={() => setShowBanChecker(true)}
            color="amber"
          />
          <QuickActionCard
            icon={Calculator}
            title={t('services.items.calculator.title')}
            onClick={() => router.push('/calculator')}
            color="teal"
          />
          <QuickActionCard
            icon={FileText}
            title={t('documents.title')}
            onClick={() => router.push('/documents')}
            color="purple"
          />
        </div>
      </div>

      {/* ... modals remain the same */}
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: 'legal' | 'risk' | 'illegal' }) {
  const colors = {
    legal: 'bg-green-500',
    risk: 'bg-yellow-500',
    illegal: 'bg-red-500',
  };
  return (
    <div className={`px-2 py-1 rounded-full ${colors[status]}`}>
      <span className="text-xs font-bold text-white">
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function DaysCounter({ days }: { days: number }) {
  const color = days > 30 ? 'text-green-600' : days > 10 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="text-right">
      <span className={`text-xl font-bold ${color}`}>{days}</span>
      <span className="text-xs text-gray-500 block">дней</span>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, subtitle, onClick, color }) {
  const bgColors = {
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    teal: 'bg-teal-50 border-teal-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  const iconColors = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    teal: 'text-teal-600',
    purple: 'text-purple-600',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 ${bgColors[color]} hover:shadow-md transition-all active:scale-98`}
    >
      <Icon className={`w-6 h-6 ${iconColors[color]} mb-2`} />
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </button>
  );
}
```

## Критерии готовности
- [ ] Новая структура экрана реализована
- [ ] Срочные задачи показываются первыми
- [ ] Roadmap интегрирован
- [ ] Quick Actions в сетке 2x2
- [ ] Все модалы работают как прежде

## После завершения
cd apps/frontend && npm run build && npm run dev
# Полностью протестируй главный экран
```

---

## Задача 3.2: Геймификация экзамена — Система уровней

**Оценка:** 2 файла, ~200 строк

### Промпт для агента:

```
## Задача: Добавить систему уровней и XP в экзамен

## Контекст
Экзаменационный модуль не имеет геймификации.
Нужно добавить уровни, XP и прогресс для мотивации.

## Цель
1. Создать систему уровней (Новичок → Знаток → Эксперт)
2. Начислять XP за правильные ответы
3. Показывать прогресс на главном экране экзамена

## Файлы для создания/изменения
- apps/frontend/src/lib/stores/examStore.ts (если нет — создать)
- apps/frontend/src/features/exam/components/ExamHome.tsx

## Шаги
1. Создай/обнови examStore с XP и уровнями:

```tsx
// examStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExamState {
  totalXP: number;
  categoryProgress: Record<string, { correct: number; total: number }>;
  addXP: (amount: number) => void;
  updateCategoryProgress: (category: string, correct: boolean) => void;
  getLevel: () => { name: string; minXP: number; maxXP: number; progress: number };
}

const LEVELS = [
  { name: 'Новичок', minXP: 0, maxXP: 100 },
  { name: 'Ученик', minXP: 100, maxXP: 300 },
  { name: 'Знаток', minXP: 300, maxXP: 600 },
  { name: 'Эксперт', minXP: 600, maxXP: 1000 },
  { name: 'Мастер', minXP: 1000, maxXP: Infinity },
];

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      categoryProgress: {},

      addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),

      updateCategoryProgress: (category, correct) => set((state) => {
        const prev = state.categoryProgress[category] || { correct: 0, total: 0 };
        return {
          categoryProgress: {
            ...state.categoryProgress,
            [category]: {
              correct: prev.correct + (correct ? 1 : 0),
              total: prev.total + 1,
            },
          },
        };
      }),

      getLevel: () => {
        const xp = get().totalXP;
        const level = LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
        const progress = level.maxXP === Infinity
          ? 100
          : ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
        return { ...level, progress };
      },
    }),
    { name: 'exam-progress' }
  )
);
```

2. Обнови ExamHome для показа уровня:

```tsx
// В ExamHome.tsx добавь:
const { totalXP, getLevel, categoryProgress } = useExamStore();
const level = getLevel();

// В JSX:
<div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 text-white mb-4">
  <div className="flex items-center justify-between mb-2">
    <span className="font-bold">{level.name}</span>
    <span className="text-purple-200">{totalXP} XP</span>
  </div>
  <div className="h-2 bg-white/20 rounded-full">
    <div
      className="h-full bg-white rounded-full transition-all"
      style={{ width: `${level.progress}%` }}
    />
  </div>
  <p className="text-xs text-purple-200 mt-1">
    До следующего уровня: {level.maxXP - totalXP} XP
  </p>
</div>
```

## Критерии готовности
- [ ] Store создан с XP и уровнями
- [ ] Уровень показывается на экране экзамена
- [ ] XP сохраняется между сессиями (persist)
- [ ] Прогресс-бар работает

## После завершения
cd apps/frontend && npm run build && npm run dev
# Открой /exam и проверь отображение уровня
```

---

## Задача 3.3: Начисление XP за ответы

**Оценка:** 1 файл, ~30 строк

### Промпт для агента:

```
## Задача: Интегрировать начисление XP в сессию экзамена

## Контекст
Store с XP создан в задаче 3.2. Теперь нужно начислять XP
за правильные ответы во время экзамена.

## Зависимости
- Задача 3.2

## Файлы для изменения
- apps/frontend/src/features/exam/components/ExamSession.tsx
  (или QuestionCard.tsx — где обрабатывается ответ)

## Шаги
1. Найди место, где обрабатывается ответ на вопрос
2. Импортируй useExamStore:
```tsx
import { useExamStore } from '@/lib/stores/examStore';
```

3. В обработчике ответа добавь:
```tsx
const { addXP, updateCategoryProgress } = useExamStore();

const handleAnswer = (selectedIndex: number) => {
  const isCorrect = selectedIndex === question.correctAnswer;

  // Начислить XP
  if (isCorrect) {
    addXP(10); // 10 XP за правильный ответ
  }

  // Обновить прогресс категории
  updateCategoryProgress(question.category, isCorrect);

  // ... остальная логика
};
```

4. Добавь визуальную обратную связь при начислении XP:
```tsx
{isCorrect && (
  <div className="absolute top-4 right-4 animate-bounce">
    <span className="text-green-500 font-bold">+10 XP</span>
  </div>
)}
```

## Критерии готовности
- [ ] XP начисляется за правильные ответы
- [ ] Прогресс категории обновляется
- [ ] Визуальная обратная связь работает

## После завершения
cd apps/frontend && npm run dev
# Пройди несколько вопросов экзамена и проверь начисление XP
```

---

## Задача 3.4: Accessibility — ARIA labels

**Оценка:** 5+ файлов, ~10 строк каждый

### Промпт для агента:

```
## Задача: Добавить ARIA labels в ключевые компоненты

## Контекст
Приложение должно быть доступно для пользователей с ограниченными
возможностями. Нужно добавить ARIA атрибуты.

## Цель
Добавить aria-label, aria-describedby, role в интерактивные элементы

## Файлы для изменения
- apps/frontend/src/components/ui/Button.tsx
- apps/frontend/src/components/ui/Input.tsx
- apps/frontend/src/components/ui/Modal.tsx
- apps/frontend/src/components/prototype/DashboardLayout.tsx

## Шаги
1. Button.tsx — добавь aria-label если передан:
```tsx
interface ButtonProps {
  // ...existing
  'aria-label'?: string;
}

<button
  aria-label={props['aria-label']}
  aria-busy={loading}
  // ...
>
```

2. Input.tsx — связь label и input:
```tsx
const inputId = useId();

<label htmlFor={inputId}>{label}</label>
<input
  id={inputId}
  aria-invalid={!!error}
  aria-describedby={error ? `${inputId}-error` : undefined}
/>
{error && <span id={`${inputId}-error`} role="alert">{error}</span>}
```

3. Modal.tsx — добавь role="dialog":
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
>
  <h2 id={titleId}>{title}</h2>
</div>
```

4. DashboardLayout.tsx — nav роли:
```tsx
<nav role="navigation" aria-label={t('navigation.main')}>
  {tabs.map(tab => (
    <button
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls={`panel-${tab.id}`}
    >
```

## Критерии готовности
- [ ] Button имеет aria-busy при loading
- [ ] Input связан с label через htmlFor/id
- [ ] Ошибки помечены role="alert"
- [ ] Modal имеет role="dialog"
- [ ] Navigation имеет правильные роли

## После завершения
cd apps/frontend && npm run build
# Проверь с помощью axe DevTools или Lighthouse Accessibility
```

---

## Задача 3.5: Полное E2E тестирование изменений

**Оценка:** Запуск существующих тестов

### Промпт для агента:

```
## Задача: Запустить E2E тесты и исправить failures

## Контекст
После всех изменений нужно убедиться, что приложение работает корректно.

## Цель
Запустить Playwright тесты и исправить любые failures

## Шаги
1. Запусти тесты:
```bash
cd apps/frontend
npm run test:e2e
```

2. Если есть failures:
   - Прочитай error output
   - Найди причину (изменённые селекторы, удалённые элементы и т.д.)
   - Исправь тесты или код

3. Обнови скриншоты если нужно:
```bash
npm run test:e2e -- --update-snapshots
```

## Критерии готовности
- [ ] Все E2E тесты проходят
- [ ] Скриншоты актуальны
- [ ] Нет console errors в браузере

## После завершения
git status
# Подготовь коммит с изменениями
```

---

# ЧЕКЛИСТ ЗАВЕРШЕНИЯ

## Фаза 1 ✅
- [ ] 1.1 Bottom Navigation улучшена
- [ ] 1.2 Семантические цвета добавлены
- [ ] 1.3 Документы сгруппированы
- [ ] 1.4 Hero-секция упрощена
- [ ] 1.5 Переводы для групп добавлены

## Фаза 2 ✅
- [ ] 2.1 ProgressRoadmap создан
- [ ] 2.2 Roadmap интегрирован в HomeScreen
- [ ] 2.3 PassportWizard создан
- [ ] 2.4 Переводы для Wizard добавлены
- [ ] 2.5 DatePickerSimple создан
- [ ] 2.6 Calendar Timeline добавлен

## Фаза 3 ✅
- [ ] 3.1 HomeScreen редизайн завершён
- [ ] 3.2 Система уровней создана
- [ ] 3.3 XP начисляется за ответы
- [ ] 3.4 ARIA labels добавлены
- [ ] 3.5 E2E тесты проходят

---

# КОМАНДЫ ДЛЯ БЫСТРОГО ЗАПУСКА

```bash
# Сборка
cd apps/frontend && npm run build

# Dev сервер
cd apps/frontend && npm run dev

# E2E тесты
cd apps/frontend && npm run test:e2e

# Lint
cd apps/frontend && npm run lint

# Type check
cd apps/frontend && npm run type-check
```
