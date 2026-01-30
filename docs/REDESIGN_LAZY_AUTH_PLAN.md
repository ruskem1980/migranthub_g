# План реализации: Lazy Auth + UX Редизайн

**Версия:** 1.0
**Дата:** 2026-01-30
**Статус:** Готов к запуску

---

## Оценка проекта

| Критерий | Значение |
|----------|----------|
| Файлов | ~40-50 |
| Строк кода | ~3000-4000 |
| Под-задачи | 12 |
| Параллельные потоки | 3 |

---

## Архитектура изменений

```
ТЕКУЩИЙ FLOW:
Welcome → Auth → OTP → Onboarding (4 шага) → Dashboard
         ↑_________________________________↑
                 7-10 шагов до пользы

НОВЫЙ FLOW:
AnonymousDashboard → [триггер] → QuickRegistration → PersonalDashboard
        ↑                              ↑
   Мгновенная польза            3 поля, 30 сек
```

---

## Структура задач

```
PHASE 1: FOUNDATION (Задачи 1-4) — можно параллельно
├── Задача 1: Stores & Types (новые состояния)
├── Задача 2: Anonymous Components (UI без auth)
├── Задача 3: Quick Registration (bottom sheet)
└── Задача 4: SOS Screen (полный редизайн)

PHASE 2: SCREENS (Задачи 5-8) — после Phase 1
├── Задача 5: Anonymous Dashboard (главный экран)
├── Задача 6: Checks Screen (проверки)
├── Задача 7: Personal Dashboard (после регистрации)
└── Задача 8: Bottom Navigation (новая логика)

PHASE 3: INTEGRATION (Задачи 9-11) — после Phase 2
├── Задача 9: Auth Flow Refactor
├── Задача 10: Paywall & Triggers
└── Задача 11: Migration & Cleanup

PHASE 4: TESTING (Задача 12) — финал
└── Задача 12: E2E Testing & QA
```

---

## PHASE 1: FOUNDATION

### Задача 1: Stores & Types

```
## Задача: Stores & Types для Lazy Auth

## Контекст
Текущая архитектура требует авторизации для доступа к любому функционалу.
Нужно добавить поддержку анонимного режима работы.

## Цель
Создать/обновить Zustand stores и TypeScript типы для поддержки:
- Анонимного режима (без auth)
- Быстрой регистрации (3 поля)
- Триггеров конверсии

## Шаги
1. Прочитать текущие stores:
   - apps/frontend/src/lib/stores/authStore.ts
   - apps/frontend/src/lib/stores/appStore.ts
   - apps/frontend/src/lib/stores/profileStore.ts

2. Создать новый тип для режима доступа:
   ```typescript
   // types/access.ts
   type AccessMode = 'anonymous' | 'registered' | 'subscribed';
   type SubscriptionTier = 'free' | 'plus' | 'pro';
   ```

3. Обновить authStore:
   - Добавить `accessMode: AccessMode`
   - Добавить `isAnonymous: boolean` (computed)
   - Обновить `initializeAuth()` для работы без токена
   - Добавить `convertToRegistered()` метод

4. Создать новый conversionStore:
   ```typescript
   // stores/conversionStore.ts
   interface ConversionState {
     triggers: ConversionTrigger[];
     shownPaywalls: string[];
     lastPaywallShown: Date | null;
     addTrigger(trigger: ConversionTrigger): void;
     shouldShowPaywall(feature: string): boolean;
     markPaywallShown(feature: string): void;
   }
   ```

5. Обновить appStore:
   - Убрать `hasCompletedOnboarding` как блокирующий флаг
   - Добавить `hasSeenWelcome: boolean`
   - Добавить `anonymousUsageStats: { calculatorUses, examQuestions, aiQuestions }`

6. Создать типы для анонимных данных:
   ```typescript
   // types/anonymous.ts
   interface AnonymousSession {
     sessionId: string;
     createdAt: Date;
     calculatorResults: CalculatorResult[];
     examProgress: { answered: number; correct: number };
     aiQuestionsToday: number;
   }
   ```

## Файлы для создания/изменения
- apps/frontend/src/types/access.ts (новый)
- apps/frontend/src/types/anonymous.ts (новый)
- apps/frontend/src/lib/stores/authStore.ts (изменить)
- apps/frontend/src/lib/stores/appStore.ts (изменить)
- apps/frontend/src/lib/stores/conversionStore.ts (новый)

## Критерии готовности
- [ ] Все типы созданы и экспортированы
- [ ] authStore поддерживает анонимный режим
- [ ] conversionStore создан с логикой триггеров
- [ ] Нет ошибок TypeScript: `npm run type-check`
- [ ] Stores персистятся в localStorage

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint
```
```

---

### Задача 2: Anonymous Components

```
## Задача: UI компоненты для анонимного режима

## Контекст
Нужны переиспользуемые UI компоненты для анонимного режима:
- Карточки быстрых действий
- Секции с заголовками
- Баннеры конверсии

