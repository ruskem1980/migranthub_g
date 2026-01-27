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
} from './dto';

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
        totalQuestions: 0,
        icon: 'book',
      },
      {
        id: QuestionCategory.HISTORY,
        name: 'История России',
        description: 'Вопросы по истории России',
        totalQuestions: 0,
        icon: 'history',
      },
      {
        id: QuestionCategory.LAW,
        name: 'Основы законодательства',
        description: 'Вопросы по законодательству РФ',
        totalQuestions: 0,
        icon: 'scale',
      },
    ];
  }

  /**
   * Get questions with optional filtering
   */
  getQuestions(query: GetQuestionsQueryDto): QuestionDto[] {
    this.logger.log(`Getting questions with query: ${JSON.stringify(query)}`);
    // TODO: Implement question fetching from data source
    // This is a stub - questions will be added in a separate task
    return [];
  }

  /**
   * Submit exam answers and calculate results
   */
  async submitExam(deviceId: string, dto: SubmitExamDto): Promise<ExamResultDto> {
    this.logger.log(`Submitting exam for device: ${deviceId}, mode: ${dto.mode}`);

    // TODO: Implement actual answer checking against questions
    // This is a stub implementation
    const totalQuestions = dto.answers.length;
    const correctAnswers = 0; // Will be calculated when questions are added
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Update progress
    await this.updateProgress(deviceId, dto, correctAnswers);

    return {
      totalQuestions,
      correctAnswers,
      percentage,
      passed: percentage >= 70,
      byCategory: [],
      weakTopics: [],
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
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(deviceId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update streak
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

    // Update test statistics
    const percentage =
      dto.answers.length > 0
        ? Math.round((correctAnswers / dto.answers.length) * 100)
        : 0;

    if (dto.mode === 'exam') {
      progress.testsCompleted += 1;
      if (percentage > progress.bestScore) {
        progress.bestScore = percentage;
      }

      // Add to recent results (keep last 20)
      progress.recentResults = [
        { date: today.toISOString().split('T')[0], score: percentage },
        ...progress.recentResults,
      ].slice(0, 20);
    }

    // Add answered question IDs
    const newQuestionIds = dto.answers.map((a) => a.questionId);
    progress.answeredQuestionIds = [
      ...new Set([...progress.answeredQuestionIds, ...newQuestionIds]),
    ];

    await this.examProgressRepository.save(progress);
  }
}
