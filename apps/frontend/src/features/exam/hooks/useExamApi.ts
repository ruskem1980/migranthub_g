'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '../api';
import type {
  QuestionCategory,
  QuestionDifficulty,
  SubmitExamRequest,
} from '../types';

// Query keys
export const examQueryKeys = {
  all: ['exam'] as const,
  categories: () => [...examQueryKeys.all, 'categories'] as const,
  questions: (category?: QuestionCategory, count?: number, difficulty?: QuestionDifficulty) =>
    [...examQueryKeys.all, 'questions', { category, count, difficulty }] as const,
  progress: () => [...examQueryKeys.all, 'progress'] as const,
  statistics: () => [...examQueryKeys.all, 'statistics'] as const,
};

/**
 * Хук для получения категорий вопросов
 */
export function useCategories() {
  return useQuery({
    queryKey: examQueryKeys.categories(),
    queryFn: () => examApi.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 час - категории редко меняются
  });
}

/**
 * Хук для получения вопросов
 */
export function useQuestions(
  category?: QuestionCategory,
  count: number = 20,
  difficulty?: QuestionDifficulty,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: examQueryKeys.questions(category, count, difficulty),
    queryFn: () => examApi.getQuestions({ category, count, difficulty }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

/**
 * Хук для отправки результатов экзамена
 */
export function useSubmitExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitExamRequest) => examApi.submitExam(data),
    onSuccess: () => {
      // Инвалидируем кэш прогресса и статистики после успешной отправки
      queryClient.invalidateQueries({ queryKey: examQueryKeys.progress() });
      queryClient.invalidateQueries({ queryKey: examQueryKeys.statistics() });
    },
  });
}

/**
 * Хук для получения прогресса пользователя
 */
export function useProgress(enabled: boolean = true) {
  return useQuery({
    queryKey: examQueryKeys.progress(),
    queryFn: () => examApi.getProgress(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}

/**
 * Хук для получения статистики пользователя
 */
export function useStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: examQueryKeys.statistics(),
    queryFn: () => examApi.getStatistics(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

/**
 * Хук для предзагрузки вопросов
 */
export function usePrefetchQuestions() {
  const queryClient = useQueryClient();

  return {
    prefetch: async (
      category?: QuestionCategory,
      count: number = 20,
      difficulty?: QuestionDifficulty
    ) => {
      await queryClient.prefetchQuery({
        queryKey: examQueryKeys.questions(category, count, difficulty),
        queryFn: () => examApi.getQuestions({ category, count, difficulty }),
        staleTime: 1000 * 60 * 5,
      });
    },
  };
}

/**
 * Хук для инвалидации кэша экзамена
 */
export function useInvalidateExamQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.all });
    },
    invalidateProgress: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.progress() });
    },
    invalidateStatistics: () => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.statistics() });
    },
    invalidateQuestions: () => {
      queryClient.invalidateQueries({ queryKey: [...examQueryKeys.all, 'questions'] });
    },
  };
}
