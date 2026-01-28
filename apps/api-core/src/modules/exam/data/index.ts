import { QuestionDto, QuestionCategory } from '../dto/question.dto';
import { russianLanguageQuestions } from './russian-language.data';
import { historyQuestions } from './history.data';
import { lawQuestions } from './law.data';

/**
 * Генерация ID для вопросов без ID
 */
function generateId(category: QuestionCategory, index: number): string {
  const prefix = {
    [QuestionCategory.RUSSIAN_LANGUAGE]: 'q-russian',
    [QuestionCategory.HISTORY]: 'q-history',
    [QuestionCategory.LAW]: 'q-law',
  };
  return `${prefix[category]}-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Вопросы по русскому языку с добавленными ID
 */
const russianWithIds: QuestionDto[] = russianLanguageQuestions.map((q, i) => ({
  ...q,
  id: generateId(QuestionCategory.RUSSIAN_LANGUAGE, i),
}));

/**
 * Вопросы по законодательству с добавленными ID
 */
const lawWithIds: QuestionDto[] = lawQuestions.map((q, i) => ({
  ...q,
  id: generateId(QuestionCategory.LAW, i),
}));

/**
 * Вопросы по истории (уже имеют ID)
 */
const historyWithIds: QuestionDto[] = historyQuestions;

/**
 * Объединённая база всех вопросов (300 вопросов)
 */
export const allQuestions: QuestionDto[] = [...russianWithIds, ...historyWithIds, ...lawWithIds];

/**
 * Вопросы, сгруппированные по категориям
 */
export const questionsByCategory: Record<QuestionCategory, QuestionDto[]> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: russianWithIds,
  [QuestionCategory.HISTORY]: historyWithIds,
  [QuestionCategory.LAW]: lawWithIds,
};

/**
 * Количество вопросов по категориям
 */
export const questionCounts: Record<QuestionCategory, number> = {
  [QuestionCategory.RUSSIAN_LANGUAGE]: russianWithIds.length,
  [QuestionCategory.HISTORY]: historyWithIds.length,
  [QuestionCategory.LAW]: lawWithIds.length,
};

// Реэкспорт оригинальных данных
export { russianLanguageQuestions, historyQuestions, lawQuestions };