## Цель
Создать библиотеку UI компонентов для нового анонимного dashboard.

## Шаги
1. Прочитать существующие UI компоненты:
   - apps/frontend/src/components/ui/

2. Создать QuickActionCard:
   ```typescript
   // components/ui/QuickActionCard.tsx
   interface QuickActionCardProps {
     icon: LucideIcon;
     title: string;
     description?: string;
     onClick: () => void;
     variant?: 'default' | 'primary' | 'warning' | 'danger';
     disabled?: boolean;
     badge?: string;
   }
   ```
   - Большая кликабельная карточка
   - Иконка слева, текст справа
   - Hover/press состояния
   - Поддержка disabled

3. Создать SectionHeader:
   ```typescript
   // components/ui/SectionHeader.tsx
   interface SectionHeaderProps {
     icon?: LucideIcon;
     title: string;
     action?: { label: string; onClick: () => void };
   }
   ```

4. Создать ConversionBanner:
   ```typescript
   // components/ui/ConversionBanner.tsx
   interface ConversionBannerProps {
     variant: 'subtle' | 'prominent';
     title: string;
     description?: string;
     ctaLabel: string;
     onCtaClick: () => void;
     onDismiss?: () => void;
   }
   ```
   - subtle: маленький баннер внизу
   - prominent: большой баннер с иллюстрацией

5. Создать FeatureGate:
   ```typescript
   // components/ui/FeatureGate.tsx
   interface FeatureGateProps {
     feature: 'documents' | 'reminders' | 'ai' | 'backup';
     requiredAccess: 'registered' | 'plus' | 'pro';
     children: ReactNode;
     fallback?: ReactNode;
   }
   ```
   - Обёртка для функций, требующих определённый доступ
   - Показывает fallback или paywall если нет доступа

6. Создать EmergencyButton:
   ```typescript
   // components/ui/EmergencyButton.tsx
   // Большая красная кнопка SOS, всегда видна
   ```

## Файлы для создания
- apps/frontend/src/components/ui/QuickActionCard.tsx
- apps/frontend/src/components/ui/SectionHeader.tsx
- apps/frontend/src/components/ui/ConversionBanner.tsx
- apps/frontend/src/components/ui/FeatureGate.tsx
- apps/frontend/src/components/ui/EmergencyButton.tsx
- apps/frontend/src/components/ui/index.ts (обновить экспорты)

## Критерии готовности
- [ ] Все компоненты созданы с TypeScript типами
- [ ] Компоненты используют Tailwind CSS
- [ ] Компоненты поддерживают темы (light/dark)
- [ ] Компоненты локализованы (useTranslation)
- [ ] Нет ошибок: `npm run lint`

## После завершения
```bash
cd apps/frontend && npm run lint && npm run build
```
```

---

### Задача 3: Quick Registration

```
## Задача: Быстрая регистрация (Bottom Sheet)

## Контекст
Вместо полного онбординга (4 шага) нужна быстрая регистрация в 3 поля,
появляющаяся как bottom sheet при попытке сохранить данные.

## Цель
Создать компонент QuickRegistration — bottom sheet с 3 полями:
- Гражданство
- Дата въезда (может быть предзаполнена)
- Регион

## Шаги
1. Прочитать текущий онбординг:
   - apps/frontend/src/components/onboarding/ProfilingScreen.tsx
   - apps/frontend/src/app/(auth)/onboarding/page.tsx

2. Прочитать компонент Sheet:
   - apps/frontend/src/components/ui/Sheet.tsx (или создать если нет)

3. Создать QuickRegistrationSheet:
   ```typescript
   // components/registration/QuickRegistrationSheet.tsx
   interface QuickRegistrationSheetProps {
     isOpen: boolean;
     onClose: () => void;
     onComplete: (profile: QuickProfile) => void;
     prefillData?: {
       entryDate?: string;
       region?: string;
     };
     trigger: 'save_result' | 'add_document' | 'enable_reminders' | 'exam_progress';
   }

   interface QuickProfile {
     citizenship: string;
     entryDate: string;
     region: string;
   }
   ```

4. Реализовать UI:
   - Заголовок с объяснением зачем нужен профиль
   - Иконки безопасности (🔒 данные на устройстве)
   - 3 поля в один столбец
   - Кнопка "Создать профиль"
   - Ссылка на условия использования

5. Реализовать логику:
   - Валидация всех полей
   - Автозаполнение entryDate если был калькулятор
   - После submit: authStore.convertToRegistered()
   - Показать toast успеха
   - Вызвать onComplete с данными

6. Создать хук useQuickRegistration:
   ```typescript
   // hooks/useQuickRegistration.ts
   function useQuickRegistration() {
     const [isOpen, setIsOpen] = useState(false);
     const [trigger, setTrigger] = useState<string | null>(null);
     const [prefillData, setPrefillData] = useState<object | null>(null);

     const requireRegistration = (trigger: string, prefill?: object) => {
       if (authStore.isAnonymous) {
         setTrigger(trigger);
         setPrefillData(prefill);
         setIsOpen(true);
         return false;
       }
       return true;
     };

     return { isOpen, trigger, prefillData, requireRegistration, close };
   }
   ```

