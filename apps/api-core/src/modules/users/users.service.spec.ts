import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserSettings } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;

  const defaultSettings: UserSettings = {
    locale: 'ru',
    notifications: {
      push: true,
      telegram: false,
      deadlines: true,
      news: true,
    },
    timezone: 'Europe/Moscow',
  };

  const mockUser: Partial<User> = {
    id: 'user-uuid-123',
    deviceId: 'device-id-123',
    citizenshipCode: 'UZB',
    regionCode: '77',
    entryDate: new Date('2024-01-15'),
    visitPurpose: 'work',
    registrationDate: null,
    patentDate: null,
    onboardingCompletedAt: null,
    subscriptionType: 'free',
    subscriptionExpiresAt: null,
    settings: defaultSettings,
    refreshTokenHash: 'hash123',
    signingKey: 'key123',
    recoveryCodeHash: 'recovery123',
    recoveryAttempts: 0,
    recoveryBlockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.getProfile(mockUser.id!);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException for missing user', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update allowed fields', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        citizenshipCode: 'TJK',
        regionCode: '50',
      });

      expect(result.citizenshipCode).toBe('TJK');
      expect(result.regionCode).toBe('50');
    });

    it('should update entry date', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        entryDate: '2024-02-01',
      });

      expect(result.entryDate).toEqual(new Date('2024-02-01'));
    });

    it('should clear entry date when empty string is passed', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        entryDate: '',
      });

      expect(result.entryDate).toBeNull();
    });

    it('should update settings', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        settings: {
          locale: 'en',
          notifications: {
            push: false,
          },
        },
      });

      expect(result.settings.locale).toBe('en');
      expect(result.settings.notifications.push).toBe(false);
      // Other notification settings should remain unchanged
      expect(result.settings.notifications.telegram).toBe(false);
      expect(result.settings.notifications.deadlines).toBe(true);
    });

    it('should merge settings without losing existing values', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        settings: {
          timezone: 'Europe/London',
        },
      });

      expect(result.settings.timezone).toBe('Europe/London');
      expect(result.settings.locale).toBe('ru'); // unchanged
      expect(result.settings.notifications.push).toBe(true); // unchanged
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent-id', { citizenshipCode: 'TJK' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not update fields that are not provided', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.updateProfile(mockUser.id!, {
        regionCode: '99',
      });

      expect(result.citizenshipCode).toBe('UZB'); // unchanged
      expect(result.regionCode).toBe('99'); // changed
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboardingCompleted flag', async () => {
      const userWithoutOnboarding = { ...mockUser, onboardingCompletedAt: null };
      usersRepository.findOne.mockResolvedValue(userWithoutOnboarding as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.completeOnboarding(mockUser.id!, {
        citizenshipCode: 'UZB',
        entryDate: '2024-01-15',
        purpose: 'work' as any,
      });

      expect(result.onboardingCompletedAt).toBeInstanceOf(Date);
    });

    it('should save citizenship and entry date', async () => {
      const userWithoutOnboarding = { ...mockUser, onboardingCompletedAt: null };
      usersRepository.findOne.mockResolvedValue(userWithoutOnboarding as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.completeOnboarding(mockUser.id!, {
        citizenshipCode: 'TJK',
        entryDate: '2024-03-01',
        purpose: 'work' as any,
      });

      expect(result.citizenshipCode).toBe('TJK');
      expect(result.entryDate).toEqual(new Date('2024-03-01'));
      expect(result.visitPurpose).toBe('work');
    });

    it('should save optional fields', async () => {
      const userWithoutOnboarding = { ...mockUser, onboardingCompletedAt: null };
      usersRepository.findOne.mockResolvedValue(userWithoutOnboarding as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      const result = await service.completeOnboarding(mockUser.id!, {
        citizenshipCode: 'UZB',
        entryDate: '2024-01-15',
        purpose: 'work' as any,
        regionCode: '77',
        registrationDate: '2024-01-20',
        patentDate: '2024-02-01',
      });

      expect(result.regionCode).toBe('77');
      expect(result.registrationDate).toEqual(new Date('2024-01-20'));
      expect(result.patentDate).toEqual(new Date('2024-02-01'));
    });

    it('should reject if already completed', async () => {
      const userWithOnboarding = {
        ...mockUser,
        onboardingCompletedAt: new Date(),
      };
      usersRepository.findOne.mockResolvedValue(userWithOnboarding as User);

      await expect(
        service.completeOnboarding(mockUser.id!, {
          citizenshipCode: 'UZB',
          entryDate: '2024-01-15',
          purpose: 'work' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.completeOnboarding('non-existent-id', {
          citizenshipCode: 'UZB',
          entryDate: '2024-01-15',
          purpose: 'work' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      await service.deleteAccount(mockUser.id!);

      expect(usersRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should clear personal data', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      await service.deleteAccount(mockUser.id!);

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          citizenshipCode: null,
          regionCode: null,
          entryDate: null,
          visitPurpose: null,
          registrationDate: null,
          patentDate: null,
          onboardingCompletedAt: null,
        }),
      );
    });

    it('should revoke all tokens', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      await service.deleteAccount(mockUser.id!);

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshTokenHash: null,
          signingKey: null,
          recoveryCodeHash: null,
        }),
      );
    });

    it('should reset settings to defaults', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      usersRepository.save.mockImplementation(async (user) => user as User);

      await service.deleteAccount(mockUser.id!);

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: {
            locale: 'ru',
            notifications: {
              push: false,
              telegram: false,
              deadlines: false,
              news: false,
            },
            timezone: 'Europe/Moscow',
          },
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAccount('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
