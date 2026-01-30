'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ExamState,
  ExamSession,
  ExamProgress,
  ExamResult,
  ExamMode,
  Question,
  Answer,
  CategoryResult,
  QuestionCategory,
  CurrentLevel,
} from '../types';
import { LEVELS, XP_REWARDS } from '../types';

const initialProgress: ExamProgress = {
  totalAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  lastActivityDate: null,
  byCategory: {
    russian_language: { answered: 0, correct: 0 },
    history: { answered: 0, correct: 0 },
    law: { answered: 0, correct: 0 },
  },
  achievements: [],
  totalXP: 0,
};

const initialState = {
  currentSession: null as ExamSession | null,
  progress: initialProgress,
  isLoading: false,
  error: null as string | null,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (
        mode: ExamMode,
        questions: Question[],
        category?: QuestionCategory,
        timeLimit?: number
      ) => {
        const session: ExamSession = {
          id: crypto.randomUUID(),
          mode,
          category,
          questions,
          answers: [],
          currentQuestionIndex: 0,
          startedAt: new Date().toISOString(),
          timeLimit,
          isPaused: false,
        };

        set({ currentSession: session, error: null });
      },

      answerQuestion: (questionId: string, selectedIndex: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const question = currentSession.questions.find((q) => q.id === questionId);
        if (!question) return;

        const isCorrect = question.correctIndex === selectedIndex;

        const existingAnswerIndex = currentSession.answers.findIndex(
          (a) => a.questionId === questionId
        );

        const newAnswer: Answer = {
          questionId,
          selectedIndex,
          isCorrect,
          answeredAt: new Date().toISOString(),
        };

        let updatedAnswers: Answer[];
        if (existingAnswerIndex >= 0) {
          updatedAnswers = [...currentSession.answers];
          updatedAnswers[existingAnswerIndex] = newAnswer;
        } else {
          updatedAnswers = [...currentSession.answers, newAnswer];
        }

        set({
          currentSession: {
            ...currentSession,
            answers: updatedAnswers,
          },
        });
      },

      nextQuestion: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const nextIndex = Math.min(
          currentSession.currentQuestionIndex + 1,
          currentSession.questions.length - 1
        );

        set({
          currentSession: {
            ...currentSession,
            currentQuestionIndex: nextIndex,
          },
        });
      },

      prevQuestion: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const prevIndex = Math.max(currentSession.currentQuestionIndex - 1, 0);

        set({
          currentSession: {
            ...currentSession,
            currentQuestionIndex: prevIndex,
          },
        });
      },

      goToQuestion: (index: number) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const safeIndex = Math.max(
          0,
          Math.min(index, currentSession.questions.length - 1)
        );

        set({
          currentSession: {
            ...currentSession,
            currentQuestionIndex: safeIndex,
          },
        });
      },

      pauseSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            isPaused: true,
          },
        });
      },

      resumeSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            isPaused: false,
          },
        });
      },

      finishSession: () => {
        const { currentSession } = get();
        if (!currentSession) return null;

        const finishedAt = new Date().toISOString();
        const startedAt = new Date(currentSession.startedAt);
        const timeSpentSeconds = Math.floor(
          (new Date(finishedAt).getTime() - startedAt.getTime()) / 1000
        );

        // Подсчёт результатов
        const totalQuestions = currentSession.questions.length;
        const correctAnswers = currentSession.answers.filter((a) => a.isCorrect).length;
        const percentage = totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;
        const passed = percentage >= 70;

        // Результаты по категориям
        const categoryStats: Record<string, { total: number; correct: number }> = {};

        currentSession.questions.forEach((question) => {
          const category = question.category;
          if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, correct: 0 };
          }
          categoryStats[category].total++;

          const answer = currentSession.answers.find((a) => a.questionId === question.id);
          if (answer?.isCorrect) {
            categoryStats[category].correct++;
          }
        });

        const byCategory: CategoryResult[] = Object.entries(categoryStats).map(
          ([category, stats]) => ({
            category,
            total: stats.total,
            correct: stats.correct,
            percentage: stats.total > 0
              ? Math.round((stats.correct / stats.total) * 100)
              : 0,
          })
        );

        // Определение слабых тем (категории с результатом < 70%)
        const weakTopics = byCategory
          .filter((cat) => cat.percentage < 70)
          .map((cat) => cat.category);

        const result: ExamResult = {
          totalQuestions,
          correctAnswers,
          percentage,
          passed,
          byCategory,
          weakTopics,
          timeSpentSeconds,
        };

        // Обновляем сессию как завершённую
        set({
          currentSession: {
            ...currentSession,
            finishedAt,
          },
        });

        return result;
      },

      updateProgress: (result: ExamResult) => {
        const { progress, currentSession } = get();
        const today = new Date().toISOString().split('T')[0];

        // Обновление streak
        let newStreak = progress.streak;
        if (progress.lastActivityDate) {
          const lastDate = new Date(progress.lastActivityDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            newStreak = progress.streak + 1;
          } else if (lastDate.toISOString().split('T')[0] !== today) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Обновление прогресса по категориям
        const updatedByCategory = { ...progress.byCategory };

        result.byCategory.forEach((catResult) => {
          const category = catResult.category as QuestionCategory;
          if (updatedByCategory[category]) {
            updatedByCategory[category] = {
              answered: updatedByCategory[category].answered + catResult.total,
              correct: updatedByCategory[category].correct + catResult.correct,
            };
          }
        });

        // Расчёт XP за правильные ответы
        let earnedXP = 0;
        if (currentSession) {
          currentSession.answers.forEach((answer) => {
            if (answer.isCorrect) {
              const question = currentSession.questions.find((q) => q.id === answer.questionId);
              if (question) {
                earnedXP += XP_REWARDS[question.difficulty] || 10;
              }
            }
          });
        }

        // Бонус за streak
        if (newStreak >= 3) {
          earnedXP = Math.floor(earnedXP * 1.1); // +10% за streak 3+
        }
        if (newStreak >= 7) {
          earnedXP = Math.floor(earnedXP * 1.1); // ещё +10% за streak 7+
        }

        // Бонус за идеальный результат
        if (result.percentage === 100) {
          earnedXP += 50; // Бонус за 100%
        }

        // Проверка достижений
        const newAchievements = [...progress.achievements];

        // Первый тест
        if (!newAchievements.includes('first_test') && progress.totalAnswered === 0) {
          newAchievements.push('first_test');
        }

        // Идеальный результат
        if (!newAchievements.includes('perfect_score') && result.percentage === 100) {
          newAchievements.push('perfect_score');
        }

        // Streak 7 дней
        if (!newAchievements.includes('week_streak') && newStreak >= 7) {
          newAchievements.push('week_streak');
        }

        // 100 вопросов
        const newTotalAnswered = progress.totalAnswered + result.totalQuestions;
        if (!newAchievements.includes('hundred_questions') && newTotalAnswered >= 100) {
          newAchievements.push('hundred_questions');
        }

        set({
          progress: {
            totalAnswered: newTotalAnswered,
            correctAnswers: progress.correctAnswers + result.correctAnswers,
            streak: newStreak,
            lastActivityDate: today,
            byCategory: updatedByCategory,
            achievements: newAchievements,
            totalXP: progress.totalXP + earnedXP,
          },
          currentSession: null,
        });
      },

      reset: () => {
        set(initialState);
      },

      clearError: () => {
        set({ error: null });
      },

      // XP & Level methods
      addXP: (amount: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            totalXP: state.progress.totalXP + amount,
          },
        }));
      },

      getLevel: (): CurrentLevel => {
        const xp = get().progress.totalXP;
        const level = LEVELS.find((l) => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
        const progress =
          level.maxXP === Infinity
            ? 100
            : ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
        return { ...level, progress };
      },
    }),
    {
      name: 'migranthub-exam',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        // currentSession не сохраняем - каждая сессия должна быть свежей
      }),
    }
  )
);

// Селекторы для удобства использования
export const selectCurrentQuestion = (state: ExamState) => {
  if (!state.currentSession) return null;
  return state.currentSession.questions[state.currentSession.currentQuestionIndex] ?? null;
};

export const selectCurrentAnswer = (state: ExamState) => {
  if (!state.currentSession) return null;
  const currentQuestion = selectCurrentQuestion(state);
  if (!currentQuestion) return null;
  return state.currentSession.answers.find((a) => a.questionId === currentQuestion.id) ?? null;
};

export const selectSessionProgress = (state: ExamState) => {
  if (!state.currentSession) return null;

  const { questions, answers, currentQuestionIndex } = state.currentSession;
  const answeredCount = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;

  return {
    current: currentQuestionIndex + 1,
    total: questions.length,
    answered: answeredCount,
    correct: correctCount,
    percentage: questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0,
  };
};

export const selectIsLastQuestion = (state: ExamState) => {
  if (!state.currentSession) return false;
  return state.currentSession.currentQuestionIndex >= state.currentSession.questions.length - 1;
};

export const selectIsFirstQuestion = (state: ExamState) => {
  if (!state.currentSession) return true;
  return state.currentSession.currentQuestionIndex <= 0;
};
