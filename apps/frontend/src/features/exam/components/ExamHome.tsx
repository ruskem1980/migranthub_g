'use client';

import { useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Trophy,
  Flame,
  Target,
  ArrowLeft,
  Star,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { CategoryCard, CategoryCardSkeleton } from './CategoryCard';
import { useExamStore } from '../stores';
import { QuestionCategory, ExamMode } from '../types';

const TOTAL_QUESTIONS_PER_CATEGORY = 100;

interface ExamModeButton {
  mode: ExamMode;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const examModes: ExamModeButton[] = [
  {
    mode: ExamMode.LEARNING,
    titleKey: 'exam.modes.learning.title',
    descriptionKey: 'exam.modes.learning.description',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    mode: ExamMode.PRACTICE,
    titleKey: 'exam.modes.practice.title',
    descriptionKey: 'exam.modes.practice.description',
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
  },
  {
    mode: ExamMode.EXAM,
    titleKey: 'exam.modes.exam.title',
    descriptionKey: 'exam.modes.exam.description',
    icon: ClipboardCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
  },
];

const categories: QuestionCategory[] = [
  QuestionCategory.RUSSIAN_LANGUAGE,
  QuestionCategory.HISTORY,
  QuestionCategory.LAW,
];

interface ExamHomeProps {
  onSelectCategory?: (category: QuestionCategory) => void;
  onSelectMode?: (mode: ExamMode) => void;
}

export function ExamHome({ onSelectCategory, onSelectMode }: ExamHomeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const progress = useExamStore((state) => state.progress);
  const getLevel = useExamStore((state) => state.getLevel);
  const level = getLevel();

  const stats = useMemo(() => {
    const totalAnswered = progress.totalAnswered;
    const totalCorrect = progress.correctAnswers;
    const percentage =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalAnswered,
      totalCorrect,
      percentage,
      streak: progress.streak,
      achievements: progress.achievements.length,
      totalXP: progress.totalXP,
    };
  }, [progress]);

  const handleCategoryClick = (category: QuestionCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      router.push(`/exam/category/${category}`);
    }
  };

  const handleModeClick = (mode: ExamMode) => {
    if (onSelectMode) {
      onSelectMode(mode);
    } else {
      router.push(`/exam/start?mode=${mode}`);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
          <h1 className="text-lg font-bold text-gray-900">
            {t('exam.title')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Level Progress Card */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 text-white mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="font-bold text-lg">{level.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold">{stats.totalXP} XP</span>
            </div>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(level.progress, 100)}%` }}
            />
          </div>
          {level.maxXP !== Infinity && (
            <p className="text-xs text-purple-200 mt-2">
              {t('exam.level.toNextLevel', { xp: level.maxXP - stats.totalXP })}
            </p>
          )}
          {level.maxXP === Infinity && (
            <p className="text-xs text-purple-200 mt-2">
              {t('exam.level.maxLevel')}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {stats.totalAnswered}
            </div>
            <div className="text-xs text-gray-500">{t('exam.stats.questions')}</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {stats.percentage}%
            </div>
            <div className="text-xs text-gray-500">{t('exam.stats.success')}</div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {stats.streak}
            </div>
            <div className="text-xs text-gray-500">{t('exam.stats.streak')}</div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('exam.ui.selectMode')}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {examModes.map((modeConfig) => {
              const Icon = modeConfig.icon;
              return (
                <button
                  key={modeConfig.mode}
                  onClick={() => handleModeClick(modeConfig.mode)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-200 transition-all active:scale-95 ${modeConfig.bgColor}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white shadow-sm`}
                  >
                    <Icon className={`w-5 h-5 ${modeConfig.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 text-center">
                    {t(modeConfig.titleKey)}
                  </h3>
                  <p className="text-[10px] text-gray-500 text-center mt-0.5 leading-tight">
                    {t(modeConfig.descriptionKey)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('exam.ui.categories')}
          </h2>
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                progress={progress.byCategory[category]}
                totalQuestions={TOTAL_QUESTIONS_PER_CATEGORY}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
          <h3 className="text-sm font-bold text-emerald-900 mb-2">
            {t('exam.ui.tip')}
          </h3>
          <p className="text-sm text-emerald-800">
            {t('exam.ui.tipText')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExamHomeSkeleton() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3 border border-gray-200 animate-pulse"
            >
              <div className="h-4 w-4 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Mode buttons skeleton */}
        <div className="mb-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Categories skeleton */}
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
