# Задача 4: Добавление ключей локализации для навигации

## Контекст
В `BottomNavigation.tsx` используются ключи:
- `nav.checklist`
- `nav.checks`
- `nav.sos`
- `nav.login`

Эти ключи отсутствуют в файлах локализации, поэтому на экране отображаются сами ключи вместо текста.

## Цель
Добавить отсутствующие ключи во все 5 файлов локализации.

## Шаги
1. Открой файл `apps/frontend/src/locales/ru.json`
2. Найди секцию `"nav"` (если её нет — создай)
3. Добавь ключи `checklist`, `checks`, `sos`, `login`
4. Повтори для остальных 4 файлов локализации

## Файлы локализации
- `apps/frontend/src/locales/ru.json`
- `apps/frontend/src/locales/en.json`
- `apps/frontend/src/locales/uz.json`
- `apps/frontend/src/locales/tg.json`
- `apps/frontend/src/locales/ky.json`

## Переводы для добавления

### ru.json
```json
"nav": {
  "main": "Главная навигация",
  "home": "Главная",
  "documents": "Документы",
  "services": "Сервисы",
  "calculator": "Калькулятор",
  "profile": "Профиль",
  "checklist": "Чек-лист",
  "checks": "Проверки",
  "sos": "SOS",
  "login": "Войти"
}
```

### en.json
```json
"nav": {
  "main": "Main navigation",
  "home": "Home",
  "documents": "Documents",
  "services": "Services",
  "calculator": "Calculator",
  "profile": "Profile",
  "checklist": "Checklist",
  "checks": "Checks",
  "sos": "SOS",
  "login": "Login"
}
```

### uz.json
```json
"nav": {
  "main": "Asosiy navigatsiya",
  "home": "Bosh sahifa",
  "documents": "Hujjatlar",
  "services": "Xizmatlar",
  "calculator": "Kalkulyator",
  "profile": "Profil",
  "checklist": "Roʻyxat",
  "checks": "Tekshirish",
  "sos": "SOS",
  "login": "Kirish"
}
```

### tg.json
```json
"nav": {
  "main": "Навигатсияи асосӣ",
  "home": "Саҳифаи асосӣ",
  "documents": "Ҳуҷҷатҳо",
  "services": "Хизматҳо",
  "calculator": "Калкулятор",
  "profile": "Профил",
  "checklist": "Рӯйхат",
  "checks": "Санҷиш",
  "sos": "SOS",
  "login": "Даромадан"
}
```

### ky.json
```json
"nav": {
  "main": "Негизги навигация",
  "home": "Башкы бет",
  "documents": "Документтер",
  "services": "Кызматтар",
  "calculator": "Калькулятор",
  "profile": "Профиль",
  "checklist": "Тизме",
  "checks": "Текшерүү",
  "sos": "SOS",
  "login": "Кирүү"
}
```

## Критерии готовности
- [ ] Все 4 новых ключа добавлены в ru.json
- [ ] Все 4 новых ключа добавлены в en.json
- [ ] Все 4 новых ключа добавлены в uz.json
- [ ] Все 4 новых ключа добавлены в tg.json
- [ ] Все 4 новых ключа добавлены в ky.json
- [ ] Навигация отображает текст вместо ключей
- [ ] `npm run build` проходит без ошибок

## После завершения
```bash
npm run typecheck && npm run build
git add apps/frontend/src/locales/*.json
git commit -m "fix(i18n): add missing nav localization keys"
```
