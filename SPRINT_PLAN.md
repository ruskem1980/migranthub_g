# MigrantHub - План реализации MVP за 2 дня

> 6 спринтов | Дедлайн: 2 дня | Старт: 2026-01-23

---

## Распределение времени

| Спринт | Задачи | Время |
|--------|--------|-------|
| Sprint 0 | Инфраструктура | 3-4 ч |
| Sprint 1 | Авторизация | 4-5 ч |
| Sprint 2 | Профиль + OCR | 4-5 ч |
| Sprint 3 | Документы + PDF | 4-5 ч |
| Sprint 4 | Карты + Сервисы | 3-4 ч |
| Sprint 5 | Платежи + Push | 3-4 ч |
| Sprint 6 | Полировка | 2-3 ч |
| **Итого** | | **~24-30 ч** |

---

## Sprint 0: Инфраструктура (3-4 ч)

### 0.1 Capacitor Setup
```bash
# Установка
npm install @capacitor/core @capacitor/cli
npx cap init MigrantHub ru.migranthub.app

# Платформы
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

**Файлы:**
- [ ] `capacitor.config.ts` - конфигурация
- [ ] `apps/frontend/android/` - Android проект
- [ ] `apps/frontend/ios/` - iOS проект

### 0.2 PWA + Service Worker
- [ ] `public/manifest.json` - PWA манифест
- [ ] `public/sw.js` - Service Worker (Workbox)
- [ ] `next.config.js` - PWA настройки

### 0.3 Базовая структура
```
/apps/frontend/src
├── /lib
│   ├── /api           # API клиент
│   ├── /stores        # Zustand stores
│   ├── /hooks         # Custom hooks
│   └── /db            # Dexie.js setup
├── /features
│   ├── /auth
│   ├── /profile
│   ├── /documents
│   └── /services
└── /locales           # i18n файлы
```

### 0.4 Зависимости
```bash
npm install zustand @tanstack/react-query dexie
npm install react-hook-form zod @hookform/resolvers
npm install workbox-precaching workbox-routing
```

---

## Sprint 1: Авторизация (4-5 ч)

### 1.1 Auth Store (Zustand)
**Файл:** `src/lib/stores/authStore.ts`
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
}
```

### 1.2 Auth API Client
**Файл:** `src/lib/api/auth.ts`
- [ ] `sendOtp(phone)` - отправка SMS
- [ ] `verifyOtp(phone, code)` - проверка кода
- [ ] `refreshToken()` - обновление токена
- [ ] `logout()` - выход

### 1.3 Auth UI Pages
- [ ] `/auth/phone` - ввод телефона
- [ ] `/auth/otp` - ввод OTP кода
- [ ] `/auth/onboarding` - выбор языка + гражданства

### 1.4 Telegram Login Widget
**Файл:** `src/features/auth/TelegramLogin.tsx`
```typescript
// Telegram Login Widget для PWA
<script src="https://telegram.org/js/telegram-widget.js" />
```

### 1.5 Auth Middleware
**Файл:** `src/middleware.ts`
- [ ] Защита роутов
- [ ] Редирект неавторизованных

---

## Sprint 2: Профиль + OCR (4-5 ч)

### 2.1 Profile Store
**Файл:** `src/lib/stores/profileStore.ts`
```typescript
interface ProfileState {
  profile: UserProfile | null;
  documents: Document[];
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addDocument: (doc: Document) => Promise<void>;
}
```

### 2.2 IndexedDB Schema (Dexie)
**Файл:** `src/lib/db/index.ts`
```typescript
class MigrantHubDB extends Dexie {
  profiles!: Table<Profile>;
  documents!: Table<Document>;
  forms!: Table<FormData>;
}
```

### 2.3 OCR Integration
**Файл:** `src/features/profile/PassportScanner.tsx`
```bash
npm install capacitor-cyrillic-ocr browser-image-compression
```

Флоу:
1. Camera.getPhoto() → сделать фото
2. imageCompression() → сжать до 1MB
3. CyrillicOcr.recognizeText() → распознать
4. parsePassportText() → парсинг полей
5. form.setValue() → автозаполнение

### 2.4 Profile UI
- [ ] `/profile` - основной экран
- [ ] `/profile/edit` - редактирование
- [ ] `/profile/documents` - список документов
- [ ] Компонент `PassportScanner`
- [ ] Компонент `DocumentCard`

---

## Sprint 3: Документы + PDF (4-5 ч)

### 3.1 Forms Registry
**Файл:** `src/features/documents/formsRegistry.ts`
```typescript
const FORMS_REGISTRY = [
  { id: 'notification', title: 'Уведомление о прибытии', category: 'registration' },
  { id: 'patent-initial', title: 'Заявление на патент', category: 'patent' },
  { id: 'registration-ext', title: 'Продление регистрации', category: 'registration' },
  // ... все 12 форм
];
```

