import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { SigningService } from './signing.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let signingService: jest.Mocked<SigningService>;

  const mockUser: Partial<User> = {
    id: 'user-uuid-123',
    deviceId: 'device-id-123',
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

  const mockSigningKey = 'a'.repeat(64);
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SigningService,
          useValue: {
            generateSigningKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    signingService = module.get(SigningService);

    // Default mocks
    signingService.generateSigningKey.mockReturnValue(mockSigningKey);
    jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deviceAuth', () => {
    it('should create new user with device if not exists', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);

      const result = await service.deviceAuth({
        deviceId: 'new-device-id',
        locale: 'ru',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { deviceId: 'new-device-id' },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.isNewUser).toBe(true);
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
      expect(result.signingKey).toBe(mockSigningKey);
    });

    it('should return existing user for same deviceId', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.deviceAuth({
        deviceId: 'device-id-123',
        locale: 'ru',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { deviceId: 'device-id-123' },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(result.isNewUser).toBe(false);
      expect(result.userId).toBe(mockUser.id);
    });

    it('should generate valid JWT tokens', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.deviceAuth({
        deviceId: 'device-id-123',
      });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          did: mockUser.deviceId,
          type: 'access',
        }),
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '15m',
        }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          did: mockUser.deviceId,
          type: 'refresh',
        }),
        expect.objectContaining({
          secret: 'test-refresh-secret',
          expiresIn: '7d',
        }),
      );
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should generate signing key on auth', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.deviceAuth({
        deviceId: 'device-id-123',
      });

      expect(signingService.generateSigningKey).toHaveBeenCalled();
      expect(result.signingKey).toBe(mockSigningKey);
    });

    it('should store refresh token hash', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await service.deviceAuth({
        deviceId: 'device-id-123',
      });

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          refreshTokenHash: expect.any(String),
          signingKey: mockSigningKey,
        }),
      );
    });

    it('should use default locale when not provided', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);

      await service.deviceAuth({
        deviceId: 'new-device-id',
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            locale: 'ru',
          }),
        }),
      );
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token';
    const refreshTokenHash = crypto.createHash('sha256').update(validRefreshToken).digest('hex');
    const userWithToken = {
      ...mockUser,
      refreshTokenHash,
    };

    beforeEach(() => {
      jwtService.signAsync.mockReset();
      jwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');
    });

    it('should refresh valid token', async () => {
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        did: mockUser.deviceId,
        type: 'refresh',
      });
      userRepository.findOne.mockResolvedValue(userWithToken as User);

      const result = await service.refreshToken(validRefreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(validRefreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.isNewUser).toBe(false);
    });

    it('should reject expired token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject invalid token type', async () => {
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        did: mockUser.deviceId,
        type: 'access', // Wrong type
      });

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject token for non-existent user', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'non-existent-user',
        did: mockUser.deviceId,
        type: 'refresh',
      });
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject token with invalid hash', async () => {
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        did: mockUser.deviceId,
        type: 'refresh',
      });
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: 'different-hash',
      } as User);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate new signing key on refresh', async () => {
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        did: mockUser.deviceId,
        type: 'refresh',
      });
      userRepository.findOne.mockResolvedValue(userWithToken as User);

      const result = await service.refreshToken(validRefreshToken);

      expect(signingService.generateSigningKey).toHaveBeenCalled();
      expect(result.signingKey).toBe(mockSigningKey);
    });

    it('should update refresh token hash after refresh', async () => {
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        did: mockUser.deviceId,
        type: 'refresh',
      });
      userRepository.findOne.mockResolvedValue(userWithToken as User);

      await service.refreshToken(validRefreshToken);

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          refreshTokenHash: expect.any(String),
          signingKey: mockSigningKey,
        }),
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.validateUser(mockUser.id!);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