## Файлы для создания/изменения
- apps/frontend/src/components/registration/QuickRegistrationSheet.tsx (новый)
- apps/frontend/src/hooks/useQuickRegistration.ts (новый)
- apps/frontend/src/components/ui/Sheet.tsx (проверить/создать)

## Критерии готовности
- [ ] Bottom sheet открывается и закрывается плавно
- [ ] Все 3 поля работают корректно
- [ ] Валидация показывает ошибки
- [ ] После регистрации пользователь становится registered
- [ ] Данные сохраняются в profileStore
- [ ] Локализация на 5 языков

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint
```
```

---

### Задача 4: SOS Screen

```
## Задача: Редизайн SOS экрана

## Контекст
SOS экран должен быть доступен ВСЕГДА без регистрации.
Нужен полный редизайн с фокусом на быстрый доступ к экстренным контактам.

## Цель
Создать новый SOSScreen с:
- Экстренные службы (112, 102, 103)
- Горячие линии МВД
- Контакты посольств
- Памятки "Что делать если..."

## Шаги
1. Прочитать текущий SOS экран:
   - apps/frontend/src/components/prototype/screens/SOSScreen.tsx

2. Создать данные для SOS:
   ```typescript
   // data/emergency-contacts.ts
   export const emergencyServices = [
     { name: 'Единый номер', number: '112', icon: 'Phone' },
     { name: 'Полиция', number: '102', icon: 'Shield' },
     { name: 'Скорая помощь', number: '103', icon: 'Heart' },
     { name: 'Пожарная', number: '101', icon: 'Flame' },
   ];

   export const hotlines = [
     {
       name: 'МВД горячая линия',
       number: '8-800-222-74-47',
       description: 'Бесплатно по России',
       hours: '24/7'
     },
     // ...
   ];

   export const embassies = {
     UZ: { name: 'Посольство Узбекистана', phone: '...', address: '...' },
     TJ: { name: 'Посольство Таджикистана', phone: '...', address: '...' },
     KG: { name: 'Посольство Кыргызстана', phone: '...', address: '...' },
   };

   export const emergencyGuides = [
     { id: 'police_stop', title: 'Задержала полиция', icon: 'Shield' },
     { id: 'no_salary', title: 'Не платят зарплату', icon: 'Wallet' },
     { id: 'lost_docs', title: 'Потерял документы', icon: 'FileX' },
     { id: 'employer_problem', title: 'Проблемы с работодателем', icon: 'Building' },
     { id: 'legal_help', title: 'Нужна юридическая помощь', icon: 'Scale' },
   ];
   ```

3. Создать новый SOSScreen:
   - Секция экстренных служб (большие кнопки звонка)
   - Секция горячих линий
   - Секция посольств (фильтр по гражданству если известно)
   - Секция памяток (аккордеон)

4. Создать EmergencyGuideModal:
   ```typescript
   // components/sos/EmergencyGuideModal.tsx
   // Модальное окно с пошаговой инструкцией
   ```

5. Интегрировать Capacitor для звонков:
   ```typescript
   import { CallNumber } from '@capacitor-community/call-number';

   const makeCall = async (number: string) => {
     await CallNumber.call({ number, bypassAppChooser: false });
   };
   ```

## Файлы для создания/изменения
- apps/frontend/src/data/emergency-contacts.ts (новый)
- apps/frontend/src/components/sos/SOSScreen.tsx (новый)
- apps/frontend/src/components/sos/EmergencyGuideModal.tsx (новый)
- apps/frontend/src/components/sos/EmergencyServiceCard.tsx (новый)
- apps/frontend/src/components/sos/EmbassyCard.tsx (новый)

## Критерии готовности
- [ ] Все экстренные контакты отображаются
- [ ] Кнопки звонка работают (Capacitor)
- [ ] Посольства фильтруются по гражданству
- [ ] Памятки открываются в модальном окне
- [ ] Экран работает без регистрации
- [ ] Локализация на 5 языков

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run build
```
```

---

## PHASE 2: SCREENS

### Задача 5: Anonymous Dashboard

```
## Задача: Анонимный Dashboard (главный экран)

## Контекст
Это ГЛАВНЫЙ экран приложения для анонимных пользователей.
Должен показывать ценность приложения сразу, без регистрации.

## Цель
Создать AnonymousDashboard с секциями:
- SOS (всегда вверху)
- Калькуляторы
- Проверки
- Полезное (чек-лист, экзамен, AI)

## Шаги
1. Прочитать текущие компоненты:
   - apps/frontend/src/components/prototype/DashboardLayout.tsx
   - apps/frontend/src/components/prototype/screens/HomeScreen.tsx

