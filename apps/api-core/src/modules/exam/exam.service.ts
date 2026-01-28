import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamProgress } from './entities/exam-progress.entity';
import {
  QuestionCategory,
  CategoryDto,
  QuestionDto,
  GetQuestionsQueryDto,
  SubmitExamDto,
  ExamResultDto,
  ExamProgressDto,
  ExamStatisticsDto,
  CategoryResultDto,
} from './dto';
import { allQuestions, questionsByCategory, questionCounts } from './data';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(
    @InjectRepository(ExamProgress)
    private readonly examProgressRepository: Repository<ExamProgress>,
  ) {}

  /**
   * Get all available exam categories
   */
  getCategories(): CategoryDto[] {
    return [
      {
        id: QuestionCategory.RUSSIAN_LANGUAGE,
        name: 'Русский язык',
        description: 'Вопросы по русскому языку для экзамена',
        totalQuestions: questionCounts[QuestionCategory.RUSSIAN_LANGUAGE],
        icon: 'book',
      },
      {
        id: QuestionCategory.HISTORY,
        name: 'История России',
        description: 'Вопросы по истории России',
        totalQuestions: questionCounts[QuestionCategory.HISTORY],
        icon: 'landmark',
      },
      {
        id: QuestionCategory.LAW,
        name: 'Основы законодательства',
        description: 'Вопросы по законодательству РФ',
        totalQuestions: questionCounts[QuestionCategory.LAW],
        icon: 'scale',
      },
    ];
  }

  /**
   * Get questions with optional filtering
   */
  getQuestions(query: GetQuestionsQueryDto): QuestionDto[] {
    this.logger.log(`Getting questions with query: ${JSON.stringify(query)}`);

    const { category, count = 20, difficulty } = query;

    // 1. Выбираем базовый набор вопросов
    let questions: QuestionDto[] = category
      ? [...questionsByCategory[category]]
      : [...allQuestions];

    // 2. Фильтруем по сложности (если указана)
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }

    // 3. Перемешиваем (Fisher-Yates shuffle)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // 4. Ограничиваем количество
    const result = questions.slice(0, Math.min(count, questions.length));

    this.logger.log(`Returning ${result.length} questions`);
    return result;
  }

  /**
   * Submit exam answers and calculate results
   */
  async submitExam(deviceId: string, dto: SubmitExamDto): Promise<ExamResultDto> {
    this.logger.log(
      `Submitting exam for device: ${deviceId}, mode: ${dto.mode}, answers: ${dto.answers.length}`,
    );

    const totalQuestions = dto.answers.length;

    // 1. Проверяем каждый ответ
    const answersWithResults = dto.answers.map((answer) => {
      const question = this.findQuestionById(answer.questionId);
      if (!question) {
        this.logger.warn(`Question not found: ${answer.questionId}`);
        return {
          ...answer,
          isCorrect: false,
          category: null as string | null,
        };
      }
      return {
        ...answer,
        isCorrect: question.correctIndex === answer.selectedIndex,
        category: question.category as string | null,
      };
    });

    // 2. Считаем правильные ответы
    const correctAnswers = answersWithResults.filter((a) => a.isCorrect).length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // 3. Группируем по категориям
    const categoryResults: Record<string, { total: number; correct: number }> = {};

    for (const answer of answersWithResults) {
      if (!answer.category) continue;

      if (!categoryResults[answer.category]) {
        categoryResults[answer.category] = { total: 0, correct: 0 };
      }
      categoryResults[answer.category].total += 1;
      if (answer.isCorrect) {
        categoryResults[answer.category].correct += 1;
      }
    }

    // 4. Формируем результаты по категориям
    const byCategory: CategoryResultDto[] = Object.entries(categoryResults).map(
      ([category, data]) => ({
        category,
        total: data.total,
        correct: data.correct,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }),
    );

    // 5. Определяем слабые темы (< 70%)
    const weakTopics = byCategory.filter((cat) => cat.percentage < 70).map((cat) => cat.category);

    // 6. Обновляем прогресс пользователя
    await this.updateProgress(deviceId, dto, correctAnswers, byCategory);

    return {
      totalQuestions,
      correctAnswers,
      percentage,
      passed: percentage >= 70,
      byCategory,
      weakTopics,
      timeSpentSeconds: dto.timeSpentSeconds,
    };
  }

  /**
   * Get user's exam progress
   */
  async getProgress(deviceId: string): Promise<ExamProgressDto> {
    const progress = await this.getOrCreateProgress(deviceId);

    return {
      totalAnswered: Object.values(progress.categoryProgress).reduce(
        (sum, cat) => sum + cat.answered,
        0,
      ),
      correctAnswers: Object.values(progress.categoryProgress).reduce(
        (sum, cat) => sum + cat.correct,
        0,
      ),
      streak: progress.streak,
      lastActivityDate: progress.lastActivityDate
        ? progress.lastActivityDate.toISOString().split('T')[0]
        : null,
      byCategory: progress.categoryProgress,
      achievements: progress.achievements,
    };
  }

  /**
   * Get user's exam statistics
   */
  async getStatistics(deviceId: string): Promise<ExamStatisticsDto> {
    const progress = await this.getOrCreateProgress(deviceId);

    // Calculate average score from recent results
    const averageScore =
      progress.recentResults.length > 0
        ? progress.recentResults.reduce((sum, r) => sum + r.score, 0) /
          progress.recentResults.length
        : 0;

    // Find weakest and strongest categories
    const categories = Object.entries(progress.categoryProgress);
    let weakestCategory: string | null = null;
    let strongestCategory: string | null = null;

    if (categories.length > 0) {
      const sorted = categories
        .filter(([_, data]) => data.answered > 0)
        .map(([cat, data]) => ({
          category: cat,
          percentage: (data.correct / data.answered) * 100,
        }))
        .sort((a, b) => a.percentage - b.percentage);

      if (sorted.length > 0) {
        weakestCategory = sorted[0].category;
        strongestCategory = sorted[sorted.length - 1].category;
      }
    }

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      testsCompleted: progress.testsCompleted,
      bestScore: progress.bestScore,
      weakestCategory,
      strongestCategory,
      recentResults: progress.recentResults.slice(0, 10),
    };
  }

  /**
   * Find question by ID in the question database
   */
  private findQuestionById(questionId: string): QuestionDto | undefined {
    return allQuestions.find((q) => q.id === questionId);
  }

  /**
   * Get or create progress record for device
   */
  private async getOrCreateProgress(deviceId: string): Promise<ExamProgress> {
    let progress = await this.examProgressRepository.findOne({
      where: { deviceId },
    });

    if (!progress) {
      progress = this.examProgressRepository.create({
        deviceId,
        categoryProgress: {},
        answeredQuestionIds: [],
        streak: 0,
        lastActivityDate: null,
        achievements: [],
        testsCompleted: 0,
        bestScore: 0,
        recentResults: [],
      });
      await this.examProgressRepository.save(progress);
    }

    return progress;
  }

  /**
   * Update progress after exam submission
   */
  private async updateProgress(
    deviceId: string,
    dto: SubmitExamDto,
    correctAnswers: number,
    byCategory: CategoryResultDto[],
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(deviceId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Логика streak
    if (progress.lastActivityDate) {
      const lastActivity = new Date(progress.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        progress.streak += 1;
      } else if (daysDiff > 1) {
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }

    progress.lastActivityDate = today;

    // Обновляем прогресс по категориям
    for (const cat of byCategory) {
      if (!progress.categoryProgress[cat.category]) {
        progress.categoryProgress[cat.category] = { answered: 0, correct: 0 };
      }
      progress.categoryProgress[cat.category].answered += cat.total;
      progress.categoryProgress[cat.category].correct += cat.correct;
    }

    // Обновляем статистику для режима exam
    const percentage =
      dto.answers.length > 0 ? Math.round((correctAnswers / dto.answers.length) * 100) : 0;

    if (dto.mode === 'exam') {
      progress.testsCompleted += 1;
      if (percentage > progress.bestScore) {
        progress.bestScore = percentage;
      }

      progress.recentResults = [
        { date: today.toISOString().split('T')[0], score: percentage },
        ...progress.recentResults,
      ].slice(0, 20);
    }

    // Добавление ID отвеченных вопросов
    const newQuestionIds = dto.answers.map((a) => a.questionId);
    progress.answeredQuestionIds = [
      ...new Set([...progress.answeredQuestionIds, ...newQuestionIds]),
    ];

    await this.examProgressRepository.save(progress);
    this.logger.log(`Progress updated for device: ${deviceId}`);
  }
}
