'use client';

import { apiClient } from '@/lib/api/client';
import type {
  Category,
  Question,
  GetQuestionsParams,
  SubmitExamRequest,
  ExamResult,
  ExamProgress,
  ExamStatistics,
} from '../types';

/**
 * Exam API client
 * Методы для работы с экзаменационным модулем
 */
export const examApi = {
  /**
   * Получить список категорий вопросов
   */
  getCategories: () =>
    apiClient.get<Category[]>('/exam/categories', { skipAuth: true }),

  /**
   * Получить вопросы с опциональной фильтрацией
   */
  getQuestions: (params?: GetQuestionsParams) => {
    const searchParams = new URLSearchParams();

    if (params?.category) {
      searchParams.append('category', params.category);
    }
    if (params?.count !== undefined) {
      searchParams.append('count', params.count.toString());
    }
    if (params?.difficulty) {
      searchParams.append('difficulty', params.difficulty);
    }

    const query = searchParams.toString();
    return apiClient.get<Question[]>(`/exam/questions${query ? `?${query}` : ''}`, {
      skipAuth: true,
    });
  },

  /**
   * Отправить результаты экзамена
   */
  submitExam: (data: SubmitExamRequest) =>
    apiClient.post<ExamResult>('/exam/submit', data, {
      offlineAction: 'Отправка результатов экзамена',
    }),

  /**
   * Получить прогресс пользователя
   */
  getProgress: () =>
    apiClient.get<ExamProgress>('/exam/progress'),

  /**
   * Получить статистику пользователя
   */
  getStatistics: () =>
    apiClient.get<ExamStatistics>('/exam/statistics'),

  /**
   * Получить случайные вопросы для практики
   */
  getRandomQuestions: (count: number = 20) =>
    apiClient.get<Question[]>(`/exam/questions/random?count=${count}`, {
      skipAuth: true,
    }),

  /**
   * Получить вопрос по ID
   */
  getQuestionById: (id: string) =>
    apiClient.get<Question>(`/exam/questions/${id}`, { skipAuth: true }),
};
