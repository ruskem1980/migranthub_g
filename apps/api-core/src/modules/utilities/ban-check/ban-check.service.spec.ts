import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BanCheckService } from './ban-check.service';
import { CacheService } from '../../cache/cache.service';
import { MvdClient } from './mvd.client';
import { BanStatus, BanCheckSource } from './dto';

describe('BanCheckService', () => {
  let service: BanCheckService;
  let cacheService: jest.Mocked<CacheService>;
  let mvdClient: jest.Mocked<MvdClient>;

  const mockQuery = {
    lastName: 'Иванов',
    firstName: 'Иван',
    birthDate: '1990-01-01',
  };

  const mockCachedResponse = {
    status: BanStatus.NO_BAN,
    source: BanCheckSource.MVD,
    checkedAt: '2024-01-15T10:00:00.000Z',
  };

  const mockMvdResult = {
    hasBan: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanCheckService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(3600000), // 1 hour cache TTL
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: MvdClient,
          useValue: {
            isEnabled: jest.fn(),
            checkBan: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BanCheckService>(BanCheckService);
    cacheService = module.get(CacheService);
    mvdClient = module.get(MvdClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBan', () => {
    it('should return cached result if exists', async () => {
      cacheService.get.mockResolvedValue(mockCachedResponse);

      const result = await service.checkBan(mockQuery);

      expect(cacheService.get).toHaveBeenCalled();
      expect(result.status).toBe(BanStatus.NO_BAN);
      expect(result.source).toBe(BanCheckSource.CACHE);
      expect(mvdClient.checkBan).not.toHaveBeenCalled();
    });

    it('should call MvdClient if not cached', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      const result = await service.checkBan(mockQuery);

      expect(mvdClient.checkBan).toHaveBeenCalledWith(mockQuery);
      expect(result.status).toBe(BanStatus.NO_BAN);
      expect(result.source).toBe(BanCheckSource.MVD);
    });

    it('should cache successful result', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      await service.checkBan(mockQuery);

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: BanStatus.NO_BAN,
          source: BanCheckSource.MVD,
        }),
        expect.any(Number),
      );
    });

    it('should return UNKNOWN on MvdClient error', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockRejectedValue(new Error('Service unavailable'));

      const result = await service.checkBan(mockQuery);

      expect(result.status).toBe(BanStatus.UNKNOWN);
      expect(result.source).toBe(BanCheckSource.FALLBACK);
      expect(result.error).toBeDefined();
    });

    it('should return UNKNOWN when MVD is disabled', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(false);

      const result = await service.checkBan(mockQuery);

      expect(result.status).toBe(BanStatus.UNKNOWN);
      expect(result.source).toBe(BanCheckSource.FALLBACK);
      expect(mvdClient.checkBan).not.toHaveBeenCalled();
    });

    it('should return HAS_BAN when MvdClient returns ban', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue({
        hasBan: true,
        reason: 'Нарушение миграционного законодательства',
        expiresAt: '2025-12-31',
      });

      const result = await service.checkBan(mockQuery);

      expect(result.status).toBe(BanStatus.HAS_BAN);
      expect(result.reason).toBe('Нарушение миграционного законодательства');
      expect(result.expiresAt).toBe('2025-12-31');
    });

    it('should include checkedAt timestamp', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      const before = new Date().toISOString();
      const result = await service.checkBan(mockQuery);
      const after = new Date().toISOString();

      expect(result.checkedAt).toBeDefined();
      expect(result.checkedAt >= before).toBe(true);
      expect(result.checkedAt <= after).toBe(true);
    });

    it('should normalize cache key', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(false);

      await service.checkBan({
        lastName: '  иванов  ',
        firstName: '  иван  ',
        birthDate: '1990-01-01',
      });

      expect(cacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('ИВАНОВ:ИВАН:1990-01-01'),
      );
    });

    it('should handle cache read errors gracefully', async () => {
      cacheService.get.mockRejectedValue(new Error('Redis connection failed'));
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      const result = await service.checkBan(mockQuery);

      // Should still work, falling back to MVD
      expect(result.status).toBe(BanStatus.NO_BAN);
      expect(result.source).toBe(BanCheckSource.MVD);
    });

    it('should handle cache write errors gracefully', async () => {
      cacheService.get.mockResolvedValue(null);
      cacheService.set.mockRejectedValue(new Error('Redis connection failed'));
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      // Should not throw, result should still be returned
      const result = await service.checkBan(mockQuery);

      expect(result.status).toBe(BanStatus.NO_BAN);
    });
  });
});
