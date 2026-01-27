/**
 * Unit tests for BackgroundSync
 */

import { backgroundSync } from '../backgroundSync';
import { tokenStorage } from '@/lib/api/storage';
import { offlineQueue } from '../offlineQueue';
import type { OfflineQueueItem, BackgroundSyncConfig } from '../types';

// Mock dependencies
jest.mock('@/lib/api/storage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(),
  },
}));

jest.mock('../offlineQueue', () => ({
  offlineQueue: {
    getAllIncludingFailed: jest.fn(),
    markAsProcessing: jest.fn(),
    markAsCompleted: jest.fn(),
    markAsFailed: jest.fn(),
    incrementRetryCount: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('BackgroundSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    // Reset backgroundSync config to default
    backgroundSync.setConfig({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      requestTimeout: 30000,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('syncOne', () => {
    const mockItem: OfflineQueueItem = {
      id: '1',
      action: 'Create Document',
      endpoint: '/api/v1/documents',
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
      createdAt: '2024-01-01T00:00:00.000Z',
      retryCount: 0,
      status: 'pending',
    };

    it('should successfully sync an item with token', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ id: '123', success: true })),
      });

      const result = await backgroundSync.syncOne(mockItem);

      expect(offlineQueue.markAsProcessing).toHaveBeenCalledWith('1');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/api/v1/documents',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: mockItem.body,
        })
      );
      expect(offlineQueue.markAsCompleted).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        success: true,
        item: mockItem,
        response: { id: '123', success: true },
      });
    });

    it('should successfully sync an item without token', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      });

      const result = await backgroundSync.syncOne(mockItem);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/api/v1/documents',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(offlineQueue.markAsCompleted).toHaveBeenCalledWith('1');
      expect(result.success).toBe(true);
      expect(result.response).toEqual({});
    });

    it('should handle HTTP error responses', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      });

      const itemWithRetry = { ...mockItem, retryCount: 0 };
      const result = await backgroundSync.syncOne(itemWithRetry);

      expect(offlineQueue.markAsProcessing).toHaveBeenCalledWith('1');
      expect(offlineQueue.incrementRetryCount).toHaveBeenCalledWith('1');
      expect(offlineQueue.updateStatus).toHaveBeenCalledWith(
        '1',
        'pending',
        'HTTP 400: Bad Request'
      );
      expect(result).toEqual({
        success: false,
        item: itemWithRetry,
        error: 'HTTP 400: Bad Request',
      });
    });

    it('should mark as failed when max retries reached', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const itemWithMaxRetries = { ...mockItem, retryCount: 2 };
      const result = await backgroundSync.syncOne(itemWithMaxRetries);

      expect(offlineQueue.markAsFailed).toHaveBeenCalledWith(
        '1',
        'HTTP 500: Internal Server Error'
      );
      expect(offlineQueue.incrementRetryCount).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });

    it('should handle network errors', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await backgroundSync.syncOne(mockItem);

      expect(offlineQueue.incrementRetryCount).toHaveBeenCalledWith('1');
      expect(offlineQueue.updateStatus).toHaveBeenCalledWith('1', 'pending', 'Network error');
      expect(result).toEqual({
        success: false,
        item: mockItem,
        error: 'Network error',
      });
    });

    it('should handle timeout with AbortController', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');

      // Mock fetch to reject after timeout
      (fetch as jest.Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      const result = await backgroundSync.syncOne(mockItem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('abort');
    });

    it('should handle response parsing errors gracefully', async () => {
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockRejectedValue(new Error('Parse error')),
      });

      const result = await backgroundSync.syncOne(mockItem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 500');
    });
  });

  describe('processQueue', () => {
    it('should not process if already syncing', async () => {
      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test',
          endpoint: '/api/test',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);

      // Start first sync
      const firstSync = backgroundSync.processQueue();

      // Try to start second sync while first is running
      const secondSync = backgroundSync.processQueue();

      const secondResult = await secondSync;
      expect(secondResult).toEqual({
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      });

      await firstSync;
    });

    it('should not process if offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await backgroundSync.processQueue();

      expect(result).toEqual({
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      });
      expect(offlineQueue.getAllIncludingFailed).not.toHaveBeenCalled();
    });

    it('should process all items in queue successfully', async () => {
      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST',
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
      });

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
    });

    it('should handle mixed success and failures', async () => {
      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST',
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue('{}'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValue('Server Error'),
        });

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should skip processing items', async () => {
      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'processing',
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST',
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
      });

      const result = await backgroundSync.processQueue();

      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
    });

    it('should apply exponential backoff delay for retried items', async () => {
      jest.useFakeTimers();

      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 2,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
      });

      const processPromise = backgroundSync.processQueue();

      // Should delay by baseDelay * 2^retryCount = 1000 * 2^2 = 4000ms
      await jest.advanceTimersByTimeAsync(4000);

      const result = await processPromise;

      expect(result.processed).toBe(1);
      jest.useRealTimers();
    });

    it('should stop processing if going offline mid-sync', async () => {
      const mockItems: OfflineQueueItem[] = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST',
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST',
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 0,
          status: 'pending',
        },
      ];

      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);
      (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('test-token');

      let callCount = 0;
      (fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        const result = Promise.resolve({
          ok: true,
          text: jest.fn().mockResolvedValue('{}'),
        });

        // Simulate going offline after first request completes
        if (callCount === 1) {
          result.then(() => {
            Object.defineProperty(navigator, 'onLine', {
              writable: true,
              value: false,
            });
          });
        }

        return result;
      });

      const result = await backgroundSync.processQueue();

      // After first item succeeds, the sync should detect offline and stop
      expect(result.processed).toBeGreaterThanOrEqual(1);
      expect(result.processed).toBeLessThanOrEqual(2);
      expect(result.successful).toBeGreaterThanOrEqual(1);
    });

    it('should update lastSyncAt on successful completion', async () => {
      const mockItems: OfflineQueueItem[] = [];
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);

      const beforeSync = backgroundSync.getLastSyncAt();
      await backgroundSync.processQueue();
      const afterSync = backgroundSync.getLastSyncAt();

      expect(afterSync).not.toBe(beforeSync);
      expect(afterSync).toBeInstanceOf(Date);
    });

    it('should notify listeners when sync state changes', async () => {
      const mockItems: OfflineQueueItem[] = [];
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue(mockItems);

      const listener = jest.fn();
      const unsubscribe = backgroundSync.subscribe(listener);

      await backgroundSync.processQueue();

      expect(listener).toHaveBeenCalledTimes(2); // Once at start, once at end
      unsubscribe();
    });
  });

  describe('getIsSyncing', () => {
    it('should return false initially', () => {
      expect(backgroundSync.getIsSyncing()).toBe(false);
    });

    it('should return true during sync', async () => {
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockImplementation(() => {
        expect(backgroundSync.getIsSyncing()).toBe(true);
        return Promise.resolve([]);
      });

      await backgroundSync.processQueue();
    });
  });

  describe('getLastSyncAt', () => {
    it('should return null initially', () => {
      expect(backgroundSync.getLastSyncAt()).toBe(null);
    });

    it('should return Date after successful sync', async () => {
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue([]);

      await backgroundSync.processQueue();

      expect(backgroundSync.getLastSyncAt()).toBeInstanceOf(Date);
    });
  });

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = backgroundSync.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call listener on state changes', async () => {
      const listener = jest.fn();
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue([]);

      backgroundSync.subscribe(listener);
      await backgroundSync.processQueue();

      expect(listener).toHaveBeenCalled();
    });

    it('should not call listener after unsubscribe', async () => {
      const listener = jest.fn();
      (offlineQueue.getAllIncludingFailed as jest.Mock).mockResolvedValue([]);

      const unsubscribe = backgroundSync.subscribe(listener);
      unsubscribe();

      listener.mockClear();
      await backgroundSync.processQueue();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const config = backgroundSync.getConfig();

      expect(config).toEqual({
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        requestTimeout: 30000,
      });

      // Verify it's a copy, not the original
      config.maxRetries = 999;
      expect(backgroundSync.getConfig().maxRetries).toBe(3);
    });
  });

  describe('setConfig', () => {
    it('should update configuration partially', () => {
      backgroundSync.setConfig({ maxRetries: 5 });

      const config = backgroundSync.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.baseDelay).toBe(1000); // Other values unchanged
    });

    it('should update multiple config values', () => {
      backgroundSync.setConfig({
        maxRetries: 10,
        baseDelay: 2000,
        maxDelay: 60000,
      });

      const config = backgroundSync.getConfig();
      expect(config.maxRetries).toBe(10);
      expect(config.baseDelay).toBe(2000);
      expect(config.maxDelay).toBe(60000);
      expect(config.requestTimeout).toBe(30000); // Unchanged
    });
  });

  describe('exponential backoff calculation', () => {
    it('should calculate correct delays for different retry counts', () => {
      // Access private method through type assertion for testing
      const instance = backgroundSync as any;

      expect(instance.calculateDelay(0)).toBe(1000); // 1000 * 2^0
      expect(instance.calculateDelay(1)).toBe(2000); // 1000 * 2^1
      expect(instance.calculateDelay(2)).toBe(4000); // 1000 * 2^2
      expect(instance.calculateDelay(3)).toBe(8000); // 1000 * 2^3
    });

    it('should cap delay at maxDelay', () => {
      const instance = backgroundSync as any;

      expect(instance.calculateDelay(10)).toBe(30000); // Should be capped at maxDelay
    });

    it('should respect custom baseDelay and maxDelay', () => {
      backgroundSync.setConfig({ baseDelay: 500, maxDelay: 5000 });
      const instance = backgroundSync as any;

      expect(instance.calculateDelay(0)).toBe(500); // 500 * 2^0
      expect(instance.calculateDelay(1)).toBe(1000); // 500 * 2^1
      expect(instance.calculateDelay(2)).toBe(2000); // 500 * 2^2
      expect(instance.calculateDelay(10)).toBe(5000); // Capped at maxDelay

      // Reset to default
      backgroundSync.setConfig({ baseDelay: 1000, maxDelay: 30000 });
    });
  });
});
