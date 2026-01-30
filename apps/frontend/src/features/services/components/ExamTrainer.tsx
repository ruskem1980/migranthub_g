'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GraduationCap, X, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, Clock, Target, Play, Scale, Loader2, AlertCircle, WifiOff, Pause, PlayCircle, Flame, Award, Zap, Brain, Timer, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '@/lib/i18n';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';
import { useExamStore } from '@/features/exam/stores/examStore';
import type { Question, Answer, ExamProgress } from '@/features/exam/types';
import {
  useCategories,
  useQuestions,
  useSubmitExam,
  useExamCacheStatus,
} from '@/features/exam/hooks/useExamApi';
import {
  QuestionCategory,
  QuestionDifficulty,
  ExamMode,
  ExamResult,
} from '@/features/exam/types';

interface ExamTrainerProps {
  onClose: () => void;
}

type CategoryFilter = 'all' | QuestionCategory;

// Локальное состояние сессии (не zustand)
interface LocalSession {
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  mode: ExamMode;
  category?: QuestionCategory;
  isPaused: boolean;
}

// Маппинг категорий для UI
const CATEGORY_UI_MAP: Record<QuestionCategory | 'all', { icon?: typeof Scale; translationKey: string }> = {
  all: { translationKey: 'all' },
  [QuestionCategory.RUSSIAN_LANGUAGE]: { translationKey: 'russian_language' },
  [QuestionCategory.HISTORY]: { translationKey: 'history' },
  [QuestionCategory.LAW]: { icon: Scale, translationKey: 'law' },
};

const DEFAULT_QUESTIONS_COUNT = 20;
const EXAM_TIME_LIMIT_SECONDS = 30 * 60; // 30 минут для режима экзамена

// Маппинг режимов для UI
const MODE_UI_MAP: Record<ExamMode, { icon: typeof Play; hasTimer: boolean; showExplanation: boolean; translationKey: string }> = {
  [ExamMode.PRACTICE]: {
    icon: BookOpen,
    hasTimer: false,
    showExplanation: true,
    translationKey: 'practice',
  },
  [ExamMode.EXAM]: {
    icon: Timer,
    hasTimer: true,
    showExplanation: false,
    translationKey: 'exam',
  },
  [ExamMode.LEARNING]: {
    icon: Brain,
    hasTimer: false,
    showExplanation: true,
    translationKey: 'learning',
  },
  [ExamMode.MARATHON]: {
    icon: Zap,
    hasTimer: false,
    showExplanation: true,
    translationKey: 'marathon',
  },
};

// Маппинг сложности для UI
const DIFFICULTY_UI_MAP: Record<QuestionDifficulty, { color: string; translationKey: string }> = {
  [QuestionDifficulty.EASY]: { color: 'bg-green-100 text-green-700 border-green-300', translationKey: 'easy' },
  [QuestionDifficulty.MEDIUM]: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', translationKey: 'medium' },
  [QuestionDifficulty.HARD]: { color: 'bg-red-100 text-red-700 border-red-300', translationKey: 'hard' },
};

// Маппинг достижений для UI
const ACHIEVEMENTS_UI_MAP: Record<string, { icon: typeof Trophy; translationKey: string }> = {
  first_test: { icon: Award, translationKey: 'firstTest' },
  perfect_score: { icon: Trophy, translationKey: 'perfectScore' },
  week_streak: { icon: Flame, translationKey: 'weekStreak' },
  hundred_questions: { icon: Target, translationKey: 'hundredQuestions' },
};

// Получаем прогресс из store один раз при монтировании (без подписки)
function getInitialProgress(): ExamProgress {
  try {
    const state = useExamStore.getState();
    return state.progress;
  } catch {
    return {
      totalAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      lastActivityDate: null,
      byCategory: {
        [QuestionCategory.RUSSIAN_LANGUAGE]: { answered: 0, correct: 0 },
        [QuestionCategory.HISTORY]: { answered: 0, correct: 0 },
        [QuestionCategory.LAW]: { answered: 0, correct: 0 },
      },
      achievements: [],
      totalXP: 0,
    };
  }
}