2. Создать AnonymousDashboard:
   ```typescript
   // components/anonymous/AnonymousDashboard.tsx
   export function AnonymousDashboard() {
     return (
       <div className="min-h-screen pb-20">
         <Header />
         <main className="p-4 space-y-6">
           <SOSQuickAccess />
           <CalculatorsSection />
           <ChecksSection />
           <UsefulSection />
           <ConversionBanner variant="subtle" />
         </main>
       </div>
     );
   }
   ```

3. Создать Header с языком:
   ```typescript
   // components/anonymous/Header.tsx
   // Логотип + переключатель языка
   ```

4. Создать SOSQuickAccess:
   ```typescript
   // components/anonymous/SOSQuickAccess.tsx
   // Красная полоса с кнопкой SOS
   ```

5. Создать CalculatorsSection:
   ```typescript
   // components/anonymous/CalculatorsSection.tsx
   // 2 карточки: 90/180 и патент
   // При нажатии открывают калькуляторы inline или в модалке
   ```

6. Создать ChecksSection:
   ```typescript
   // components/anonymous/ChecksSection.tsx
   // 4 карточки проверок
   // При нажатии открывают формы проверки
   ```

7. Создать UsefulSection:
   ```typescript
   // components/anonymous/UsefulSection.tsx
   // Чек-лист, экзамен, права, AI
   ```

8. Интегрировать калькуляторы:
   - Использовать существующие компоненты калькуляторов
   - Результаты НЕ сохраняются (предложение сохранить → регистрация)

## Файлы для создания
- apps/frontend/src/components/anonymous/AnonymousDashboard.tsx
- apps/frontend/src/components/anonymous/Header.tsx
- apps/frontend/src/components/anonymous/SOSQuickAccess.tsx
- apps/frontend/src/components/anonymous/CalculatorsSection.tsx
- apps/frontend/src/components/anonymous/ChecksSection.tsx
- apps/frontend/src/components/anonymous/UsefulSection.tsx
- apps/frontend/src/components/anonymous/index.ts

## Критерии готовности
- [ ] Dashboard отображается без авторизации
- [ ] Все секции работают
- [ ] Калькуляторы работают анонимно
- [ ] При попытке сохранить → триггер регистрации
- [ ] Responsive дизайн (mobile-first)
- [ ] Локализация на 5 языков

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint && npm run build
```
```

---

### Задача 6: Checks Screen

```
## Задача: Экран проверок

## Контекст
Экран со всеми проверками документов и статусов.
Доступен анонимно, но требует ввода данных для каждой проверки.

## Цель
Создать ChecksScreen с:
- Проверка запрета на въезд
- Проверка паспорта
- Проверка патента
- Проверка ИНН
- Проверка ФССП (Plus)

## Шаги
1. Прочитать существующие модалки проверок:
   - apps/frontend/src/components/prototype/services/

2. Создать ChecksScreen:
   ```typescript
   // components/checks/ChecksScreen.tsx
   export function ChecksScreen() {
     const { isAnonymous } = useAuthStore();

     return (
       <div className="p-4 space-y-4">
         <SectionHeader title="Проверки" />

         <CheckCard
           title="Запрет на въезд"
           description="Проверьте, нет ли ограничений"
           icon={Ban}
           onClick={() => openCheck('ban')}
           free
         />

         <CheckCard
           title="Действительность паспорта"
           description="Проверка по базе МВД"
           icon={CreditCard}
           onClick={() => openCheck('passport')}
           free
         />

         {/* ... другие проверки */}

         <CheckCard
           title="Долги ФССП"
           description="Проверка задолженностей"
           icon={Scale}
           onClick={() => openCheck('fssp')}
           requiresSubscription="plus"
         />
       </div>
     );
   }
   ```

3. Создать универсальный CheckModal:
   ```typescript
   // components/checks/CheckModal.tsx
   interface CheckModalProps {
     type: 'ban' | 'passport' | 'patent' | 'inn' | 'fssp';
     isOpen: boolean;
     onClose: () => void;
   }
   ```

4. Создать формы для каждой проверки:
   - BanCheckForm (ФИО латиницей, дата рождения, гражданство)
   - PassportCheckForm (серия, номер)
   - PatentCheckForm (номер патента, регион)
   - InnCheckForm (ИНН)
   - FsspCheckForm (ФИО, дата рождения, регион)

5. Интегрировать с API:
   - Использовать существующие API endpoints
   - Показывать результат в модалке
   - Предлагать сохранить результат → регистрация

## Файлы для создания
- apps/frontend/src/components/checks/ChecksScreen.tsx
- apps/frontend/src/components/checks/CheckCard.tsx
- apps/frontend/src/components/checks/CheckModal.tsx
- apps/frontend/src/components/checks/forms/BanCheckForm.tsx
- apps/frontend/src/components/checks/forms/PassportCheckForm.tsx
- apps/frontend/src/components/checks/forms/PatentCheckForm.tsx
- apps/frontend/src/components/checks/forms/InnCheckForm.tsx
- apps/frontend/src/components/checks/forms/FsspCheckForm.tsx
- apps/frontend/src/components/checks/CheckResult.tsx

## Критерии готовности
- [ ] Все проверки работают анонимно
- [ ] Формы валидируются
- [ ] Результаты отображаются корректно
- [ ] ФССП требует подписку Plus
- [ ] Предложение сохранить → регистрация
- [ ] Локализация

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint
```
```

---

### Задача 7: Personal Dashboard

```
## Задача: Персональный Dashboard (после регистрации)

