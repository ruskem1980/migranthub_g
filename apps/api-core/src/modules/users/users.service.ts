import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserSettings } from './entities/user.entity';
import { UpdateUserDto, CompleteOnboardingDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getProfile(userId);

    if (dto.citizenshipCode !== undefined) {
      user.citizenshipCode = dto.citizenshipCode;
    }

    if (dto.regionCode !== undefined) {
      user.regionCode = dto.regionCode;
    }

    if (dto.entryDate !== undefined) {
      user.entryDate = dto.entryDate ? new Date(dto.entryDate) : null;
    }

    if (dto.settings) {
      user.settings = this.mergeSettings(user.settings, dto.settings);
    }

    return this.usersRepository.save(user);
  }

  private mergeSettings(
    current: UserSettings,
    updates: {
      locale?: string;
      timezone?: string;
      notifications?: {
        push?: boolean;
        telegram?: boolean;
        deadlines?: boolean;
        news?: boolean;
      };
    },
  ): UserSettings {
    return {
      locale: updates.locale ?? current.locale,
      timezone: updates.timezone ?? current.timezone,
      notifications: {
        push: updates.notifications?.push ?? current.notifications.push,
        telegram: updates.notifications?.telegram ?? current.notifications.telegram,
        deadlines: updates.notifications?.deadlines ?? current.notifications.deadlines,
        news: updates.notifications?.news ?? current.notifications.news,
      },
    };
  }

  /**
   * Завершить онбординг пользователя
   * Сохраняет данные профиля, необходимые для работы приложения
   */
  async completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<User> {
    const user = await this.getProfile(userId);

    // Проверяем, что онбординг ещё не завершён
    if (user.onboardingCompletedAt) {
      throw new BadRequestException('Onboarding already completed');
    }

    // Обновляем профиль данными онбординга
    user.citizenshipCode = dto.citizenshipCode;
    user.entryDate = new Date(dto.entryDate);
    user.visitPurpose = dto.purpose;

    if (dto.regionCode) {
      user.regionCode = dto.regionCode;
    }

    if (dto.registrationDate) {
      user.registrationDate = new Date(dto.registrationDate);
    }

    if (dto.patentDate) {
      user.patentDate = new Date(dto.patentDate);
    }

    // Отмечаем завершение онбординга
    user.onboardingCompletedAt = new Date();

    this.logger.log(`Onboarding completed for user: ${userId}`);

    return this.usersRepository.save(user);
  }

  /**
   * Удалить аккаунт пользователя (soft delete)
   * - Устанавливает deletedAt
   * - Очищает персональные данные
   * - Отзывает все токены (очищает refreshTokenHash)
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getProfile(userId);

    // Очищаем персональные данные
    user.citizenshipCode = null;
    user.regionCode = null;
    user.entryDate = null;
    user.visitPurpose = null;
    user.registrationDate = null;
    user.patentDate = null;
    user.onboardingCompletedAt = null;

    // Отзываем все токены
    user.refreshTokenHash = null;
    user.signingKey = null;
    user.recoveryCodeHash = null;

    // Сбрасываем настройки на дефолтные
    user.settings = {
      locale: 'ru',
      notifications: {
        push: false,
        telegram: false,
        deadlines: false,
        news: false,
      },
      timezone: 'Europe/Moscow',
    };

    // Сохраняем изменения
    await this.usersRepository.save(user);

    // Выполняем soft delete
    await this.usersRepository.softDelete(userId);

    this.logger.log(`Account deleted for user: ${userId}`);
  }
}
