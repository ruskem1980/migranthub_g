'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Languages,
  Book,
  Scale,
  BookOpen,
  Target,
  ClipboardCheck,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useExamStore } from '@/features/exam/stores';
import { QuestionCategory, ExamMode } from '@/features/exam/types';

const validCategories = ['russian_language', 'history', 'law'];

const categoryConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    progressColor: string;
  }
> = {
  russian_language: {
    icon: Languages,
    titleKey: 'exam.categoryCard.russian',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    accentColor: 'bg-blue-600',
    progressColor: 'bg-blue-500',
  },
  history: {
    icon: Book,
    titleKey: 'exam.categoryCard.history',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    accentColor: 'bg-amber-600',
    progressColor: 'bg-amber-500',
  },
  law: {
    icon: Scale,
    titleKey: 'exam.categoryCard.law',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    accentColor: 'bg-emerald-600',
    progressColor: 'bg-emerald-500',
  },
};

const examModes = [
  {
    mode: ExamMode.LEARNING,
    titleKey: 'exam.modes.learning.title',
    descriptionKey: 'exam.modes.learning.description',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBgColor: 'hover:bg-blue-100',
    borderColor: 'border-blue-200',
  },
  {
    mode: ExamMode.PRACTICE,
    titleKey: 'exam.modes.practice.title',
    descriptionKey: 'exam.modes.practice.description',
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverBgColor: 'hover:bg-amber-100',
    borderColor: 'border-amber-200',
  },
  {
    mode: ExamMode.EXAM,
    titleKey: 'exam.modes.exam.title',
    descriptionKey: 'exam.modes.exam.description',
    icon: ClipboardCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverBgColor: 'hover:bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
];

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const { t } = useTranslation();
  const router = useRouter();
  const progress = useExamStore((state) => state.progress);

  // Validate category
  useEffect(() => {
    if (!validCategories.includes(category)) {
      router.replace('/exam');
    }
  }, [category, router]);

  if (!validCategories.includes(category)) {
    return null;
  }

  const config = categoryConfig[category];
  const Icon = config.icon;
  const categoryProgress = progress.byCategory[category as QuestionCategory];

  const percentage =
    categoryProgress && categoryProgress.answered > 0
      ? Math.round((categoryProgress.correct / categoryProgress.answered) * 100)
      : 0;

  const handleModeClick = (mode: ExamMode) => {
    router.push(`/exam/session?mode=${mode}&category=${category}`);
  };

  const handleBack = () => {
    router.push('/exam');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex-shrink-0 ${config.bgColor} border-b border-gray-200 px-4 py-4`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className={`w-6 h-6 ${config.textColor}`} />
          </button>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
            <Icon className={`w-6 h-6 ${config.textColor}`} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${config.textColor}`}>
              {t(config.titleKey)}
            </h1>
            <p className="text-sm text-gray-600">{t('exam.title')}</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {categoryProgress?.answered || 0}
              </div>
              <div className="text-xs text-gray-500">{t('exam.progress.answered')}</div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {categoryProgress?.correct || 0}
              </div>
              <div className="text-xs text-gray-500">{t('exam.progress.correct')}</div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className={`text-2xl font-bold ${
                percentage >= 70
                  ? 'text-emerald-600'
                  : percentage >= 50
                    ? 'text-amber-600'
                    : percentage > 0
                      ? 'text-red-600'
                      : 'text-gray-400'
              }`}>
                {percentage}%
              </div>
              <div className="text-xs text-gray-500">{t('exam.stats.success')}</div>
            </div>
          </div>

          {/* Progress bar */}
          {categoryProgress && categoryProgress.answered > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${config.progressColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Mode Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('exam.ui.selectMode')}
          </h2>
          <div className="space-y-3">
            {examModes.map((modeConfig) => {
              const ModeIcon = modeConfig.icon;
              return (
                <button
                  key={modeConfig.mode}
                  onClick={() => handleModeClick(modeConfig.mode)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 ${modeConfig.borderColor} ${modeConfig.bgColor} ${modeConfig.hoverBgColor} transition-all active:scale-[0.98]`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
                    <ModeIcon className={`w-6 h-6 ${modeConfig.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-gray-900">
                      {t(modeConfig.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t(modeConfig.descriptionKey)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        <div className={`p-4 ${config.bgColor} rounded-2xl border-2 ${
          category === 'russian_language' ? 'border-blue-200' :
          category === 'history' ? 'border-amber-200' :
          'border-emerald-200'
        }`}>
          <h3 className={`text-sm font-bold ${config.textColor} mb-2`}>
            {t('exam.ui.tip')}
          </h3>
          <p className="text-sm text-gray-700">
            {t('exam.ui.tipText')}
          </p>
        </div>
      </div>
    </div>
  );
}