### 3.2 Form Templates (Zod schemas)
**Файл:** `src/features/documents/schemas/`
- [ ] `notificationSchema.ts`
- [ ] `patentSchema.ts`
- [ ] `registrationSchema.ts`
- [ ] ... остальные

### 3.3 PDF Generation
**Файл:** `src/lib/pdf/generator.ts`
```bash
npm install @react-pdf/renderer
```

```typescript
// Серверная генерация для сложных форм
// Клиентская для простых
const generatePDF = async (formType: string, data: FormData) => {
  if (COMPLEX_FORMS.includes(formType)) {
    return await api.post('/pdf/generate', { formType, data });
  }
  return generateClientPDF(formType, data);
};
```

### 3.4 Document Generator UI
- [ ] Улучшить существующий `DocumentGenerator.tsx`
- [ ] Добавить превью PDF
- [ ] Добавить историю сгенерированных документов

---

## Sprint 4: Карты + Сервисы (3-4 ч)

### 4.1 Yandex Maps Integration
**Файл:** `src/features/maps/YandexMap.tsx`
```typescript
// Yandex Maps API v3
import { YMaps, Map, Placemark, Clusterer } from '@pbe/react-yandex-maps';
```

```bash
npm install @pbe/react-yandex-maps
```

### 4.2 POI Data
**Файл:** `src/features/maps/poi.ts`
```typescript
interface POI {
  id: string;
  type: 'mvd' | 'mmc' | 'medical' | 'exam' | 'mosque';
  name: string;
  address: string;
  coordinates: [number, number];
  workingHours?: string;
  phone?: string;
}
```

### 4.3 Services Implementation
- [ ] `BanCheckService.tsx` - проверка запрета въезда
- [ ] `StayCalculator.tsx` - калькулятор 90/180
- [ ] `TranslatorDeeplink.tsx` - deeplink на Яндекс.Переводчик
- [ ] `ExamTrainer.tsx` - тренажер экзамена

### 4.4 2GIS Fallback
**Файл:** `src/features/maps/use2GIS.ts`
```typescript
// Deeplink на 2GIS для построения маршрута
const open2GISRoute = (destination: [number, number]) => {
  window.open(`dgis://2gis.ru/routeSearch/...`);
};
```

---

## Sprint 5: Платежи + Push (3-4 ч)

### 5.1 Payment Integration
**Файл:** `src/features/payments/`

```typescript
// СБП QR-код генерация
const generateSBPLink = (amount: number, purpose: string) => {
  return `https://qr.nspk.ru/...`;
};

// ЮKassa виджет
import { YooKassaWidget } from '@yookassa/checkout-widget';
```

### 5.2 Patent Payment Flow
- [ ] Выбор региона → расчет суммы
- [ ] Генерация QR для СБП
- [ ] Альтернатива через ЮKassa
- [ ] История платежей

### 5.3 Push Notifications
**Файл:** `src/lib/push/index.ts`

```bash
npm install @capacitor/push-notifications
```

```typescript
// FCM для iOS/Android
const registerPush = async () => {
  const permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
  }
};
```

### 5.4 Notification Types
- [ ] Напоминание о патенте
- [ ] Напоминание о регистрации
- [ ] Новости и изменения законов
- [ ] SOS уведомления

---

## Sprint 6: Полировка (2-3 ч)

### 6.1 Локализация
**Файлы:**
- [ ] `locales/ru.json` - полный
- [ ] `locales/uz-Latn.json` - основной
- [ ] `locales/tg.json` - основной
- [ ] `locales/ky.json` - основной

### 6.2 Темная тема
```typescript
// Уже настроено через Tailwind
// Проверить все компоненты на dark: классы
```

### 6.3 Accessibility
- [ ] ARIA labels на всех кнопках
- [ ] Focus states
- [ ] Контрастность текста

### 6.4 Performance
- [ ] Lazy loading для тяжелых компонентов
- [ ] Image optimization
- [ ] Bundle analysis

### 6.5 Финальная сборка
```bash
# Web
npm run build

# iOS
npx cap sync ios
npx cap open ios

# Android
npx cap sync android
npx cap open android
```

---

## Критический путь (Must Have)

Если время поджимает, фокус на:

1. **Auth** - вход по телефону работает
2. **Profile** - можно заполнить данные
3. **Documents** - генерация хотя бы 3 форм
4. **Offline** - приложение работает без сети

---

## Команды для старта

```bash
# Перейти в frontend
cd apps/frontend

# Установить все зависимости
npm install

# Запустить dev сервер
npm run dev

# В новом терминале - мобильная сборка
npx cap sync
```

---

## Чеклист готовности

- [ ] Авторизация работает (SMS/Telegram)
- [ ] Профиль заполняется и сохраняется
- [ ] OCR сканирует паспорт
- [ ] Документы генерируются в PDF
- [ ] Карта показывает точки МВД
- [ ] Оплата патента работает
- [ ] Push-уведомления приходят
- [ ] Приложение работает offline
- [ ] Собирается для iOS
- [ ] Собирается для Android