## Контекст
Dashboard для зарегистрированных пользователей с персонализированным контентом.

## Цель
Создать PersonalDashboard с:
- Статус легальности
- Ближайшие дедлайны
- Мои документы
- Быстрые действия

## Шаги
1. Прочитать текущий HomeScreen:
   - apps/frontend/src/components/prototype/screens/HomeScreen.tsx

2. Рефакторить в PersonalDashboard:
   ```typescript
   // components/personal/PersonalDashboard.tsx
   export function PersonalDashboard() {
     const { profile } = useProfileStore();
     const deadlines = useDeadlines(profile);

     return (
       <div className="min-h-screen pb-20">
         <PersonalHeader profile={profile} />

         <main className="p-4 space-y-6">
           <LegalStatusCard status={calculateStatus(profile)} />
           <DeadlinesSection deadlines={deadlines} />
           <DocumentsSection />
           <QuickActionsSection />
         </main>
       </div>
     );
   }
   ```

3. Создать LegalStatusCard:
   - Большая карточка со статусом (Легальный/Риск/Нелегальный)
   - Progress bar до следующего дедлайна
   - Цветовая индикация

4. Создать DeadlinesSection:
   - Список ближайших 3 дедлайнов
   - Цветовая индикация срочности
   - Кнопки действий

5. Создать DocumentsSection:
   - Краткий список документов (3 последних)
   - Кнопка "Все документы"
   - Индикатор лимита для Free (1/3)

6. Создать QuickActionsSection:
   - Калькулятор
   - Проверки
   - AI ассистент
   - Экзамен

## Файлы для создания/изменения
- apps/frontend/src/components/personal/PersonalDashboard.tsx
- apps/frontend/src/components/personal/PersonalHeader.tsx
- apps/frontend/src/components/personal/LegalStatusCard.tsx
- apps/frontend/src/components/personal/DeadlinesSection.tsx
- apps/frontend/src/components/personal/DocumentsSection.tsx
- apps/frontend/src/components/personal/QuickActionsSection.tsx
- apps/frontend/src/hooks/useDeadlines.ts

## Критерии готовности
- [ ] Dashboard показывает персонализированные данные
- [ ] Статус легальности рассчитывается корректно
- [ ] Дедлайны отображаются с правильными датами
- [ ] Документы показываются из profileStore
- [ ] Лимиты Free плана отображаются
- [ ] Локализация

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint && npm run build
```
```

---

### Задача 8: Bottom Navigation

```
## Задача: Новая логика Bottom Navigation

## Контекст
Bottom Navigation должна адаптироваться под режим доступа:
- Анонимный: Главная, Чек-лист, Проверки, SOS, Войти
- Зарегистрированный: Главная, Документы, Проверки, SOS, Профиль

## Цель
Рефакторить BottomNavigation для поддержки двух режимов.

## Шаги
1. Прочитать текущую навигацию:
   - apps/frontend/src/components/ui/BottomNavigation.tsx

2. Обновить BottomNavigation:
   ```typescript
   // components/ui/BottomNavigation.tsx
   export function BottomNavigation() {
     const { isAnonymous } = useAuthStore();

     const anonymousItems = [
       { href: '/', icon: Home, labelKey: 'nav.home' },
       { href: '/checklist', icon: ClipboardList, labelKey: 'nav.checklist' },
       { href: '/checks', icon: Search, labelKey: 'nav.checks' },
       { href: '/sos', icon: AlertTriangle, labelKey: 'nav.sos', highlight: true },
       { href: '/login', icon: User, labelKey: 'nav.login' },
     ];

     const registeredItems = [
       { href: '/', icon: Home, labelKey: 'nav.home' },
       { href: '/documents', icon: FileText, labelKey: 'nav.documents' },
       { href: '/checks', icon: Search, labelKey: 'nav.checks' },
       { href: '/sos', icon: AlertTriangle, labelKey: 'nav.sos', highlight: true },
       { href: '/profile', icon: User, labelKey: 'nav.profile' },
     ];

     const items = isAnonymous ? anonymousItems : registeredItems;

     return (
       <nav className="fixed bottom-0 ...">
         {items.map(item => (
           <NavItem key={item.href} {...item} />
         ))}
       </nav>
     );
   }
   ```

3. Добавить highlight для SOS:
   - Красный цвет иконки
   - Пульсирующий эффект (опционально)

4. Обновить роутинг:
   - /checklist → страница чек-листа (анонимный)
   - /checks → страница проверок
   - /sos → SOS экран
   - /login → страница входа / регистрации

5. Добавить анимацию переключения:
   - При регистрации плавная смена табов

## Файлы для создания/изменения
- apps/frontend/src/components/ui/BottomNavigation.tsx (изменить)
- apps/frontend/src/app/(main)/checklist/page.tsx (новый)
- apps/frontend/src/app/(main)/checks/page.tsx (новый)
- apps/frontend/src/app/(main)/sos/page.tsx (новый)
- apps/frontend/src/app/(main)/login/page.tsx (новый)

## Критерии готовности
- [ ] Навигация адаптируется под режим
- [ ] Все маршруты работают
- [ ] SOS выделен визуально
- [ ] Плавные переходы между страницами
- [ ] Safe area для iOS

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run build
```
```

---

## PHASE 3: INTEGRATION

### Задача 9: Auth Flow Refactor

```
## Задача: Рефакторинг Auth Flow

