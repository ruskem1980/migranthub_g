'use client';

import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  useExamStore,
  selectCurrentQuestion,
  selectCurrentAnswer,
  selectSessionProgress,
  selectIsLastQuestion,
  selectIsFirstQuestion,
} from '../stores';
import { useQuestions, useSubmitExam } from './useExamApi';
import type {
  ExamMode,
  QuestionCategory,
  Question,
  ExamResult,
  SessionSummary,
  Answer,
} from '../types';

interface UseExamSessionOptions {
  autoSubmit?: boolean; // Автоматически отправлять результаты на сервер
  timeLimit?: number; // Лимит времени в секундах (для exam mode)
}

interface UseExamSessionReturn {
  // State
  isActive: boolean;
  isLoading: boolean;
  isPaused: boolean;
  error: string | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: ReturnType<typeof selectSessionProgress>;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  hasAnswer: boolean;
  currentAnswer: Answer | null;
  timeRemaining: number | null; // в секундах
  timeSpent: number; // в секундах

  // Actions
  startSession: (
    mode: ExamMode,
    category?: QuestionCategory,
    questionCount?: number
  ) => Promise<void>;
  answerQuestion: (selectedIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => ExamResult | null;
  cancelSession: () => void;

  // Summary
  getSessionSummary: () => SessionSummary | null;
}

const DEFAULT_QUESTION_COUNT: Record<ExamMode, number> = {
  practice: 10,
  exam: 20,
  learning: 5,
  marathon: 100,
};

const TIME_LIMITS: Record<ExamMode, number | undefined> = {
  practice: undefined,
  exam: 30 * 60, // 30 минут
  learning: undefined,
  marathon: undefined,
};

export function useExamSession(
  options: UseExamSessionOptions = {}
): UseExamSessionReturn {
  const { t } = useTranslation();
  const { autoSubmit = true } = options;

  // Store state
  const currentSession = useExamStore((state) => state.currentSession);
  const storeProgress = useExamStore((state) => state.progress);
  const isLoading = useExamStore((state) => state.isLoading);
  const storeError = useExamStore((state) => state.error);

  // Store actions
  const storeStartSession = useExamStore((state) => state.startSession);
  const storeAnswerQuestion = useExamStore((state) => state.answerQuestion);
  const storeNextQuestion = useExamStore((state) => state.nextQuestion);
  const storePrevQuestion = useExamStore((state) => state.prevQuestion);
  const storeGoToQuestion = useExamStore((state) => state.goToQuestion);
  const storePauseSession = useExamStore((state) => state.pauseSession);
  const storeResumeSession = useExamStore((state) => state.resumeSession);
  const storeFinishSession = useExamStore((state) => state.finishSession);
  const storeUpdateProgress = useExamStore((state) => state.updateProgress);
  const storeReset = useExamStore((state) => state.reset);

  // Selectors
  const currentQuestion = useExamStore(selectCurrentQuestion);
  const currentAnswer = useExamStore(selectCurrentAnswer);
  const sessionProgress = useExamStore(selectSessionProgress);
  const isLastQuestion = useExamStore(selectIsLastQuestion);
  const isFirstQuestion = useExamStore(selectIsFirstQuestion);

  // API hooks
  const submitExamMutation = useSubmitExam();

  // Local state for time tracking
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // State for questions fetching
  const [pendingStart, setPendingStart] = useState<{
    mode: ExamMode;
    category?: QuestionCategory;
    count: number;
  } | null>(null);

  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuestions(
    pendingStart?.category,
    pendingStart?.count,
    undefined,
    !!pendingStart
  );

  // Timer logic
  useEffect(() => {
    if (currentSession && !currentSession.isPaused && !currentSession.finishedAt) {
      startTimeRef.current = Date.now() - timeSpent * 1000;

      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentSession?.id, currentSession?.isPaused, currentSession?.finishedAt]);

  // Auto-finish when time runs out
  useEffect(() => {
    if (currentSession?.timeLimit && timeSpent >= currentSession.timeLimit) {
      finishSession();
    }
  }, [timeSpent, currentSession?.timeLimit]);

  // Handle questions loaded
  useEffect(() => {
    if (pendingStart && questions && questions.length > 0) {
      const timeLimit = options.timeLimit ?? TIME_LIMITS[pendingStart.mode];
      storeStartSession(pendingStart.mode, questions, pendingStart.category, timeLimit);
      setTimeSpent(0);
      startTimeRef.current = Date.now();
      setPendingStart(null);
    }
  }, [questions, pendingStart, options.timeLimit, storeStartSession]);

  // Handle questions error or empty result
  useEffect(() => {
    if (pendingStart && !questionsLoading) {
      // Error occurred
      if (questionsError) {
        setPendingStart(null);
      }
      // Questions loaded but empty
      if (questions && questions.length === 0) {
        setPendingStart(null);
      }
    }
  }, [pendingStart, questionsLoading, questionsError, questions]);

  // Start session
  const startSession = useCallback(
    async (
      mode: ExamMode,
      category?: QuestionCategory,
      questionCount?: number
    ) => {
      const count = questionCount ?? DEFAULT_QUESTION_COUNT[mode];
      setPendingStart({ mode, category, count });
    },
    []
  );

  // Answer question
  const answerQuestion = useCallback(
    (selectedIndex: number) => {
      if (currentQuestion) {
        storeAnswerQuestion(currentQuestion.id, selectedIndex);
      }
    },
    [currentQuestion, storeAnswerQuestion]
  );

  // Finish session
  const finishSession = useCallback((): ExamResult | null => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const result = storeFinishSession();

    if (result) {
      // Update local progress
      storeUpdateProgress(result);

      // Submit to server if enabled
      if (autoSubmit && currentSession) {
        submitExamMutation.mutate({
          answers: currentSession.answers,
          mode: currentSession.mode,
          timeSpentSeconds: timeSpent,
        });
      }
    }

    return result;
  }, [
    storeFinishSession,
    storeUpdateProgress,
    autoSubmit,
    currentSession,
    timeSpent,
    submitExamMutation,
  ]);

  // Cancel session
  const cancelSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    storeReset();
    setTimeSpent(0);
    startTimeRef.current = null;
    setPendingStart(null);
  }, [storeReset]);

  // Get session summary
  const getSessionSummary = useCallback((): SessionSummary | null => {
    if (!currentSession) return null;

    const { questions, answers } = currentSession;
    const answeredQuestions = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const skippedQuestions = questions.length - answeredQuestions;

    return {
      totalQuestions: questions.length,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      timeSpent,
    };
  }, [currentSession, timeSpent]);

  // Time remaining calculation
  const timeRemaining = useMemo(() => {
    if (!currentSession?.timeLimit) return null;
    const remaining = currentSession.timeLimit - timeSpent;
    return Math.max(0, remaining);
  }, [currentSession?.timeLimit, timeSpent]);

  // Combined error
  const error = storeError || (questionsError ? t('exam.session.loadError') : null);

  return {
    // State
    isActive: !!currentSession && !currentSession.finishedAt,
    isLoading: isLoading || questionsLoading || !!pendingStart,
    isPaused: currentSession?.isPaused ?? false,
    error,
    currentQuestion,
    currentQuestionIndex: currentSession?.currentQuestionIndex ?? 0,
    totalQuestions: currentSession?.questions.length ?? 0,
    progress: sessionProgress,
    isFirstQuestion,
    isLastQuestion,
    hasAnswer: !!currentAnswer,
    currentAnswer,
    timeRemaining,
    timeSpent,

    // Actions
    startSession,
    answerQuestion,
    nextQuestion: storeNextQuestion,
    prevQuestion: storePrevQuestion,
    goToQuestion: storeGoToQuestion,
    pauseSession: storePauseSession,
    resumeSession: storeResumeSession,
    finishSession,
    cancelSession,

    // Summary
    getSessionSummary,
  };
}

export type { UseExamSessionReturn };
