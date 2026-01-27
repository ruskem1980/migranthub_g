'use client';

import { Languages, Book, Scale, ChevronRight } from 'lucide-react';
import type { QuestionCategory, CategoryProgress } from '../types';
import { useTranslation } from '@/lib/i18n';

const categoryConfig: Record<
  QuestionCategory,
  {
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    color: string;
    bgColor: string;
    progressColor: string;
  }
> = {
  russian_language: {
    icon: Languages,
    titleKey: 'exam.categoryCard.russian',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    progressColor: 'bg-blue-500',
  },
  history: {
    icon: Book,
    titleKey: 'exam.categoryCard.history',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    progressColor: 'bg-amber-500',
  },
  law: {
    icon: Scale,
    titleKey: 'exam.categoryCard.law',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    progressColor: 'bg-emerald-500',
  },
};

interface CategoryCardProps {
  category: QuestionCategory;
  progress: CategoryProgress;
  totalQuestions: number;
  onClick?: () => void;
}

export function CategoryCard({
  category,
  progress,
  totalQuestions,
  onClick,
}: CategoryCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  const percentage =
    progress.answered > 0
      ? Math.round((progress.correct / progress.answered) * 100)
      : 0;

  const progressPercent =
    totalQuestions > 0
      ? Math.round((progress.answered / totalQuestions) * 100)
      : 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all active:scale-[0.98] text-left"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
          >
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {config.title}
              </h3>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>

            {/* Stats */}
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>
                {progress.answered}/{totalQuestions} вопросов
              </span>
              {progress.answered > 0 && (
                <span
                  className={`font-medium ${
                    percentage >= 70
                      ? 'text-emerald-600'
                      : percentage >= 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {percentage}% верно
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all duration-300 ${config.progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </button>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
      <div className="h-1 bg-gray-100" />
    </div>
  );
}
