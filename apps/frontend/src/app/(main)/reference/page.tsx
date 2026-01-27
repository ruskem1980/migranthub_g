'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, FileText, Download, HelpCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { legalApi } from '@/lib/api/client';
import type { CategoryDto, LawDto, FormDto, FaqItemDto } from '@/lib/api/types';
import { CategoryList, LawsList, FormsList, FaqAccordion } from '@/features/reference/components';

type TabType = 'categories' | 'laws' | 'forms' | 'faq';

const tabs: { id: TabType; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { id: 'categories', icon: BookOpen, labelKey: 'reference.tabs.categories' },
  { id: 'laws', icon: FileText, labelKey: 'reference.tabs.laws' },
  { id: 'forms', icon: Download, labelKey: 'reference.tabs.forms' },
  { id: 'faq', icon: HelpCircle, labelKey: 'reference.tabs.faq' },
];

export default function ReferencePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [laws, setLaws] = useState<LawDto[]>([]);
  const [forms, setForms] = useState<FormDto[]>([]);
  const [faq, setFaq] = useState<FaqItemDto[]>([]);

  const [loading, setLoading] = useState({
    categories: true,
    laws: true,
    forms: true,
    faq: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'laws') {
      loadLaws();
    } else if (activeTab === 'forms') {
      loadForms();
    } else if (activeTab === 'faq') {
      loadFaq();
    }
  }, [activeTab, selectedCategory, searchQuery]);

  async function loadCategories() {
    try {
      const data = await legalApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  }

  async function loadLaws() {
    setLoading((prev) => ({ ...prev, laws: true }));
    try {
      const data = await legalApi.getLaws(selectedCategory || undefined, searchQuery || undefined);
      setLaws(data);
    } catch (error) {
      console.error('Failed to load laws:', error);
    } finally {
      setLoading((prev) => ({ ...prev, laws: false }));
    }
  }

  async function loadForms() {
    setLoading((prev) => ({ ...prev, forms: true }));
    try {
      const data = await legalApi.getForms(selectedCategory || undefined);
      setForms(data);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading((prev) => ({ ...prev, forms: false }));
    }
  }

  async function loadFaq() {
    setLoading((prev) => ({ ...prev, faq: true }));
    try {
      const data = await legalApi.getFaq(selectedCategory || undefined);
      setFaq(data);
    } catch (error) {
      console.error('Failed to load FAQ:', error);
    } finally {
      setLoading((prev) => ({ ...prev, faq: false }));
    }
  }

  function handleCategorySelect(categoryId: string | null) {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setActiveTab('laws');
    }
  }

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('reference.title')}
              </h1>
              {selectedCategoryName && (
                <p className="text-sm text-gray-500">{selectedCategoryName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search (only for laws tab) */}
      {activeTab === 'laws' && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('reference.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {activeTab === 'categories' && (
          <CategoryList
            categories={categories}
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {activeTab === 'laws' && (
          <LawsList laws={laws} loading={loading.laws} />
        )}

        {activeTab === 'forms' && (
          <FormsList forms={forms} loading={loading.forms} />
        )}

        {activeTab === 'faq' && (
          <FaqAccordion items={faq} loading={loading.faq} />
        )}
      </div>
    </div>
  );
}
