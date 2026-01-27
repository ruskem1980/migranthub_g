'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Target,
  Clock,
  RotateCcw,
  Home,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ExamResult, QuestionCategory } from '../types';
import { successHaptic, errorHaptic } from '@/lib/haptics';

interface ResultsScreenProps {
  result: ExamResult;
  onRetry?: () => void;
  onHome?: () => void;
}

const categoryLabels: Record<QuestionCategory, string> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: 'Русский язык',
  [QuestionCategory.HISTORY]: 'История',
  [QuestionCategory.LAW]: 'Законодательство',
};

const categoryColors: Record<QuestionCategory, { bg: string; text: string; bar: string }> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
  },
  [QuestionCategory.HISTORY]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
  },
  [QuestionCategory.LAW]: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} сек`;
  return `${mins} мин ${secs} сек`;
}

// Circular progress component
function CircularProgress({
  percentage,
  passed,
  size = 180,
  strokeWidth = 12,
}: {
  percentage: number;
  passed: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = passed ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444';
  const bgColor = passed ? '#dcfce7' : percentage >= 50 ? '#fef3c7' : '#fee2e2';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
        <span className="text-sm text-gray-500 mt-1">
          {passed ? 'Сдано' : 'Не сдано'}
        </span>
      </div>
    </div>
  );
}

export function ResultsScreen({ result, onRetry, onHome }: ResultsScreenProps) {
  const router = useRouter();

  const passThreshold = 70;
  const isPassed = result.passed ?? result.percentage >= passThreshold;

  // Trigger haptic feedback when results are shown
  useEffect(() => {
    if (isPassed) {
      successHaptic();
    } else {
      errorHaptic();
    }
  }, [isPassed]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/exam');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div
        className={`px-4 py-8 text-center ${
          isPassed ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
          {isPassed ? (
            <Trophy className="w-8 h-8 text-white" />
          ) : (
            <Target className="w-8 h-8 text-white" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {isPassed ? 'Поздравляем!' : 'Не расстраивайтесь!'}
        </h1>
        <p className="text-white/80 text-sm">
          {isPassed
            ? 'Вы успешно прошли тест'
            : 'Попробуйте ещё раз после повторения материала'}
        </p>
      </div>

      {/* Main content */}
      <div className="px-4 -mt-6">
        {/* Score card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={result.percentage} passed={isPassed} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-green-100 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">{result.correctAnswers}</p>
              <p className="text-xs text-gray-500">Верно</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-red-100 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {result.totalQuestions - result.correctAnswers}
              </p>
              <p className="text-xs text-gray-500">Неверно</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-blue-100 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatTime(result.timeSpentSeconds)}
              </p>
              <p className="text-xs text-gray-500">Время</p>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {result.byCategory && result.byCategory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">По категориям</h2>
            <div className="space-y-3">
              {result.byCategory.map((cat) => {
                const categoryKey = cat.category as QuestionCategory;
                const colors = categoryColors[categoryKey] || categoryColors[QuestionCategory.LAW];
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">
                        {categoryLabels[categoryKey] || cat.category}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          cat.percentage >= 70
                            ? 'text-green-600'
                            : cat.percentage >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {cat.correct}/{cat.total} ({Math.round(cat.percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weak topics */}
        {result.weakTopics && result.weakTopics.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2">
                  Рекомендуем повторить
                </h3>
                <ul className="space-y-1">
                  {result.weakTopics.map((topic, index) => (
                    <li
                      key={index}
                      className="text-sm text-amber-700 flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 mb-8">
          <button
            onClick={handleHome}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            На главную
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Повторить
          </button>
        </div>
      </div>
    </div>
  );
}
