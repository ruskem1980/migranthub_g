'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { faqData, faqCategories, LocalizedText } from '@/components/prototype/services/FAQModal';

const uiText: Record<string, LocalizedText> = {
  title: {
    ru: 'Частые вопросы',
    en: 'FAQ',
    uz: 'Tez-tez soʻraladigan savollar',
    tg: 'Саволҳои зуд-зуд пурсидашаванда',
    ky: 'Көп берилүүчү суроолор',
  },
  searchPlaceholder: {
    ru: 'Поиск по вопросам...',
    en: 'Search questions...',
    uz: 'Savollarni qidirish...',
    tg: 'Ҷустуҷӯи саволҳо...',
    ky: 'Суроолорду издөө...',
  },
  noResults: {
    ru: 'Вопросы не найдены',
    en: 'No questions found',
    uz: 'Savollar topilmadi',
    tg: 'Саволҳо ёфт нашуданд',
    ky: 'Суроолор табылган жок',
  },
  questionsCount: {
    ru: 'вопросов',
    en: 'questions',
    uz: 'savol',
    tg: 'савол',
    ky: 'суроо',
  },
};

export default function FAQPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        item.question[language].toLowerCase().includes(searchLower) ||
        item.answer[language].toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, language]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={uiText.searchPlaceholder[language]}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="px-4 pb-4">
        {filteredFAQ.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{uiText.noResults[language]}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {item.question[language]}
                  </span>
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {item.answer[language]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
