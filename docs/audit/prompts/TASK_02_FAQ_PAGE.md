# Задача 2: Создание страницы FAQ

## Контекст
Компонент `FAQModal.tsx` существует в `apps/frontend/src/components/prototype/services/FAQModal.tsx`. Он содержит 22 вопроса-ответа на 5 языках, с категориями (патент, РВП, регистрация, документы, права) и поиском.

Сейчас это модальное окно. Нужно создать отдельную страницу `/faq`.

## Цель
Создать страницу `/faq` для отображения типовых вопросов на основе существующего компонента.

## Шаги
1. Прочитай компонент `apps/frontend/src/components/prototype/services/FAQModal.tsx`
2. Создай файл `apps/frontend/src/app/(main)/faq/page.tsx`
3. Адаптируй FAQModal для использования как страницы:
   - Убери модальное overlay
   - Добавь кнопку "назад" в header
   - Измени структуру на полноэкранную страницу
4. Сохрани всю функциональность: категории, поиск, разворачивание вопросов

## Код страницы
```tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

// Копируем данные и типы из FAQModal.tsx
// ... (скопировать faqData, categories, uiText)

export default function FAQPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ... (логика фильтрации из FAQModal)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{uiText.title[language]}</h1>
              <p className="text-xs text-sky-100">
                {faqData.length} {uiText.questionsCount[language]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Categories, FAQ List - как в FAQModal */}
    </div>
  );
}
```

## Файлы
- **Создать:** `apps/frontend/src/app/(main)/faq/page.tsx`
- **Читать:** `apps/frontend/src/components/prototype/services/FAQModal.tsx`

## Критерии готовности
- [ ] Страница `/faq` создана
- [ ] FAQ отображается с категориями
- [ ] Поиск работает
- [ ] Все 5 языков поддерживаются
- [ ] Кнопка "назад" работает
- [ ] `npm run build` проходит без ошибок

## После завершения
```bash
npm run typecheck && npm run build
git add apps/frontend/src/app/\(main\)/faq/page.tsx
git commit -m "feat(frontend): add FAQ page /faq"
```