## Контекст
Текущий auth flow требует обязательной регистрации.
Нужно сделать регистрацию опциональной.

## Цель
- Убрать обязательный онбординг
- Сделать device auth прозрачным
- Интегрировать QuickRegistration

## Шаги
1. Прочитать текущий auth flow:
   - apps/frontend/src/lib/hooks/useAuth.ts
   - apps/frontend/src/lib/hooks/useDeviceAuth.ts
   - apps/frontend/src/app/(auth)/ - все страницы

2. Обновить useAuth:
   ```typescript
   // hooks/useAuth.ts
   export function useAuth() {
     const initializeAuth = async () => {
       // Попытаться восстановить сессию
       const token = await tokenStorage.getAccessToken();

       if (token) {
         // Есть токен - загрузить профиль
         await loadProfile();
       } else {
         // Нет токена - создать анонимную сессию
         await createAnonymousSession();
       }

       // НЕ редиректить на онбординг!
     };

     const checkAuth = () => {
       // Убрать редирект на онбординг
       return isAuthenticated;
     };
   }
   ```

3. Обновить root page:
   ```typescript
   // app/page.tsx
   export default function RootPage() {
     // Редирект на dashboard, НЕ на welcome
     redirect('/');
   }
   ```

4. Обновить layout (main):
   ```typescript
   // app/(main)/layout.tsx
   export default function MainLayout({ children }) {
     // НЕ проверять hasCompletedOnboarding
     return (
       <div>
         {children}
         <BottomNavigation />
         <QuickRegistrationSheet />
       </div>
     );
   }
   ```

5. Обновить страницу dashboard:
   ```typescript
   // app/(main)/page.tsx или app/(main)/dashboard/page.tsx
   export default function DashboardPage() {
     const { isAnonymous } = useAuthStore();

     if (isAnonymous) {
       return <AnonymousDashboard />;
     }

     return <PersonalDashboard />;
   }
   ```

6. Сохранить старые auth страницы для:
   - Полной регистрации (phone + OTP)
   - Восстановления доступа

## Файлы для изменения
- apps/frontend/src/lib/hooks/useAuth.ts
- apps/frontend/src/lib/hooks/useDeviceAuth.ts
- apps/frontend/src/app/page.tsx
- apps/frontend/src/app/(main)/layout.tsx
- apps/frontend/src/app/(main)/page.tsx
- apps/frontend/src/providers/providers.tsx

## Критерии готовности
- [ ] Приложение открывается сразу на dashboard
- [ ] Нет редиректа на welcome/onboarding
- [ ] Анонимная сессия создаётся автоматически
- [ ] QuickRegistration работает
- [ ] Старые auth страницы доступны

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run build
```
```

---

### Задача 10: Paywall & Triggers

