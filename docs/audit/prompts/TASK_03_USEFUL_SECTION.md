# Задача 3: Обновление UsefulSection — исправление ссылок

## Контекст
В `UsefulSection.tsx` кнопки ведут на:
- `/ai` — AI ассистент (после Task 1 будет работать)
- `/rights` — "Ваши права" (страница НЕ существует)

Нужно заменить `/rights` на `/faq` (созданную в Task 2).

## Цель
Исправить ссылки в UsefulSection чтобы все кнопки работали.

## Шаги
1. Открой `apps/frontend/src/components/anonymous/UsefulSection.tsx`
2. Найди строку 60 где `onClick={() => router.push('/rights')}`
3. Замени `/rights` на `/faq`
4. Обнови title и description для этой кнопки
5. Проверь что все 4 кнопки секции ведут на существующие страницы

## Изменения

**Было (строка 56-62):**
```tsx
<QuickActionCard
  icon={Scale}
  title={language === 'ru' ? 'Ваши права' : 'Your Rights'}
  description={language === 'ru' ? 'Юридическая информация' : 'Legal information'}
  onClick={() => router.push('/rights')}
  variant="default"
/>
```

**Стало:**
```tsx
<QuickActionCard
  icon={HelpCircle}  // или Scale
  title={language === 'ru' ? 'Частые вопросы' : 'FAQ'}
  description={language === 'ru' ? 'Ответы на популярные вопросы' : 'Answers to common questions'}
  onClick={() => router.push('/faq')}
  variant="default"
/>
```

Также добавь импорт `HelpCircle` если используешь:
```tsx
import { ClipboardList, GraduationCap, MessageSquare, Scale, HelpCircle } from 'lucide-react';
```

## Файлы
- **Изменить:** `apps/frontend/src/components/anonymous/UsefulSection.tsx`

## Критерии готовности
- [ ] Ссылка на `/ai` работает (кнопка "AI ассистент")
- [ ] Ссылка на `/faq` работает (кнопка "Частые вопросы")
- [ ] Все 4 кнопки в секции кликабельны и ведут на существующие страницы
- [ ] `npm run build` проходит без ошибок

## После завершения
```bash
npm run typecheck && npm run build
git add apps/frontend/src/components/anonymous/UsefulSection.tsx
git commit -m "fix(frontend): update UsefulSection links to AI and FAQ"
```
