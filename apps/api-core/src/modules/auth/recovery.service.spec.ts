import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RecoveryService } from './recovery.service';
import { SigningService } from './signing.service';
import { User } from '../users/entities/user.entity';

describe('RecoveryService', () => {
  let service: RecoveryService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let signingService: jest.Mocked<SigningService>;

  const mockSigningKey = 'b'.repeat(64);
  const validRecoveryCode = 'ABC123XYZ789';
  const recoveryCodeHash = crypto.createHash('sha256').update(validRecoveryCode).digest('hex');

  const mockUser: Partial<User> = {
    id: 'user-uuid-123',
    deviceId: 'device-id-123',
    recoveryCodeHash,
    recoveryAttempts: 0,
    recoveryBlockedUntil: null,
    refreshTokenHash: null,
    signingKey: null,
    settings: {
      locale: 'ru',
      notifications: {
        push: true,
        telegram: false,
        deadlines: true,
        news: true,
      },
      timezone: 'Europe/Moscow',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config: Record<string, string> = {
                'jwt.secret': 'test-secret',
                'jwt.refreshSecret': 'test-refresh-secret',
                'jwt.accessExpiresIn': '15m',
                'jwt.refreshExpiresIn': '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: SigningService,
          useValue: {
            generateSigningKey: jest.fn().mockReturnValue(mockSigningKey),
          },
        },
      ],
    }).compile();

    service = module.get<RecoveryService>(RecoveryService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    signingService = module.get(SigningService);

    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyRecoveryCode', () => {
    it('should verify correct code and return tokens', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.verifyRecoveryCode({
        deviceId: 'device-id-123',
        recoveryCode: validRecoveryCode,
      });

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.userId).toBe(mockUser.id);
      expect(result.newRecoveryCode).toBeDefined();
      expect(result.newRecoveryCode).toHaveLength(12);
      expect(result.signingKey).toBe(mockSigningKey);
    });

    it('should reject incorrect code', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: 'WRONG_CODE_12',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject unknown device', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'unknown-device',
          recoveryCode: validRecoveryCode,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should increment attempts on failure', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: 'WRONG_CODE_12',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          recoveryAttempts: 1,
        }),
      );
    });

    it('should rate limit after 3 attempts', async () => {
      const userWith2Attempts = {
        ...mockUser,
        recoveryAttempts: 2,
      };
      userRepository.findOne.mockResolvedValue(userWith2Attempts as User);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: 'WRONG_CODE_12',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          recoveryAttempts: 3,
          recoveryBlockedUntil: expect.any(Date),
        }),
      );
    });

    it('should block user for 15 minutes after max attempts', async () => {
      const blockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      const blockedUser = {
        ...mockUser,
        recoveryBlockedUntil: blockedUntil,
      };
      userRepository.findOne.mockResolvedValue(blockedUser as User);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: validRecoveryCode,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reset rate limit after 15 minutes', async () => {
      const expiredBlock = new Date(Date.now() - 1000); // 1 second ago
      const userWithExpiredBlock = {
        ...mockUser,
        recoveryAttempts: 3,
        recoveryBlockedUntil: expiredBlock,
      };
      userRepository.findOne.mockResolvedValue(userWithExpiredBlock as User);

      const result = await service.verifyRecoveryCode({
        deviceId: 'device-id-123',
        recoveryCode: validRecoveryCode,
      });

      expect(result.accessToken).toBeDefined();
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          recoveryAttempts: 0,
          recoveryBlockedUntil: null,
        }),
      );
    });

    it('should reset attempts on successful recovery', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await service.verifyRecoveryCode({
        deviceId: 'device-id-123',
        recoveryCode: validRecoveryCode,
      });

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          recoveryAttempts: 0,
          recoveryBlockedUntil: null,
        }),
      );
    });

    it('should generate new recovery code on success', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.verifyRecoveryCode({
        deviceId: 'device-id-123',
        recoveryCode: validRecoveryCode,
      });

      expect(result.newRecoveryCode).toBeDefined();
      expect(result.newRecoveryCode).toHaveLength(12);
      expect(result.newRecoveryCode).toMatch(/^[A-Z0-9]+$/);
    });

    it('should update recovery code hash on success', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await service.verifyRecoveryCode({
        deviceId: 'device-id-123',
        recoveryCode: validRecoveryCode,
      });

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          recoveryCodeHash: expect.any(String),
        }),
      );
    });

    it('should reject if user has no recovery code set', async () => {
      const userWithoutRecoveryCode = {
        ...mockUser,
        recoveryCodeHash: null,
      };
      userRepository.findOne.mockResolvedValue(userWithoutRecoveryCode as User);

      await expect(
        service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: 'ANY_CODE_123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should show remaining attempts in error message', async () => {
      const userWith1Attempt = {
        ...mockUser,
        recoveryAttempts: 1,
      };
      userRepository.findOne.mockResolvedValue(userWith1Attempt as User);

      try {
        await service.verifyRecoveryCode({
          deviceId: 'device-id-123',
          recoveryCode: 'WRONG_CODE_12',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toContain('1 attempt');
      }
    });
  });

  describe('generateRecoveryCode', () => {
    it('should generate 12-char code', () => {
      const code = service.generateRecoveryCode();

      expect(code).toHaveLength(12);
    });

    it('should use only uppercase alphanumeric characters', () => {
      const code = service.generateRecoveryCode();

      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('should be unique each time', () => {
      const codes = new Set<string>();

      for (let i = 0; i < 100; i++) {
        codes.add(service.generateRecoveryCode());
      }

      // All 100 codes should be unique
      expect(codes.size).toBe(100);
    });
  });
});