```
## Задача: Paywall и триггеры конверсии

## Контекст
Нужна система paywall для ограничения функций Free плана
и триггеры для показа предложений подписки.

## Цель
Создать:
- Компонент Paywall
- Логику триггеров конверсии
- Интеграцию с FeatureGate

## Шаги
1. Создать PaywallSheet:
   ```typescript
   // components/paywall/PaywallSheet.tsx
   interface PaywallSheetProps {
     isOpen: boolean;
     onClose: () => void;
     feature: string;
     plans: SubscriptionPlan[];
   }
   ```

2. Создать PlanCard:
   ```typescript
   // components/paywall/PlanCard.tsx
   // Карточка плана с ценой и фичами
   ```

3. Реализовать логику триггеров:
   ```typescript
   // services/conversion-triggers.ts
   export const triggers = {
     // 4-й документ
     documentLimit: {
       check: (state) => state.documentsCount >= 3,
       show: 'plus_paywall',
     },

     // 6-й AI вопрос
     aiLimit: {
       check: (state) => state.aiQuestionsToday >= 5,
       show: 'ai_pack_offer',
     },

     // 7 дней активности
     engagedUser: {
       check: (state) => state.activeDays >= 7,
       show: 'trial_offer',
     },
   };
   ```

4. Создать хук usePaywall:
   ```typescript
   // hooks/usePaywall.ts
   export function usePaywall() {
     const { subscription } = useAuthStore();
     const [paywallState, setPaywallState] = useState<PaywallState | null>(null);

     const checkFeatureAccess = (feature: Feature): boolean => {
       const required = featureRequirements[feature];
       if (subscription.tier >= required) return true;

       setPaywallState({ feature, required });
       return false;
     };

     return { checkFeatureAccess, paywallState, closePaywall };
   }
   ```

5. Интегрировать в FeatureGate:
   ```typescript
   // components/ui/FeatureGate.tsx
   export function FeatureGate({ feature, children, fallback }) {
     const { checkFeatureAccess, paywallState } = usePaywall();

     if (!checkFeatureAccess(feature)) {
       return fallback || <FeatureLockedCard feature={feature} />;
     }

     return children;
   }
   ```

6. Добавить аналитику:
   - Tracking показов paywall
   - Tracking конверсий
   - A/B тестирование сообщений

## Файлы для создания
- apps/frontend/src/components/paywall/PaywallSheet.tsx
- apps/frontend/src/components/paywall/PlanCard.tsx
- apps/frontend/src/components/paywall/TrialOffer.tsx
- apps/frontend/src/components/paywall/AiPackOffer.tsx
- apps/frontend/src/services/conversion-triggers.ts
- apps/frontend/src/hooks/usePaywall.ts
- apps/frontend/src/config/feature-requirements.ts

## Критерии готовности
- [ ] Paywall показывается при превышении лимитов
- [ ] Все триггеры работают
- [ ] Планы отображаются с ценами
- [ ] Кнопки подписки работают (заглушка)
- [ ] Аналитика отправляется

## После завершения
```bash
cd apps/frontend && npm run type-check && npm run lint
```
```

---

### Задача 11: Migration & Cleanup

```
## Задача: Миграция и очистка кода

## Контекст
После создания новых компонентов нужно:
- Удалить устаревший код
- Обновить импорты
- Проверить все роуты

## Цель
Очистить проект от устаревшего кода и обеспечить работоспособность.

## Шаги
1. Удалить или архивировать старые компоненты:
   - apps/frontend/src/app/(auth)/welcome/ → убрать редирект
   - apps/frontend/src/components/onboarding/ → оставить для полной регистрации
   - Старый DashboardLayout → заменить на новый

2. Обновить все импорты:
   ```bash
   # Найти все импорты старых компонентов
   grep -r "import.*HomeScreen" apps/frontend/src/
   grep -r "import.*DashboardLayout" apps/frontend/src/
   ```

3. Обновить роутинг:
   ```
   / → AnonymousDashboard или PersonalDashboard
   /checklist → ChecklistScreen (новый)
   /checks → ChecksScreen (новый)
   /sos → SOSScreen (новый)
   /documents → DocumentsScreen (существующий)
   /profile → ProfileScreen (существующий)
   /login → LoginScreen (новый)
   ```

4. Обновить локализацию:
   - Добавить новые ключи для анонимного режима
   - Убрать неиспользуемые ключи

5. Проверить все страницы:
   ```typescript
   // Создать чек-лист страниц
   const pages = [
     { path: '/', component: 'Dashboard', works: false },
     { path: '/checklist', component: 'Checklist', works: false },
     // ...
   ];
   ```

6. Запустить линтер и исправить ошибки:
   ```bash
   npm run lint -- --fix
   npm run type-check
   ```

7. Проверить сборку:
   ```bash
   npm run build
   ```

## Файлы для изменения/удаления
- Удалить: apps/frontend/src/app/(auth)/welcome/page.tsx (или оставить для deep link)
- Обновить: apps/frontend/src/app/(main)/layout.tsx
- Обновить: apps/frontend/src/providers/providers.tsx
- Обновить: apps/frontend/src/locales/*.json

## Критерии готовности
- [ ] Нет ошибок TypeScript
- [ ] Нет ошибок ESLint
- [ ] Build проходит успешно
- [ ] Все страницы открываются
- [ ] Нет мёртвого кода

## После завершения
```bash
cd apps/frontend && npm run lint && npm run type-check && npm run build
```
```

---

## PHASE 4: TESTING

### Задача 12: E2E Testing & QA

