import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserSettings } from './entities/user.entity';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
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
}
