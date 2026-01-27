'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Target, ClipboardCheck, Play, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ExamMode, QuestionCategory } from '@/features/exam/types';

const modeConfig = {
  [ExamMode.LEARNING]: {
    titleKey: 'exam.modes.learning.title',
    descriptionKey: 'exam.modes.learning.description',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  [ExamMode.PRACTICE]: {
    titleKey: 'exam.modes.practice.title',
    descriptionKey: 'exam.modes.practice.description',
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  [ExamMode.EXAM]: {
    titleKey: 'exam.modes.exam.title',
    descriptionKey: 'exam.modes.exam.description',
    icon: ClipboardCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  [ExamMode.MARATHON]: {
    titleKey: 'exam.modes.exam.title',
    descriptionKey: 'exam.modes.exam.description',
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

const categoryConfig = {
  all: {
    titleKey: 'exam.start.allCategories',
    value: 'all' as const,
  },
  [QuestionCategory.RUSSIAN_LANGUAGE]: {
    titleKey: 'exam.categories.russian',
    value: QuestionCategory.RUSSIAN_LANGUAGE,
  },
  [QuestionCategory.HISTORY]: {
    titleKey: 'exam.categories.history',
    value: QuestionCategory.HISTORY,
  },
  [QuestionCategory.LAW]: {
    titleKey: 'exam.categories.law',
    value: QuestionCategory.LAW,
  },
};

const questionCounts = [5, 10, 20, 30];

function ExamStartContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = (searchParams.get('mode') as ExamMode) || ExamMode.PRACTICE;
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedCount, setSelectedCount] = useState(10);

  const currentModeConfig = modeConfig[mode] || modeConfig[ExamMode.PRACTICE];
  const ModeIcon = currentModeConfig.icon;

  const handleStart = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    params.set('count', selectedCount.toString());
    router.push(`/exam/session?${params.toString()}`);
  };

  const handleBack = () => {
    router.push('/exam');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t('exam.start.back')}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {t('exam.start.title')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Mode indicator */}
        <div className={`mb-6 p-4 rounded-xl border-2 ${currentModeConfig.bgColor} ${currentModeConfig.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              <ModeIcon className={`w-6 h-6 ${currentModeConfig.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t(currentModeConfig.titleKey)}
              </h2>
              <p className="text-sm text-gray-600">
                {t(currentModeConfig.descriptionKey)}
              </p>
            </div>
          </div>
        </div>

        {/* Category selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('exam.start.selectCategory')}
          </h3>
          <div className="space-y-2">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const isSelected = selectedCategory === config.value;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(config.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {t(config.titleKey)}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question count selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('exam.start.selectCount')}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {questionCounts.map((count) => {
              const isSelected = selectedCount === count;
              return (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-pb">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Play className="w-5 h-5" />
          {t('exam.start.startButton')}
        </button>
      </div>
    </div>
  );
}

function ExamStartLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header skeleton */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-4">
        {/* Mode indicator skeleton */}
        <div className="mb-6 p-4 rounded-xl border-2 border-gray-200 bg-gray-100 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div>
              <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Category skeleton */}
        <div className="mb-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Count skeleton */}
        <div className="mb-6">
          <div className="h-4 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamStartPage() {
  return (
    <Suspense fallback={<ExamStartLoading />}>
      <ExamStartContent />
    </Suspense>
  );
}