```
## Задача: E2E тестирование и QA

## Контекст
Финальная проверка всех flows перед релизом.

## Цель
Создать E2E тесты и провести ручное QA.

## Шаги
1. Установить Playwright (если нет):
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. Создать E2E тесты для анонимного flow:
   ```typescript
   // tests/e2e/anonymous-flow.spec.ts
   test.describe('Anonymous User Flow', () => {
     test('can use calculator without registration', async ({ page }) => {
       await page.goto('/');
       await page.click('[data-testid="calculator-card"]');
       await page.fill('[data-testid="entry-date"]', '2026-01-15');
       await expect(page.locator('[data-testid="days-remaining"]')).toBeVisible();
     });

     test('triggers registration on save', async ({ page }) => {
       await page.goto('/');
       await page.click('[data-testid="calculator-card"]');
       await page.fill('[data-testid="entry-date"]', '2026-01-15');
       await page.click('[data-testid="save-result"]');
       await expect(page.locator('[data-testid="quick-registration"]')).toBeVisible();
     });

     test('SOS is always accessible', async ({ page }) => {
       await page.goto('/sos');
       await expect(page.locator('[data-testid="emergency-112"]')).toBeVisible();
     });
   });
   ```

3. Создать E2E тесты для регистрации:
   ```typescript
   // tests/e2e/registration-flow.spec.ts
   test.describe('Quick Registration', () => {
     test('completes registration in 3 steps', async ({ page }) => {
       // ...
     });
   });
   ```

4. Создать E2E тесты для paywall:
   ```typescript
   // tests/e2e/paywall.spec.ts
   test.describe('Paywall', () => {
     test('shows paywall on 4th document', async ({ page }) => {
       // ...
     });
   });
   ```

5. Ручное QA - чек-лист:
   ```markdown
   ## QA Checklist

   ### Анонимный режим
   - [ ] Приложение открывается на dashboard
   - [ ] Калькулятор 90/180 работает
   - [ ] Калькулятор патента работает
   - [ ] Проверка запрета работает
   - [ ] SOS доступен
   - [ ] Экзамен (10 вопросов) работает
   - [ ] AI (3 вопроса) работает

   ### Регистрация
   - [ ] QuickRegistration открывается при триггере
   - [ ] Все 3 поля работают
   - [ ] После регистрации → PersonalDashboard

   ### Зарегистрированный режим
   - [ ] Персональный dashboard показывает данные
   - [ ] Документы сохраняются
   - [ ] Напоминания работают

   ### Paywall
   - [ ] 4-й документ → paywall
   - [ ] 6-й AI вопрос → paywall

   ### Общее
   - [ ] Локализация (все 5 языков)
   - [ ] Responsive дизайн
   - [ ] Темная тема
   - [ ] Offline режим
   ```

6. Исправить найденные баги

## Файлы для создания
- apps/frontend/tests/e2e/anonymous-flow.spec.ts
- apps/frontend/tests/e2e/registration-flow.spec.ts
- apps/frontend/tests/e2e/paywall.spec.ts
- apps/frontend/tests/e2e/sos.spec.ts
- apps/frontend/playwright.config.ts

## Критерии готовности
- [ ] Все E2E тесты проходят
- [ ] Ручной QA чек-лист выполнен
- [ ] Критические баги исправлены
- [ ] Производительность приемлема

## После завершения
```bash
cd apps/frontend && npx playwright test
```
```

---

## Порядок запуска

```
┌────────────────────────────────────────────────────────────────────────┐
│                         EXECUTION ORDER                                 │
└────────────────────────────────────────────────────────────────────────┘

PHASE 1 (параллельно):
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Задача 1   │  Задача 2   │  Задача 3   │  Задача 4   │
│   Stores    │  UI Comps   │  Quick Reg  │    SOS      │
└─────────────┴─────────────┴─────────────┴─────────────┘
      │             │             │             │
      └─────────────┴─────────────┴─────────────┘
                         │
                         ▼
PHASE 2 (последовательно, зависит от Phase 1):
┌─────────────┐
│  Задача 5   │ ← Использует компоненты из Задач 1-4
│  Anon Dash  │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Задача 6   │
│   Checks    │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Задача 7   │
│ Personal D. │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Задача 8   │
│  BottomNav  │
└─────────────┘
      │
      ▼
PHASE 3 (последовательно):
┌─────────────┐
│  Задача 9   │
│ Auth Refact │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Задача 10  │
│  Paywall    │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Задача 11  │
│  Cleanup    │
└─────────────┘
      │
      ▼
PHASE 4:
┌─────────────┐
│  Задача 12  │
│   Testing   │
└─────────────┘
```

---

## Команда для запуска первой задачи

Для запуска Phase 1 (4 задачи параллельно):

```
Запусти 4 агента параллельно для Phase 1:

1. Агент для Задачи 1 (Stores & Types)
2. Агент для Задачи 2 (Anonymous Components)
3. Агент для Задачи 3 (Quick Registration)
4. Агент для Задачи 4 (SOS Screen)

Каждый агент должен:
- Прочитать свою задачу из docs/REDESIGN_LAZY_AUTH_PLAN.md
- Выполнить все шаги
- Проверить критерии готовности
- Сообщить о завершении

После завершения Phase 1, запустить Phase 2 последовательно.
```

---

**Документ создан:** 2026-01-30
**Готов к выполнению:** Да
