import { backgroundSync } from '@/lib/sync/backgroundSync';
import { offlineQueue } from '@/lib/sync/offlineQueue';
import type { OfflineQueueItem } from '@/lib/sync/types';

// Mock offlineQueue
jest.mock('@/lib/sync/offlineQueue', () => ({
  offlineQueue: {
    markAsProcessing: jest.fn(),
    markAsCompleted: jest.fn(),
    markAsFailed: jest.fn(),
    incrementRetryCount: jest.fn(),
    updateStatus: jest.fn(),
    getAllIncludingFailed: jest.fn().mockResolvedValue([]),
  },
}));

// Mock tokenStorage
jest.mock('@/lib/api/storage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('BackgroundSync', () => {
  const createQueueItem = (
    overrides: Partial<OfflineQueueItem> = {}
  ): OfflineQueueItem => ({
    id: 'test-id',
    action: 'test_action',
    endpoint: '/api/test',
    method: 'POST',
    body: '{"test": true}',
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"success": true}'),
    });

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  describe('syncOne', () => {
    it('should send request and mark as completed on success', async () => {
      const item = createQueueItem();

      const result = await backgroundSync.syncOne(item);

      expect(result.success).toBe(true);
      expect(result.item).toEqual(item);
      expect(offlineQueue.markAsProcessing).toHaveBeenCalledWith(item.id);
      expect(offlineQueue.markAsCompleted).toHaveBeenCalledWith(item.id);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          body: item.body,
        })
      );
    });

    it('should include auth token in request', async () => {
      const item = createQueueItem();

      await backgroundSync.syncOne(item);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const item = createQueueItem();

      const result = await backgroundSync.syncOne(item);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle HTTP error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const item = createQueueItem();

      const result = await backgroundSync.syncOne(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should mark as failed when max retries exceeded', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      const item = createQueueItem({ retryCount: 2 }); // maxRetries is 3 by default

      await backgroundSync.syncOne(item);

      expect(offlineQueue.markAsFailed).toHaveBeenCalledWith(
        item.id,
        'Persistent error'
      );
    });

    it('should increment retry count when retries not exceeded', async () => {
      mockFetch.mockRejectedValue(new Error('Temporary error'));

      const item = createQueueItem({ retryCount: 0 });

      await backgroundSync.syncOne(item);

      expect(offlineQueue.incrementRetryCount).toHaveBeenCalledWith(item.id);
      expect(offlineQueue.updateStatus).toHaveBeenCalledWith(
        item.id,
        'pending',
        'Temporary error'
      );
    });
  });

  describe('processQueue', () => {
    it('should return empty result when already syncing', async () => {
      // Simulate already syncing by calling processQueue twice concurrently
      const firstCall = backgroundSync.processQueue();

      // Second call should return early
      const secondResult = await backgroundSync.processQueue();

      expect(secondResult.processed).toBe(0);

      await firstCall; // Clean up first call
    });

    it('should return empty result when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should process all pending items', async () => {
      const items = [
        createQueueItem({ id: 'item-1' }),
        createQueueItem({ id: 'item-2' }),
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(
        items
      );

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
    });

    it('should skip items with processing status', async () => {
      const items = [
        createQueueItem({ id: 'item-1', status: 'processing' }),
        createQueueItem({ id: 'item-2', status: 'pending' }),
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(
        items
      );

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(1);
    });

    it('should count failures correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('{}'),
        })
        .mockRejectedValueOnce(new Error('Failed'));

      const items = [
        createQueueItem({ id: 'item-1' }),
        createQueueItem({ id: 'item-2' }),
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(
        items
      );

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('getIsSyncing', () => {
    it('should return false initially', () => {
      expect(backgroundSync.getIsSyncing()).toBe(false);
    });
  });

  describe('getLastSyncAt', () => {
    it('should return Date or null', () => {
      const lastSyncAt = backgroundSync.getLastSyncAt();
      // Can be null initially or Date if processQueue was called in other tests
      expect(lastSyncAt === null || lastSyncAt instanceof Date).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = backgroundSync.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('getConfig', () => {
    it('should return config object', () => {
      const config = backgroundSync.getConfig();

      expect(config).toHaveProperty('maxRetries');
      expect(config).toHaveProperty('baseDelay');
      expect(config).toHaveProperty('maxDelay');
      expect(config).toHaveProperty('requestTimeout');
    });
  });

  describe('setConfig', () => {
    it('should update config', () => {
      const originalConfig = backgroundSync.getConfig();
      backgroundSync.setConfig({ maxRetries: 5 });

      const newConfig = backgroundSync.getConfig();
      expect(newConfig.maxRetries).toBe(5);

      // Restore
      backgroundSync.setConfig({ maxRetries: originalConfig.maxRetries });
    });
  });
});
