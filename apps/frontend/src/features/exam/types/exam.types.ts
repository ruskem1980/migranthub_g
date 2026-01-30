/**
 * Exam Module Types
 * Согласовано с backend DTOs: apps/api-core/src/modules/exam/dto/
 */

// ============= Enums =============

export enum QuestionCategory {
  RUSSIAN_LANGUAGE = 'russian_language',
  HISTORY = 'history',
  LAW = 'law',
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum ExamMode {
  PRACTICE = 'practice',
  EXAM = 'exam',
  LEARNING = 'learning',
  MARATHON = 'marathon',
}

// ============= Question =============

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  question: string;
  imageUrl?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tags: string[];
}

// ============= Category =============

export interface Category {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  icon: string;
}

// ============= Answer =============

export interface Answer {
  questionId: string;
  selectedIndex: number;
  isCorrect?: boolean;
  answeredAt?: string;
}

// ============= Session =============

export interface ExamSession {
  id: string;
  mode: ExamMode;
  category?: QuestionCategory;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  startedAt: string;
  finishedAt?: string;
  timeLimit?: number; // в секундах
  isPaused: boolean;
}

// ============= Progress =============

export interface CategoryProgress {
  answered: number;
  correct: number;
}

// ============= Level System =============

export interface LevelDefinition {
  name: string;
  minXP: number;
  maxXP: number;
}

export interface CurrentLevel extends LevelDefinition {
  progress: number; // 0-100%
}

export const LEVELS: LevelDefinition[] = [
  { name: 'Новичок', minXP: 0, maxXP: 100 },
  { name: 'Ученик', minXP: 100, maxXP: 300 },
  { name: 'Знаток', minXP: 300, maxXP: 600 },
  { name: 'Эксперт', minXP: 600, maxXP: 1000 },
  { name: 'Мастер', minXP: 1000, maxXP: Infinity },
];

// XP rewards per correct answer by difficulty
export const XP_REWARDS: Record<QuestionDifficulty, number> = {
  [QuestionDifficulty.EASY]: 5,
  [QuestionDifficulty.MEDIUM]: 10,
  [QuestionDifficulty.HARD]: 20,
};

export interface ExamProgress {
  totalAnswered: number;
  correctAnswers: number;
  streak: number;
  lastActivityDate: string | null;
  byCategory: Record<QuestionCategory, CategoryProgress>;
  achievements: string[];
  totalXP: number;
}

// ============= Result =============

export interface CategoryResult {
  category: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  byCategory: CategoryResult[];
  weakTopics: string[];
  timeSpentSeconds: number;
}

// ============= Statistics =============

export interface RecentResult {
  date: string;
  score: number;
}

export interface ExamStatistics {
  averageScore: number;
  testsCompleted: number;
  bestScore: number;
  weakestCategory: string | null;
  strongestCategory: string | null;
  recentResults: RecentResult[];
}

// ============= API Request/Response Types =============

export interface GetQuestionsParams {
  category?: QuestionCategory;
  count?: number;
  difficulty?: QuestionDifficulty;
}

export interface SubmitExamRequest {
  answers: Answer[];
  mode: ExamMode;
  timeSpentSeconds: number;
}

// ============= Store Types =============

export interface ExamState {
  // State
  currentSession: ExamSession | null;
  progress: ExamProgress;
  isLoading: boolean;
  error: string | null;

  // Actions
  startSession: (mode: ExamMode, questions: Question[], category?: QuestionCategory, timeLimit?: number) => void;
  answerQuestion: (questionId: string, selectedIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => ExamResult | null;
  updateProgress: (result: ExamResult) => void;
  reset: () => void;
  clearError: () => void;

  // XP & Level Actions
  addXP: (amount: number) => void;
  getLevel: () => CurrentLevel;
}

// ============= Helper Types =============

export type QuestionWithAnswer = Question & {
  userAnswer?: Answer;
};

export interface SessionSummary {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeSpent: number; // в секундах
}
