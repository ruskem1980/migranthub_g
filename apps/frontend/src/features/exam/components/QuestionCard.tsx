'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { Question, QuestionCategory, QuestionDifficulty, XP_REWARDS } from '../types';
import { successHaptic, errorHaptic } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number;
  onAnswer: (index: number) => void;
  onNext?: () => void;
  showExplanation?: boolean;
  isLastQuestion?: boolean;
}

const categoryTranslationKeys: Record<QuestionCategory, string> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: 'exam.categories.russian',
  [QuestionCategory.HISTORY]: 'exam.categories.history',
  [QuestionCategory.LAW]: 'exam.categories.law',
};

const difficultyTranslationKeys: Record<QuestionDifficulty, string> = {
  [QuestionDifficulty.EASY]: 'exam.difficulty.easy',
  [QuestionDifficulty.MEDIUM]: 'exam.difficulty.medium',
  [QuestionDifficulty.HARD]: 'exam.difficulty.hard',
};

const categoryColors: Record<QuestionCategory, { bg: string; text: string; border: string }> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  [QuestionCategory.HISTORY]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  [QuestionCategory.LAW]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  onNext,
  showExplanation = true,
  isLastQuestion = false,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  const [showXPReward, setShowXPReward] = useState(false);

  const hasAnswered = selectedAnswer !== undefined;
  const isCorrect = hasAnswered && selectedAnswer === question.correctIndex;
  const colors = categoryColors[question.category];

  // Show explanation after answering with delay
  useEffect(() => {
    if (hasAnswered && showExplanation && question.explanation) {
      const timer = setTimeout(() => setShowExplanationPanel(true), 300);
      return () => clearTimeout(timer);
    }
    setShowExplanationPanel(false);
  }, [hasAnswered, showExplanation, question.explanation]);

  // Reset animation state when question changes
  useEffect(() => {
    setIsAnimating(true);
    setShowXPReward(false);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleOptionClick = (index: number) => {
    if (hasAnswered) return;

    // Trigger haptic feedback based on answer correctness
    if (index === question.correctIndex) {
      successHaptic();
      setShowXPReward(true);
      setTimeout(() => setShowXPReward(false), 1500);
    } else {
      errorHaptic();
    }

    onAnswer(index);
  };

  const getOptionStyles = (index: number) => {
    const baseStyles =
      'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3';

    if (!hasAnswered) {
      return `${baseStyles} border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]`;
    }

    if (index === question.correctIndex) {
      return `${baseStyles} border-green-500 bg-green-50 text-green-900`;
    }

    if (index === selectedAnswer && !isCorrect) {
      return `${baseStyles} border-red-500 bg-red-50 text-red-900`;
    }

    return `${baseStyles} border-gray-200 bg-gray-50 text-gray-400`;
  };

  const getOptionIcon = (index: number) => {
    if (!hasAnswered) {
      return (
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          {String.fromCharCode(65 + index)}
        </span>
      );
    }

    if (index === question.correctIndex) {
      return <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-600" />;
    }

    if (index === selectedAnswer && !isCorrect) {
      return <XCircle className="flex-shrink-0 w-6 h-6 text-red-600" />;
    }

    return (
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-400">
        {String.fromCharCode(65 + index)}
      </span>
    );
  };

  return (
    <div
      role="group"
      aria-labelledby="question-text"
      className={`relative flex flex-col gap-4 transition-opacity duration-200 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* XP reward notification */}
      {showXPReward && (
        <div className="absolute top-0 right-0 animate-bounce z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500 text-white text-sm font-bold shadow-lg">
            +{XP_REWARDS[question.difficulty] || 10} XP
          </span>
        </div>
      )}

      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
        >
          {t(categoryTranslationKeys[question.category])}
        </span>
        {question.difficulty && (
          <span
            className={`text-xs font-medium ${
              question.difficulty === QuestionDifficulty.HARD
                ? 'text-red-600'
                : question.difficulty === QuestionDifficulty.MEDIUM
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {t(difficultyTranslationKeys[question.difficulty])}
          </span>
        )}
      </div>

      {/* Question text */}
      <h2 id="question-text" className="text-lg font-medium text-gray-900 leading-relaxed">{question.question}</h2>

      {/* Options */}
      <div role="radiogroup" aria-label={t('exam.selectAnswer')} className="flex flex-col gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            role="radio"
            aria-checked={selectedAnswer === index}
            aria-label={`${t('exam.option')} ${index + 1}: ${option}`}
            onClick={() => handleOptionClick(index)}
            disabled={hasAnswered}
            className={getOptionStyles(index)}
          >
            {getOptionIcon(index)}
            <span className="flex-1 text-sm leading-relaxed">{option}</span>
          </button>
        ))}
      </div>

      {/* Explanation panel */}
      {showExplanationPanel && question.explanation && (
        <div
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            isCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <Lightbulb
              className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                isCorrect ? 'text-green-600' : 'text-amber-600'
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium mb-1 ${
                  isCorrect ? 'text-green-800' : 'text-amber-800'
                }`}
              >
                {isCorrect ? t('exam.question.correct') : t('exam.question.incorrect')}
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  isCorrect ? 'text-green-700' : 'text-amber-700'
                }`}
              >
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {hasAnswered && onNext && (
        <button
          onClick={onNext}
          aria-label={isLastQuestion ? t('exam.question.finish') : t('exam.nextQuestion')}
          className="mt-2 w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isLastQuestion ? t('exam.question.finish') : t('exam.question.next')}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Skeleton variant
export function QuestionCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="w-24 h-6 bg-gray-200 rounded-full" />
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