export function ExamTrainer({ onClose }: ExamTrainerProps) {
  // Переводы
  const t = useTranslations('examTrainer');

  // Язык интерфейса (с персистентностью в localStorage и cookie)
  const { language: selectedLanguage, setLanguage } = useLanguagePreference();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Локальный state для выбора категории (до начала теста)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  // Локальный state для выбора режима
  const [selectedMode, setSelectedMode] = useState<ExamMode>(ExamMode.PRACTICE);
  // Локальный state для выбора сложности
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | undefined>(undefined);
  // Локальный state для хранения результата (после завершения)
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  // State для отслеживания начала теста (чтобы триггерить загрузку вопросов)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  // Время начала сессии для расчета timeSpentSeconds
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  // Оставшееся время для режима экзамена (в секундах)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  // Ref для интервала таймера
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ЛОКАЛЬНАЯ сессия (вместо zustand)
  const [localSession, setLocalSession] = useState<LocalSession | null>(null);

  // Прогресс - читаем один раз при монтировании
  const [progress] = useState<ExamProgress>(() => getInitialProgress());

  // API хуки
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useCategories();

  const categoryForQuery = selectedCategory === 'all' ? undefined : selectedCategory;
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
  } = useQuestions(categoryForQuery, DEFAULT_QUESTIONS_COUNT, undefined, isLoadingQuestions);

  const submitExamMutation = useSubmitExam();
  const { data: cacheStatus } = useExamCacheStatus();

  // Вычисляемые значения из локальной сессии
  const currentQuestion: Question | null = localSession
    ? localSession.questions[localSession.currentQuestionIndex] ?? null
    : null;

  const currentAnswer: Answer | null = localSession && currentQuestion
    ? localSession.answers.find((a: Answer) => a.questionId === currentQuestion.id) ?? null
    : null;

  const sessionProgress = localSession
    ? {
        current: localSession.currentQuestionIndex + 1,
        total: localSession.questions.length,
        answered: localSession.answers.length,
        correct: localSession.answers.filter((a: Answer) => a.isCorrect).length,
        percentage: localSession.questions.length > 0
          ? Math.round((localSession.answers.length / localSession.questions.length) * 100)
          : 0,
      }
    : null;

  const isLastQuestion = localSession
    ? localSession.currentQuestionIndex >= localSession.questions.length - 1
    : false;

  const isFirstQuestion = localSession
    ? localSession.currentQuestionIndex <= 0
    : true;

  // Вычисляемые значения
  const isStarted = localSession !== null;
  const isComplete = examResult !== null;
  const isAnswered = currentAnswer !== null;
  const hasOfflineCache = cacheStatus?.hasCache ?? false;
  const isPaused = localSession?.isPaused ?? false;
  const isExamMode = localSession?.mode === ExamMode.EXAM;
  const showExplanationDuringTest = localSession?.mode !== ExamMode.EXAM;

  // Эффект для старта сессии когда вопросы загружены
  useEffect(() => {
    if (isLoadingQuestions && questions && questions.length > 0) {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;

      // Создаём локальную сессию
      setLocalSession({
        questions,
        answers: [],
        currentQuestionIndex: 0,
        mode: selectedMode,
        category,
        isPaused: false,
      });

      setSessionStartTime(Date.now());
      setIsLoadingQuestions(false);

      // Инициализируем таймер для режима экзамена
      if (selectedMode === ExamMode.EXAM) {
        setTimeRemaining(EXAM_TIME_LIMIT_SECONDS);
      }
    }
  }, [isLoadingQuestions, questions, selectedCategory, selectedMode]);

  // Эффект для таймера в режиме экзамена
  useEffect(() => {
    if (isExamMode && isStarted && !isComplete && !isPaused && timeRemaining !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [isExamMode, isStarted, isComplete, isPaused, timeRemaining !== null]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Форматирование времени
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    setExamResult(null);
    setIsLoadingQuestions(true);
    refetchQuestions();
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion || !localSession) return;

    const isCorrect = currentQuestion.correctIndex === index;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedIndex: index,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    setLocalSession({
      ...localSession,
      answers: [...localSession.answers, newAnswer],
    });
  };

  const calculateResult = useCallback((): ExamResult | null => {
    if (!localSession) return null;

    const totalQuestions = localSession.questions.length;
    const correctAnswers = localSession.answers.filter((a) => a.isCorrect).length;
    const percentage = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
    const passed = percentage >= 70;

    // Результаты по категориям
    const categoryStats: Record<string, { total: number; correct: number }> = {};

    localSession.questions.forEach((question) => {
      const category = question.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0 };
      }
      categoryStats[category].total++;

      const answer = localSession.answers.find((a) => a.questionId === question.id);
      if (answer?.isCorrect) {
        categoryStats[category].correct++;
      }
    });

    const byCategory = Object.entries(categoryStats).map(
      ([category, stats]) => ({
        category,
        total: stats.total,
        correct: stats.correct,
        percentage: stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0,
      })
    );

    const weakTopics = byCategory
      .filter((cat) => cat.percentage < 70)
      .map((cat) => cat.category);

    const timeSpentSeconds = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 1000)
      : 0;

    return {
      totalQuestions,
      correctAnswers,
      percentage,
      passed,
      byCategory,
      weakTopics,
      timeSpentSeconds,
    };
  }, [localSession, sessionStartTime]);

  const handleFinishExam = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const result = calculateResult();
    if (result && localSession) {
      setExamResult(result);

      // Обновляем прогресс в zustand store
      try {
        useExamStore.getState().updateProgress(result);
      } catch (e) {
        console.warn('Failed to update progress in store:', e);
      }

      // Отправляем результаты на сервер
      submitExamMutation.mutate({
        answers: localSession.answers,
        mode: localSession.mode,
        timeSpentSeconds: result.timeSpentSeconds,
      });
    }
  }, [calculateResult, localSession, submitExamMutation]);

  // Эффект для автозавершения при истечении времени
  useEffect(() => {
    if (timeRemaining === 0 && isStarted && !isComplete) {
      handleFinishExam();
    }
  }, [timeRemaining, isStarted, isComplete, handleFinishExam]);

  const handleNext = () => {
    if (!localSession) return;

    if (isLastQuestion) {
      handleFinishExam();
    } else {
      setLocalSession({
        ...localSession,
        currentQuestionIndex: localSession.currentQuestionIndex + 1,
      });
    }
  };

  const handlePrev = () => {
    if (!localSession || isFirstQuestion) return;

    setLocalSession({
      ...localSession,
      currentQuestionIndex: localSession.currentQuestionIndex - 1,
    });
  };

  const handleTogglePause = () => {
    if (!localSession) return;

    setLocalSession({
      ...localSession,
      isPaused: !localSession.isPaused,
    });
  };

  const handleRestart = () => {
    setLocalSession(null);
    setExamResult(null);
    setSessionStartTime(null);
    setTimeRemaining(null);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const getCategoryInfo = (cat: CategoryFilter): { translationKey: string; count: number | string } => {
    const uiInfo = CATEGORY_UI_MAP[cat];

    if (categories && categories.length > 0) {
      if (cat === 'all') {
        const totalQuestions = categories.reduce((sum, c) => sum + c.totalQuestions, 0);
        return { translationKey: uiInfo.translationKey, count: totalQuestions };
      }

      const categoryIdMap: Record<QuestionCategory, string> = {
        [QuestionCategory.RUSSIAN_LANGUAGE]: 'russian_language',
        [QuestionCategory.HISTORY]: 'history',
        [QuestionCategory.LAW]: 'law',
      };

      const apiCategory = categories.find(c => c.id === categoryIdMap[cat]);
      if (apiCategory) {
        return { translationKey: uiInfo.translationKey, count: apiCategory.totalQuestions };
      }
    }

    return { translationKey: uiInfo.translationKey, count: isCategoriesLoading ? '...' : DEFAULT_QUESTIONS_COUNT };
  };

  const getCategoryLabel = (category: QuestionCategory) => {
    const translationKey = CATEGORY_UI_MAP[category].translationKey;
    return t(`categories.${translationKey}`);
  };

  const getCategoryStyle = (category: QuestionCategory) => {
    switch (category) {
      case QuestionCategory.RUSSIAN_LANGUAGE:
        return 'bg-blue-100 text-blue-700';
      case QuestionCategory.HISTORY:
        return 'bg-orange-100 text-orange-700';
      case QuestionCategory.LAW:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOptionStyle = (index: number) => {
    if (!isAnswered || !currentQuestion) {
      return currentAnswer?.selectedIndex === index
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300';
    }

    if (index === currentQuestion.correctIndex) {
      return 'border-green-500 bg-green-50';
    }

    if (index === currentAnswer?.selectedIndex) {
      return 'border-red-500 bg-red-50';
    }

    return 'border-gray-200 opacity-50';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-exam-trainer"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 id="modal-title-exam-trainer" className="text-lg font-bold text-gray-900">{t('header.title')}</h2>
              <p className="text-sm text-gray-500">{t('header.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Селектор языка */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Select language"
              >
                <span className="text-xl">{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Выпадающее меню языков */}
              {isLanguageMenuOpen && (
                <>
                  {/* Overlay для закрытия меню */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
                          selectedLanguage === lang.code ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className={`text-sm ${selectedLanguage === lang.code ? 'font-medium text-emerald-700' : 'text-gray-700'}`}>
                          {lang.nativeName}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {!isStarted && !isComplete ? (
            /* Начальный экран */
            <div className="py-4">
              {/* Иконка и описание */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="text-gray-600">
                  {t('intro.description')}
                </p>
              </div>

              {/* Прогресс пользователя */}
              {(progress.streak > 0 || progress.achievements.length > 0) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Flame className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600">{t('progress.streak')}</p>
                        <p className="font-bold text-amber-700">{t('progress.streakDays', { count: progress.streak })}</p>
                      </div>
                    </div>
                    {progress.achievements.length > 0 && (
                      <div className="flex -space-x-2">
                        {progress.achievements.slice(0, 3).map((achievement: string) => {
                          const achievementInfo = ACHIEVEMENTS_UI_MAP[achievement];
                          if (!achievementInfo) return null;
                          const AchievementIcon = achievementInfo.icon;
                          return (
                            <div
                              key={achievement}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-amber-200"
                              title={t(`achievements.${achievementInfo.translationKey}`)}
                            >
                              <AchievementIcon className="w-4 h-4 text-amber-600" />
                            </div>
                          );
                        })}
                        {progress.achievements.length > 3 && (
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200 text-xs font-bold text-amber-700">
                            +{progress.achievements.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-amber-600">
                    {t('progress.total', { count: progress.totalAnswered })} • {t('progress.correct', { count: progress.correctAnswers, percent: progress.totalAnswered > 0 ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100) : 0 })}
                  </div>
                </div>
              )}

              {/* Информация о тесте */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('info.passingScore')}</p>
                    <p className="font-bold text-gray-900">{t('info.passingScoreValue')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('info.time')}</p>
                    <p className="font-bold text-gray-900">{selectedMode === ExamMode.EXAM ? t('info.timeExam') : t('info.timeRegular')}</p>
                  </div>
                </div>
              </div>

              {/* Выбор режима */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">{t('modes.selectLabel')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {([ExamMode.PRACTICE, ExamMode.EXAM, ExamMode.LEARNING] as ExamMode[]).map((mode) => {
                    const modeInfo = MODE_UI_MAP[mode];
                    const isSelected = selectedMode === mode;
                    const ModeIcon = modeInfo.icon;
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <ModeIcon className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                          {t(`modes.${modeInfo.translationKey}.label`)}
                        </span>
                        {modeInfo.hasTimer && (
                          <span className="text-xs text-orange-500 mt-1">⏱ {t('info.timeExam')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t(`modes.${MODE_UI_MAP[selectedMode].translationKey}.description`)}
                </p>
              </div>

              {/* Выбор сложности */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">{t('difficulty.selectLabel')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDifficulty(undefined)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedDifficulty === undefined
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t('difficulty.all')}
                  </button>
                  {([QuestionDifficulty.EASY, QuestionDifficulty.MEDIUM, QuestionDifficulty.HARD] as QuestionDifficulty[]).map((diff) => {
                    const diffInfo = DIFFICULTY_UI_MAP[diff];
                    const isSelected = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? diffInfo.color
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {t(`difficulty.${diffInfo.translationKey}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Выбор категории */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">{t('categories.selectLabel')}</p>
                <div className="space-y-2">
                  {(['all', QuestionCategory.RUSSIAN_LANGUAGE, QuestionCategory.HISTORY, QuestionCategory.LAW] as CategoryFilter[]).map((cat) => {
                    const info = getCategoryInfo(cat);
                    const isSelected = selectedCategory === cat;
                    const isLaw = cat === QuestionCategory.LAW;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isLaw && <Scale className="w-4 h-4 text-purple-600" />}
                          <span className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {t(`categories.${info.translationKey}`)}
                          </span>
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {t('categories.questionsCount', { count: info.count })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Индикатор офлайн режима */}
              {hasOfflineCache && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-4">
                  <WifiOff className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {t('errors.offline', { count: cacheStatus?.questionsCount || 0 })}
                  </span>
                </div>
              )}

              {/* Ошибка загрузки */}
              {(categoriesError || questionsError) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    {hasOfflineCache
                      ? t('errors.offlineMode')
                      : t('errors.loadError')}
                  </span>
                </div>
              )}

              {/* Кнопка начать */}
              <button
                onClick={handleStart}
                disabled={isLoadingQuestions || isQuestionsLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingQuestions || isQuestionsLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('buttons.loading')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {t('buttons.start')}
                  </>
                )}
              </button>
            </div>
          ) : isStarted && !isComplete && currentQuestion && sessionProgress ? (
            <>
              {/* Пауза overlay */}
              {isPaused && (
                <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center">
                  <Pause className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('test.paused')}</h3>
                  <p className="text-gray-500 mb-6">{t('test.timerStopped')}</p>
                  <button
                    onClick={handleTogglePause}
                    className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                    {t('buttons.continue')}
                  </button>
                </div>
              )}

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{t('test.questionOf', { current: sessionProgress.current, total: sessionProgress.total })}</span>
                  <div className="flex items-center gap-3">
                    {isExamMode && timeRemaining !== null && (
                      <span className={`flex items-center gap-1 font-medium ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-600'}`}>
                        <Timer className="w-4 h-4" />
                        {formatTime(timeRemaining)}
                      </span>
                    )}
                    <span>{t('test.points', { count: sessionProgress.correct })}</span>
                    {isExamMode && (
                      <button
                        onClick={handleTogglePause}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={t('test.pause')}
                      >
                        <Pause className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(sessionProgress.current / sessionProgress.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryStyle(currentQuestion.category)}`}>
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      disabled={isAnswered}
                      className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${getOptionStyle(index)}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isAnswered && index === currentQuestion.correctIndex
                          ? 'bg-green-500 text-white'
                          : isAnswered && index === currentAnswer?.selectedIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isAnswered && index === currentQuestion.correctIndex ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isAnswered && index === currentAnswer?.selectedIndex ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="flex-1 font-medium text-gray-900">
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation - показываем только в режимах Practice и Learning */}
              {isAnswered && currentQuestion.explanation && showExplanationDuringTest && (
                <div className={`p-4 rounded-xl ${
                  currentAnswer?.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    currentAnswer?.isCorrect
                      ? 'text-green-800'
                      : 'text-blue-800'
                  }`}>
                    <strong>
                      {currentAnswer?.isCorrect ? `${t('hints.correct')} ` : `${t('hints.explanation')} `}
                    </strong>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* В режиме Learning показываем подсказку до ответа */}
              {localSession?.mode === ExamMode.LEARNING && !isAnswered && currentQuestion.explanation && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    {t('hints.hint')}
                  </p>
                </div>
              )}
            </>
          ) : isComplete && examResult ? (
            <>
              {/* Results */}
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-emerald-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('results.completed')}
                </h3>

                <p className="text-4xl font-bold text-emerald-600 mb-2">
                  {examResult.correctAnswers} / {examResult.totalQuestions}
                </p>

                <p className="text-gray-500 mb-6">
                  {examResult.passed
                    ? examResult.percentage === 100
                      ? t('results.excellent')
                      : t('results.passed')
                    : examResult.percentage >= 50
                    ? t('results.almostPassed')
                    : t('results.needPractice')}
                </p>

                {/* Progress bar */}
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all ${
                      examResult.passed
                        ? 'bg-emerald-500'
                        : examResult.percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${examResult.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  {t('results.passingThreshold', { required: Math.ceil(examResult.totalQuestions * 0.7), total: examResult.totalQuestions })}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleRestart}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    {t('buttons.restart')}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 text-gray-600 font-medium hover:text-gray-800"
                  >
                    {t('buttons.close')}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer with navigation buttons */}
        {isStarted && !isComplete && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              {/* Кнопка назад */}
              {!isFirstQuestion && (
                <button
                  onClick={handlePrev}
                  className="flex items-center justify-center gap-1 px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:border-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t('buttons.prev')}
                </button>
              )}

              {/* Кнопка вперёд/завершить */}
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-colors ${
                  isAnswered
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!isLastQuestion ? (
                  <>
                    {t('buttons.next')}
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  t('buttons.finish')
                )}
              </button>
            </div>

            {/* Дополнительные кнопки */}
            <div className="flex items-center justify-between mt-2">
              {/* Выход в главное меню */}
              <button
                onClick={onClose}
                className="py-2 px-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t('buttons.exitToMenu')}
              </button>

              {/* Досрочное завершение в режиме экзамена */}
              {isExamMode && (
                <button
                  onClick={handleFinishExam}
                  className="py-2 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t('buttons.finishEarly')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
