/**
 * Unit tests for OfflineQueue
 */

import { offlineQueue } from '../offlineQueue';
import { db } from '@/lib/db';
import type { EnqueueParams, QueueItemStatus } from '../types';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    offlineQueue: {
      add: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      clear: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          sortBy: jest.fn(),
          count: jest.fn(),
          delete: jest.fn(),
          toArray: jest.fn(),
        })),
        anyOf: jest.fn(() => ({
          sortBy: jest.fn(),
          count: jest.fn(),
        })),
      })),
    },
  },
}));

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
Object.defineProperty(global.crypto, 'randomUUID', {
  value: jest.fn(() => mockUUID),
  writable: true,
});

describe('OfflineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('enqueue', () => {
    it('should add an item to the queue with generated ID', async () => {
      const params: EnqueueParams = {
        action: 'Create Document',
        endpoint: '/api/v1/documents',
        method: 'POST',
        body: { title: 'Test Document' },
      };

      const id = await offlineQueue.enqueue(params);

      expect(id).toBe(mockUUID);
      expect(db.offlineQueue.add).toHaveBeenCalledWith({
        id: mockUUID,
        action: 'Create Document',
        endpoint: '/api/v1/documents',
        method: 'POST',
        body: JSON.stringify({ title: 'Test Document' }),
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 0,
        status: 'pending',
      });
    });

    it('should enqueue item without body', async () => {
      const params: EnqueueParams = {
        action: 'Delete Document',
        endpoint: '/api/v1/documents/123',
        method: 'DELETE',
      };

      await offlineQueue.enqueue(params);

      expect(db.offlineQueue.add).toHaveBeenCalledWith({
        id: mockUUID,
        action: 'Delete Document',
        endpoint: '/api/v1/documents/123',
        method: 'DELETE',
        body: undefined,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 0,
        status: 'pending',
      });
    });
  });

  describe('dequeue', () => {
    it('should get and delete the first pending item', async () => {
      const mockItem = {
        id: '1',
        action: 'Test',
        endpoint: '/api/test',
        method: 'POST' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 0,
        status: 'pending' as const,
      };

      const mockSortBy = jest.fn().mockResolvedValue([mockItem]);
      const mockEquals = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.dequeue();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('pending');
      expect(mockSortBy).toHaveBeenCalledWith('createdAt');
      expect(db.offlineQueue.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockItem);
    });

    it('should return undefined if no pending items', async () => {
      const mockSortBy = jest.fn().mockResolvedValue([]);
      const mockEquals = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.dequeue();

      expect(result).toBeUndefined();
      expect(db.offlineQueue.delete).not.toHaveBeenCalled();
    });
  });

  describe('peek', () => {
    it('should return the first pending item without deleting it', async () => {
      const mockItem = {
        id: '1',
        action: 'Test',
        endpoint: '/api/test',
        method: 'POST' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 0,
        status: 'pending' as const,
      };

      const mockSortBy = jest.fn().mockResolvedValue([mockItem]);
      const mockEquals = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.peek();

      expect(result).toEqual(mockItem);
      expect(db.offlineQueue.delete).not.toHaveBeenCalled();
    });

    it('should return undefined if no pending items', async () => {
      const mockSortBy = jest.fn().mockResolvedValue([]);
      const mockEquals = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.peek();

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all pending items sorted by createdAt', async () => {
      const mockItems = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending' as const,
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST' as const,
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 0,
          status: 'pending' as const,
        },
      ];

      const mockSortBy = jest.fn().mockResolvedValue(mockItems);
      const mockEquals = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.getAll();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('pending');
      expect(mockSortBy).toHaveBeenCalledWith('createdAt');
      expect(result).toEqual(mockItems);
    });
  });

  describe('getAllIncludingFailed', () => {
    it('should return pending and failed items sorted by createdAt', async () => {
      const mockItems = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 0,
          status: 'pending' as const,
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST' as const,
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 3,
          status: 'failed' as const,
        },
      ];

      const mockSortBy = jest.fn().mockResolvedValue(mockItems);
      const mockAnyOf = jest.fn().mockReturnValue({
        sortBy: mockSortBy,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        anyOf: mockAnyOf,
      });

      const result = await offlineQueue.getAllIncludingFailed();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockAnyOf).toHaveBeenCalledWith(['pending', 'failed']);
      expect(mockSortBy).toHaveBeenCalledWith('createdAt');
      expect(result).toEqual(mockItems);
    });
  });

  describe('clear', () => {
    it('should clear all items from the queue', async () => {
      await offlineQueue.clear();

      expect(db.offlineQueue.clear).toHaveBeenCalled();
    });
  });

  describe('clearCompleted', () => {
    it('should delete only completed items', async () => {
      const mockDelete = jest.fn();
      const mockEquals = jest.fn().mockReturnValue({
        delete: mockDelete,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      await offlineQueue.clearCompleted();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('completed');
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('getCount', () => {
    it('should return count of pending items', async () => {
      const mockCount = jest.fn().mockResolvedValue(5);
      const mockEquals = jest.fn().mockReturnValue({
        count: mockCount,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.getCount();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('pending');
      expect(result).toBe(5);
    });
  });

  describe('getPendingAndFailedCount', () => {
    it('should return count of pending and failed items', async () => {
      const mockCount = jest.fn().mockResolvedValue(8);
      const mockAnyOf = jest.fn().mockReturnValue({
        count: mockCount,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        anyOf: mockAnyOf,
      });

      const result = await offlineQueue.getPendingAndFailedCount();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockAnyOf).toHaveBeenCalledWith(['pending', 'failed']);
      expect(result).toBe(8);
    });
  });

  describe('getById', () => {
    it('should return item by ID', async () => {
      const mockItem = {
        id: '1',
        action: 'Test',
        endpoint: '/api/test',
        method: 'POST' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 0,
        status: 'pending' as const,
      };
      (db.offlineQueue.get as jest.Mock).mockResolvedValue(mockItem);

      const result = await offlineQueue.getById('1');

      expect(db.offlineQueue.get).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockItem);
    });

    it('should return undefined if item not found', async () => {
      (db.offlineQueue.get as jest.Mock).mockResolvedValue(undefined);

      const result = await offlineQueue.getById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update status without error', async () => {
      await offlineQueue.updateStatus('1', 'processing');

      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        status: 'processing',
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should update status with error message', async () => {
      await offlineQueue.updateStatus('1', 'failed', 'Network error');

      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        status: 'failed',
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
        lastError: 'Network error',
      });
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count and update lastAttemptAt', async () => {
      const mockItem = {
        id: '1',
        action: 'Test',
        endpoint: '/api/test',
        method: 'POST' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 2,
        status: 'pending' as const,
      };
      (db.offlineQueue.get as jest.Mock).mockResolvedValue(mockItem);

      await offlineQueue.incrementRetryCount('1');

      expect(db.offlineQueue.get).toHaveBeenCalledWith('1');
      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        retryCount: 3,
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should not update if item not found', async () => {
      (db.offlineQueue.get as jest.Mock).mockResolvedValue(undefined);

      await offlineQueue.incrementRetryCount('non-existent');

      expect(db.offlineQueue.update).not.toHaveBeenCalled();
    });
  });

  describe('resetFailed', () => {
    it('should reset all failed items to pending', async () => {
      const mockFailedItems = [
        {
          id: '1',
          action: 'Test 1',
          endpoint: '/api/test1',
          method: 'POST' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          retryCount: 3,
          status: 'failed' as const,
          lastError: 'Network error',
        },
        {
          id: '2',
          action: 'Test 2',
          endpoint: '/api/test2',
          method: 'POST' as const,
          createdAt: '2024-01-01T01:00:00.000Z',
          retryCount: 2,
          status: 'failed' as const,
          lastError: 'Timeout',
        },
      ];

      const mockToArray = jest.fn().mockResolvedValue(mockFailedItems);
      const mockEquals = jest.fn().mockReturnValue({
        toArray: mockToArray,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.resetFailed();

      expect(db.offlineQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('failed');
      expect(db.offlineQueue.update).toHaveBeenCalledTimes(2);
      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
      });
      expect(db.offlineQueue.update).toHaveBeenCalledWith('2', {
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
      });
      expect(result).toBe(2);
    });

    it('should return 0 if no failed items', async () => {
      const mockToArray = jest.fn().mockResolvedValue([]);
      const mockEquals = jest.fn().mockReturnValue({
        toArray: mockToArray,
      });
      (db.offlineQueue.where as jest.Mock).mockReturnValue({
        equals: mockEquals,
      });

      const result = await offlineQueue.resetFailed();

      expect(result).toBe(0);
      expect(db.offlineQueue.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete item by ID', async () => {
      await offlineQueue.remove('1');

      expect(db.offlineQueue.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('markAsProcessing', () => {
    it('should update status to processing', async () => {
      await offlineQueue.markAsProcessing('1');

      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        status: 'processing',
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('markAsCompleted', () => {
    it('should delete the item from queue', async () => {
      await offlineQueue.markAsCompleted('1');

      expect(db.offlineQueue.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('markAsFailed', () => {
    it('should increment retry count and update status to failed with error', async () => {
      const mockItem = {
        id: '1',
        action: 'Test',
        endpoint: '/api/test',
        method: 'POST' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        retryCount: 1,
        status: 'pending' as const,
      };
      (db.offlineQueue.get as jest.Mock).mockResolvedValue(mockItem);

      await offlineQueue.markAsFailed('1', 'Network error');

      expect(db.offlineQueue.get).toHaveBeenCalledWith('1');
      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        retryCount: 2,
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
      });
      expect(db.offlineQueue.update).toHaveBeenCalledWith('1', {
        status: 'failed',
        lastAttemptAt: '2024-01-01T00:00:00.000Z',
        lastError: 'Network error',
      });
    });
  });
});
