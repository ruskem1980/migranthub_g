import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);

    // Mock checkConnection to pass
    cacheManager.set.mockResolvedValue(undefined);
    cacheManager.get.mockResolvedValue('ok');
    cacheManager.del.mockResolvedValue(undefined);

    // Trigger checkConnection
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      const testValue = { foo: 'bar' };
      cacheManager.get.mockResolvedValue(testValue);

      const result = await service.get<typeof testValue>('test-key');

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testValue);
    });

    it('should return null for missing key', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('missing-key');

      expect(result).toBeNull();
    });

    it('should return null on Redis error', async () => {
      cacheManager.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    it('should return null when cache is unavailable', async () => {
      // Make service unavailable
      (service as any).isAvailable = false;

      const result = await service.get('test-key');

      expect(result).toBeNull();
      expect(cacheManager.get).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should store value with TTL', async () => {
      await service.set('test-key', { data: 'value' }, 5000);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        { data: 'value' },
        5000,
      );
    });

    it('should store value without TTL', async () => {
      await service.set('test-key', 'value');

      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        'value',
        undefined,
      );
    });

    it('should not throw on Redis error', async () => {
      cacheManager.set.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(service.set('test-key', 'value')).resolves.not.toThrow();
    });

    it('should not call cacheManager when unavailable', async () => {
      (service as any).isAvailable = false;
      cacheManager.set.mockClear();

      await service.set('test-key', 'value');

      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      await service.del('test-key');

      expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should not throw on Redis error', async () => {
      cacheManager.del.mockRejectedValue(new Error('Redis connection failed'));

      await expect(service.del('test-key')).resolves.not.toThrow();
    });

    it('should not call cacheManager when unavailable', async () => {
      (service as any).isAvailable = false;
      cacheManager.del.mockClear();

      await service.del('test-key');

      expect(cacheManager.del).not.toHaveBeenCalled();
    });
  });

  describe('wrap', () => {
    it('should return cached value if exists', async () => {
      cacheManager.get.mockResolvedValue('cached-value');
      const fn = jest.fn();

      const result = await service.wrap('test-key', fn);

      expect(result).toBe('cached-value');
      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function and cache result on miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const fn = jest.fn().mockResolvedValue('computed-value');

      const result = await service.wrap('test-key', fn, 5000);

      expect(result).toBe('computed-value');
      expect(fn).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'test-key',
        'computed-value',
        5000,
      );
    });

    it('should call function when cache unavailable', async () => {
      (service as any).isAvailable = false;
      const fn = jest.fn().mockResolvedValue('computed-value');

      const result = await service.wrap('test-key', fn);

      expect(result).toBe('computed-value');
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return true when available', () => {
      (service as any).isAvailable = true;

      expect(service.isConnected()).toBe(true);
    });

    it('should return false when unavailable', () => {
      (service as any).isAvailable = false;

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('graceful degradation', () => {
    it('should mark as unavailable on connection failure', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          {
            provide: CACHE_MANAGER,
            useValue: {
              get: jest.fn().mockRejectedValue(new Error('Connection refused')),
              set: jest.fn().mockRejectedValue(new Error('Connection refused')),
              del: jest.fn(),
            },
          },
        ],
      }).compile();

      const failingService = module.get<CacheService>(CacheService);

      // Wait for checkConnection to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(failingService.isConnected()).toBe(false);
    });

    it('should continue working when Redis fails', async () => {
      (service as any).isAvailable = true;
      cacheManager.get.mockRejectedValue(new Error('Redis timeout'));
      cacheManager.set.mockRejectedValue(new Error('Redis timeout'));

      // All operations should complete without throwing
      const getResult = await service.get('key');
      await service.set('key', 'value');
      await service.del('key');

      expect(getResult).toBeNull();
    });

    it('should log warning on error', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'warn');
      cacheManager.get.mockRejectedValue(new Error('Test error'));

      await service.get('test-key');

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Redis on destroy', async () => {
      const mockDisconnect = jest.fn().mockResolvedValue(undefined);
      (cacheManager as any).store = {
        disconnect: mockDisconnect,
      };

      await service.onModuleDestroy();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle disconnect error gracefully', async () => {
      (cacheManager as any).store = {
        disconnect: jest.fn().mockRejectedValue(new Error('Disconnect failed')),
      };

      // Should not throw
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });

    it('should handle missing disconnect method', async () => {
      (cacheManager as any).store = {};

      // Should not throw
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
