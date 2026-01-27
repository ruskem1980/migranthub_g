# Задача #16: Release — App Store & Play Store

## Статус: ⏸️ Ожидает выполнения

## Оценка

| Критерий | Значение |
|----------|----------|
| Файлов | ~6-8 |
| Строк кода/контента | ~500-600 |
| Подзадачи | 2 |
| Параллельный запуск | ✅ Да |

---

## Подзадачи

| # | Название | Статус | Коммит |
|---|----------|--------|--------|
| 16.1 | Capacitor Production Config | ⏸️ | — |
| 16.2 | Docs: Privacy & Store Listings | ⏸️ | — |

---

## Промпт 16.1: Capacitor Production Configuration

```
## Задача 16.1: Capacitor Production Build Configuration

### Контекст
MigrantHub - мобильное приложение на Next.js + Capacitor 8.
Структура: apps/frontend/

Существующие файлы:
- capacitor.config.ts - базовая конфигурация
- package.json - скрипты разработки

### Цель
Настроить Capacitor для production сборок iOS и Android.

### Требования

1. **apps/frontend/capacitor.config.ts** — обновить:
   - Убрать server.url для production (только для dev)
   - Добавить iOS/Android специфичные настройки
   - backgroundColor, splashScreen если нужно

2. **apps/frontend/package.json** — добавить скрипты:
   ```json
   "build:mobile": "next build && npx cap sync",
   "build:ios": "npm run build:mobile && npx cap open ios",
   "build:android": "npm run build:mobile && npx cap open android"
   ```

3. **apps/frontend/scripts/build-mobile.sh** — скрипт сборки:
   - Проверка переменных окружения
   - Очистка предыдущих сборок
   - Сборка Next.js
   - Синхронизация Capacitor

### Файлы для чтения
- apps/frontend/capacitor.config.ts
- apps/frontend/package.json
- apps/frontend/next.config.ts

### Acceptance Criteria
- [ ] capacitor.config.ts готов для production
- [ ] Скрипты сборки добавлены в package.json
- [ ] build-mobile.sh создан и исполняемый

### Результат
Коммит: "Build: Capacitor production configuration (#16.1)"
```

---

## Промпт 16.2: Privacy Policy & Store Listings

```
## Задача 16.2: Privacy Policy & Store Listings

### Контекст
MigrantHub - приложение для мигрантов в России.
Ключевая особенность: local-first, все PII хранятся только на устройстве.

Собираемые данные:
- device_id (для аутентификации)
- Analytics события (без PII)
- Crash reports (Sentry, без PII)

### Цель
Создать Privacy Policy и описания для App Store / Play Store.

### Требования

1. **docs/legal/PRIVACY_POLICY.md**:
   - Русский и английский языки
   - GDPR/152-ФЗ compliant
   - Акцент на local-first архитектуру
   - Какие данные собираются и зачем
   - Права пользователя
   - Контактная информация

2. **docs/legal/STORE_LISTING.md**:
   - App name: MigrantHub
   - Short description (80 символов) — RU/EN
   - Full description (до 4000 символов) — RU/EN
   - Keywords для ASO
   - Категория: Productivity / Lifestyle

   Основа для описания:
   ```
   MigrantHub — ваш помощник в России

   • Храните документы безопасно (паспорт, миграционная карта, патент)
   • Все данные на вашем устройстве
   • Напоминания о сроках документов
   • Калькулятор 90/180 дней
   • Проверка запрета на въезд
   • 4 языка: RU, UZ, TG, KG
   ```

3. **docs/RELEASE_CHECKLIST.md**:
   - Чеклист для iOS (App Store Connect)
   - Чеклист для Android (Google Play Console)
   - Требования к assets (размеры иконок, скриншотов)
   - Ссылки на консоли разработчика

### Acceptance Criteria
- [ ] Privacy Policy на RU и EN
- [ ] Store descriptions на RU и EN
- [ ] Release checklist с пошаговыми инструкциями

### Результат
Коммит: "Docs: Privacy policy and store listings (#16.2)"
```

---

## Ручные действия (после выполнения подзадач)

После завершения 16.1 и 16.2 требуется ручная работа:

### iOS (App Store)
- [ ] Apple Developer Account ($99/год)
- [ ] Certificates & Provisioning Profiles
- [ ] App icon 1024x1024
- [ ] Screenshots (6.5", 5.5")
- [ ] TestFlight build
- [ ] Submit for review

### Android (Play Store)
- [ ] Google Play Console ($25 одноразово)
- [ ] Signing key (upload key)
- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Screenshots (phone, tablet)
- [ ] Internal testing → Production
