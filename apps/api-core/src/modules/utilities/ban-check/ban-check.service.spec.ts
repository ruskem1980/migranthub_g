import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BanCheckService } from './ban-check.service';
import { CacheService } from '../../cache/cache.service';
import { MvdClient } from './mvd.client';
import { FmsClient } from './fms.client';
import { BanStatus, BanCheckSource, BanCheckSourceRequest, BanType } from './dto';

describe('BanCheckService', () => {
  let service: BanCheckService;
  let cacheService: jest.Mocked<CacheService>;
  let mvdClient: jest.Mocked<MvdClient>;
  let fmsClient: jest.Mocked<FmsClient>;

  const mockQuery = {
    lastName: 'Иванов',
    firstName: 'Иван',
    birthDate: '1990-01-01',
  };

  const mockFmsQuery = {
    lastName: 'IVANOV',
    firstName: 'IVAN',
    birthDate: '1990-01-01',
    citizenship: 'UZB',
    source: BanCheckSourceRequest.FMS,
  };

  const mockCachedResponse = {
    status: BanStatus.NO_BAN,
    source: BanCheckSource.MVD,
    checkedAt: '2024-01-15T10:00:00.000Z',
  };

  const mockMvdResult = {
    hasBan: false,
  };

  const mockFmsResult = {
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
        {
          provide: FmsClient,
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
    fmsClient = module.get(FmsClient);
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

  describe('checkBan with FMS source', () => {
    it('should throw BadRequestException if FMS source without citizenship', async () => {
      const queryWithoutCitizenship = {
        lastName: 'IVANOV',
        firstName: 'IVAN',
        birthDate: '1990-01-01',
        source: BanCheckSourceRequest.FMS,
      };

      await expect(service.checkBan(queryWithoutCitizenship)).rejects.toThrow(
        'Citizenship is required for FMS source',
      );
    });

    it('should call FmsClient when source is FMS', async () => {
      cacheService.get.mockResolvedValue(null);
      fmsClient.isEnabled.mockReturnValue(true);
      fmsClient.checkBan.mockResolvedValue(mockFmsResult);

      const result = await service.checkBan(mockFmsQuery);

      expect(fmsClient.checkBan).toHaveBeenCalledWith(mockFmsQuery);
      expect(result.status).toBe(BanStatus.NO_BAN);
      expect(result.source).toBe(BanCheckSource.FMS);
    });

    it('should return cached result for FMS', async () => {
      const cachedFmsResponse = {
        status: BanStatus.NO_BAN,
        source: BanCheckSource.FMS,
        checkedAt: '2024-01-15T10:00:00.000Z',
      };
      cacheService.get.mockResolvedValue(cachedFmsResponse);

      const result = await service.checkBan(mockFmsQuery);

      expect(cacheService.get).toHaveBeenCalled();
      expect(result.status).toBe(BanStatus.NO_BAN);
      expect(result.source).toBe(BanCheckSource.CACHE);
      expect(fmsClient.checkBan).not.toHaveBeenCalled();
    });

    it('should return UNKNOWN when FMS is disabled', async () => {
      cacheService.get.mockResolvedValue(null);
      fmsClient.isEnabled.mockReturnValue(false);

      const result = await service.checkBan(mockFmsQuery);

      expect(result.status).toBe(BanStatus.UNKNOWN);
      expect(result.source).toBe(BanCheckSource.FALLBACK);
      expect(fmsClient.checkBan).not.toHaveBeenCalled();
    });

    it('should return UNKNOWN on FmsClient error', async () => {
      cacheService.get.mockResolvedValue(null);
      fmsClient.isEnabled.mockReturnValue(true);
      fmsClient.checkBan.mockRejectedValue(new Error('FMS service unavailable'));

      const result = await service.checkBan(mockFmsQuery);

      expect(result.status).toBe(BanStatus.UNKNOWN);
      expect(result.source).toBe(BanCheckSource.FALLBACK);
      expect(result.error).toBeDefined();
    });

    it('should return HAS_BAN with banType when FmsClient returns ban', async () => {
      cacheService.get.mockResolvedValue(null);
      fmsClient.isEnabled.mockReturnValue(true);
      fmsClient.checkBan.mockResolvedValue({
        hasBan: true,
        banType: BanType.ADMINISTRATIVE,
        reason: 'Административное выдворение',
        expiresAt: '2025-12-31',
      });

      const result = await service.checkBan(mockFmsQuery);

      expect(result.status).toBe(BanStatus.HAS_BAN);
      expect(result.banType).toBe(BanType.ADMINISTRATIVE);
      expect(result.reason).toBe('Административное выдворение');
      expect(result.expiresAt).toBe('2025-12-31');
    });

    it('should use MVD by default when source not specified', async () => {
      cacheService.get.mockResolvedValue(null);
      mvdClient.isEnabled.mockReturnValue(true);
      mvdClient.checkBan.mockResolvedValue(mockMvdResult);

      const result = await service.checkBan(mockQuery);

      expect(mvdClient.checkBan).toHaveBeenCalled();
      expect(fmsClient.checkBan).not.toHaveBeenCalled();
      expect(result.source).toBe(BanCheckSource.MVD);
    });
  });
});
