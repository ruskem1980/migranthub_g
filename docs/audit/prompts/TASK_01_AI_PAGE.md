# Задача 1: Создание страницы AI ассистента

## Контекст
Компонент `AIChatPanel.tsx` существует в `apps/frontend/src/components/assistant/AIChatPanel.tsx`, но страница `/ai` не создана. В `UsefulSection.tsx` есть ссылка на `/ai`, которая сейчас ведёт на 404.

## Цель
Создать страницу `/ai` которая отображает AI чат-бот.

## Шаги
1. Прочитай компонент `apps/frontend/src/components/assistant/AIChatPanel.tsx` чтобы понять его структуру
2. Создай файл `apps/frontend/src/app/(main)/ai/page.tsx`
3. Импортируй и используй компонент `AIChatPanel`
4. Добавь padding-bottom для нижней навигации (pb-20)
5. Проверь что страница работает

## Код страницы
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

## Файлы
- **Создать:** `apps/frontend/src/app/(main)/ai/page.tsx`
- **Читать:** `apps/frontend/src/components/assistant/AIChatPanel.tsx`

## Критерии готовности
- [ ] Файл `apps/frontend/src/app/(main)/ai/page.tsx` создан
- [ ] Страница открывается по адресу `/ai`
- [ ] AI чат отображается и работает
- [ ] `npm run typecheck` проходит без ошибок
- [ ] `npm run build` проходит без ошибок

## После завершения
```bash
npm run typecheck && npm run build
git add apps/frontend/src/app/\(main\)/ai/page.tsx
git commit -m "feat(frontend): add AI assistant page /ai"
```
