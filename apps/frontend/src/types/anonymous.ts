/**
 * Anonymous session types for Lazy Auth system
 * Tracks user activity and data before registration
 */

/**
 * Calculator result stored in anonymous session
 */
export interface CalculatorResult {
  type: 'stay' | 'patent';
  calculatedAt: Date;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

/**
 * Exam progress tracking for anonymous users
 */
export interface ExamProgress {
  questionsAnswered: number;
  correctAnswers: number;
  todayQuestions: number;
}

/**
 * Prefill data collected during anonymous usage
 * This data can be used to pre-populate registration form
 */
export interface PrefillData {
  entryDate?: string;
  region?: string;
  citizenship?: string;
}

/**
 * Anonymous session data
 * Stored locally and not synced to server
 */
export interface AnonymousSession {
  sessionId: string;
  createdAt: Date;
  lastActiveAt: Date;
  locale: string;
  calculatorResults: CalculatorResult[];
  examProgress: ExamProgress;
  aiQuestionsToday: number;
  prefillData?: PrefillData;
}

/**
 * Serializable version of AnonymousSession for storage
 * Dates are stored as ISO strings
 */
export interface SerializableAnonymousSession {
  sessionId: string;
  createdAt: string;
  lastActiveAt: string;
  locale: string;
  calculatorResults: SerializableCalculatorResult[];
  examProgress: ExamProgress;
  aiQuestionsToday: number;
  prefillData?: PrefillData;
}

/**
 * Serializable calculator result for storage
 */
export interface SerializableCalculatorResult {
  type: 'stay' | 'patent';
  calculatedAt: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

/**
 * Convert AnonymousSession to serializable format
 */
export function serializeAnonymousSession(session: AnonymousSession): SerializableAnonymousSession {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
    lastActiveAt: session.lastActiveAt.toISOString(),
    calculatorResults: session.calculatorResults.map((result) => ({
      ...result,
      calculatedAt: result.calculatedAt.toISOString(),
    })),
  };
}

/**
 * Convert serializable format back to AnonymousSession
 */
export function deserializeAnonymousSession(data: SerializableAnonymousSession): AnonymousSession {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    lastActiveAt: new Date(data.lastActiveAt),
    calculatorResults: data.calculatorResults.map((result) => ({
      ...result,
      calculatedAt: new Date(result.calculatedAt),
    })),
  };
}

/**
 * Daily limits for anonymous users
 */
export const ANONYMOUS_LIMITS = {
  maxExamQuestionsPerDay: 5,
  maxAiQuestionsPerDay: 3,
  maxCalculatorResults: 10,
} as const;

/**
 * Check if anonymous user has exceeded daily exam limit
 */
export function hasExceededExamLimit(session: AnonymousSession): boolean {
  return session.examProgress.todayQuestions >= ANONYMOUS_LIMITS.maxExamQuestionsPerDay;
}

/**
 * Check if anonymous user has exceeded daily AI questions limit
 */
export function hasExceededAiLimit(session: AnonymousSession): boolean {
  return session.aiQuestionsToday >= ANONYMOUS_LIMITS.maxAiQuestionsPerDay;
}
