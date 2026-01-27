'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '../api';
import {
  saveExamQuestions,
  getExamQuestions,
  getExamQuestionsByCategory,
  getExamQuestionsCount,
  type ExamQuestionData,
} from '@/lib/db';
import type {
  QuestionCategory,
  QuestionDifficulty,
  SubmitExamRequest,
  Question,
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
 * Преобразовать ExamQuestionData в Question
 */
function mapCachedToQuestion(cached: ExamQuestionData): Question {
  return {
    id: cached.id,
    category: cached.category as QuestionCategory,
    difficulty: cached.difficulty as QuestionDifficulty,
    question: cached.question,
    options: cached.options,
    correctIndex: cached.correctIndex,
    explanation: cached.explanation || '',
    imageUrl: cached.imageUrl,
    tags: cached.tags || [],
  };
}

/**
 * Преобразовать Question в ExamQuestionData для кеширования
 */
function mapQuestionToCached(question: Question): ExamQuestionData {
  return {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    imageUrl: question.imageUrl,
    tags: question.tags,
  };
}

/**
 * Получить вопросы с поддержкой офлайн-кеша
 */
async function fetchQuestionsWithCache(
  category?: QuestionCategory,
  count: number = 20,
  difficulty?: QuestionDifficulty
): Promise<Question[]> {
  try {
    // Пытаемся загрузить из API
    const questions = await examApi.getQuestions({ category, count, difficulty });

    // Сохраняем в кеш
    if (questions.length > 0) {
      await saveExamQuestions(questions.map(mapQuestionToCached));
    }

    return questions;
  } catch (error) {
    // При ошибке сети пробуем получить из кеша
    console.warn('Failed to fetch questions from API, trying cache:', error);

    let cachedQuestions: ExamQuestionData[];

    if (category) {
      cachedQuestions = await getExamQuestionsByCategory(category);
    } else {
      cachedQuestions = await getExamQuestions();
    }

    if (cachedQuestions.length === 0) {
      // Нет данных в кеше - пробрасываем ошибку
      throw error;
    }

    // Фильтруем по сложности если нужно
    let filtered = cachedQuestions;
    if (difficulty) {
      filtered = cachedQuestions.filter((q) => q.difficulty === difficulty);
    }

    // Перемешиваем и ограничиваем количество
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, count);

    return limited.map(mapCachedToQuestion);
  }
}

/**
 * Хук для получения вопросов с поддержкой офлайн-кеша
 */
export function useQuestions(
  category?: QuestionCategory,
  count: number = 20,
  difficulty?: QuestionDifficulty,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: examQueryKeys.questions(category, count, difficulty),
    queryFn: () => fetchQuestionsWithCache(category, count, difficulty),
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

/**
 * Хук для проверки наличия офлайн-кеша вопросов
 */
export function useExamCacheStatus() {
  return useQuery({
    queryKey: ['exam', 'cache', 'status'],
    queryFn: async () => {
      const count = await getExamQuestionsCount();
      return {
        hasCache: count > 0,
        questionsCount: count,
      };
    },
    staleTime: 1000 * 60, // 1 минута
  });
}

/**
 * Хук для предзагрузки всех вопросов в офлайн-кеш
 */
export function usePreloadQuestionsToCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Загружаем большое количество вопросов для кеширования
      const questions = await examApi.getQuestions({ count: 500 });

      if (questions.length > 0) {
        await saveExamQuestions(questions.map(mapQuestionToCached));
      }

      return questions.length;
    },
    onSuccess: () => {
      // Инвалидируем статус кеша
      queryClient.invalidateQueries({ queryKey: ['exam', 'cache', 'status'] });
    },
  });
}
