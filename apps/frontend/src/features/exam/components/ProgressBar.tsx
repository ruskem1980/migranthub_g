'use client';

import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuestionCategory } from '../types';
import { useTranslation } from '@/lib/i18n';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  timeRemaining?: number | null;
  timeSpent?: number;
  showTimer?: boolean;
  category?: QuestionCategory;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

const categoryColors: Record<QuestionCategory, string> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: 'bg-blue-500',
  [QuestionCategory.HISTORY]: 'bg-amber-500',
  [QuestionCategory.LAW]: 'bg-emerald-500',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({
  currentQuestion,
  totalQuestions,
  answeredCount,
  correctCount,
  timeRemaining,
  timeSpent = 0,
  showTimer = false,
  category,
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;
  const answeredPercent = (answeredCount / totalQuestions) * 100;
  const correctPercent = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;

  const barColor = category ? categoryColors[category] : 'bg-blue-500';
  const isTimeLow = timeRemaining !== null && timeRemaining !== undefined && timeRemaining < 60;

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 relative">
        {/* Answered progress (background) */}
        <div
          className="absolute left-0 top-0 h-full bg-gray-300 transition-all duration-300"
          style={{ width: `${answeredPercent}%` }}
        />
        {/* Current position */}
        <div
          className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-300`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Info row */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label={t('exam.progress.previous')}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <span className="text-sm font-medium text-gray-900 min-w-[80px] text-center">
            {currentQuestion + 1} {t('exam.progress.outOf')} {totalQuestions}
          </span>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label={t('exam.progress.next')}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            {t('exam.progress.answered')}: <span className="font-medium text-gray-700">{answeredCount}</span>
          </span>
          {answeredCount > 0 && (
            <span>
              {t('exam.progress.correct')}:{' '}
              <span
                className={`font-medium ${
                  correctPercent >= 70
                    ? 'text-green-600'
                    : correctPercent >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {Math.round(correctPercent)}%
              </span>
            </span>
          )}
        </div>

        {/* Right: Timer */}
        {showTimer && (
          <div
            className={`flex items-center gap-1.5 text-sm font-medium ${
              isTimeLow ? 'text-red-600 animate-pulse' : 'text-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            {timeRemaining !== null && timeRemaining !== undefined ? (
              <span>{formatTime(timeRemaining)}</span>
            ) : (
              <span>{formatTime(timeSpent)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton variant
export function ProgressBarSkeleton() {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="h-1 bg-gray-100" />
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-14 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
