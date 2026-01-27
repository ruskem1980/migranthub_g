import { offlineQueue } from '@/lib/sync/offlineQueue';
import { db } from '@/lib/db';

// Mock Dexie database
jest.mock('@/lib/db', () => {
  const items: Map<string, any> = new Map();

  return {
    db: {
      offlineQueue: {
        add: jest.fn(async (item: any) => {
          items.set(item.id, item);
          return item.id;
        }),
        get: jest.fn(async (id: string) => items.get(id)),
        delete: jest.fn(async (id: string) => {
          items.delete(id);
        }),
        update: jest.fn(async (id: string, updates: any) => {
          const item = items.get(id);
          if (item) {
            items.set(id, { ...item, ...updates });
          }
        }),
        clear: jest.fn(async () => {
          items.clear();
        }),
        where: jest.fn(() => ({
          equals: jest.fn(() => ({
            sortBy: jest.fn(async () =>
              Array.from(items.values())
                .filter((i) => i.status === 'pending')
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
            ),
            count: jest.fn(async () =>
              Array.from(items.values()).filter((i) => i.status === 'pending')
                .length
            ),
            delete: jest.fn(async () => {
              Array.from(items.entries())
                .filter(([, v]) => v.status === 'completed')
                .forEach(([k]) => items.delete(k));
            }),
          })),
          anyOf: jest.fn(() => ({
            sortBy: jest.fn(async () =>
              Array.from(items.values())
                .filter((i) => i.status === 'pending' || i.status === 'failed')
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
            ),
            count: jest.fn(async () =>
              Array.from(items.values()).filter(
                (i) => i.status === 'pending' || i.status === 'failed'
              ).length
            ),
          })),
        })),
        toArray: jest.fn(async () => Array.from(items.values())),
      },
    },
  };
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Date.now(),
  },
});

describe('OfflineQueue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await offlineQueue.clear();
  });

  describe('enqueue', () => {
    it('should add item to queue and return id', async () => {
      const id = await offlineQueue.enqueue({
        action: 'update_profile',
        endpoint: '/api/v1/users/me',
        method: 'PATCH',
        body: { name: 'Test' },
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(db.offlineQueue.add).toHaveBeenCalled();
    });

    it('should set pending status for new items', async () => {
      const id = await offlineQueue.enqueue({
        action: 'create_document',
        endpoint: '/test',
        method: 'POST',
      });

      expect(db.offlineQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          retryCount: 0,
        })
      );
    });

    it('should stringify body if provided as object', async () => {
      const body = { foo: 'bar' };
      await offlineQueue.enqueue({
        action: 'test',
        endpoint: '/test',
        method: 'POST',
        body,
      });

      expect(db.offlineQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          body: JSON.stringify(body),
        })
      );
    });

    it('should set createdAt timestamp', async () => {
      const before = new Date().toISOString();
      await offlineQueue.enqueue({
        action: 'test',
        endpoint: '/test',
        method: 'POST',
      });
      const after = new Date().toISOString();

      const call = (db.offlineQueue.add as jest.Mock).mock.calls[0][0];
      expect(call.createdAt).toBeDefined();
      expect(call.createdAt >= before).toBe(true);
      expect(call.createdAt <= after).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return pending items sorted by createdAt', async () => {
      const result = await offlineQueue.getAll();
      expect(Array.isArray(result)).toBe(true);
      expect(db.offlineQueue.where).toHaveBeenCalled();
    });
  });

  describe('getCount', () => {
    it('should return count of pending items', async () => {
      const count = await offlineQueue.getCount();
      expect(typeof count).toBe('number');
    });
  });

  describe('markAsCompleted', () => {
    it('should delete item from queue', async () => {
      await offlineQueue.markAsCompleted('test-id');
      expect(db.offlineQueue.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('markAsFailed', () => {
    it('should update status and error message', async () => {
      // First add an item
      await offlineQueue.enqueue({
        action: 'test',
        endpoint: '/test',
        method: 'POST',
      });

      const addedItem = (db.offlineQueue.add as jest.Mock).mock.calls[0][0];
      await offlineQueue.markAsFailed(addedItem.id, 'Network error');

      expect(db.offlineQueue.update).toHaveBeenCalledWith(
        addedItem.id,
        expect.objectContaining({
          status: 'failed',
          lastError: 'Network error',
        })
      );
    });
  });

  describe('markAsProcessing', () => {
    it('should update status to processing', async () => {
      await offlineQueue.markAsProcessing('test-id');

      expect(db.offlineQueue.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          status: 'processing',
        })
      );
    });
  });

  describe('clear', () => {
    it('should clear all items from queue', async () => {
      await offlineQueue.clear();
      expect(db.offlineQueue.clear).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return item by id', async () => {
      await offlineQueue.getById('test-id');
      expect(db.offlineQueue.get).toHaveBeenCalledWith('test-id');
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count for item', async () => {
      // Setup mock to return an existing item
      const existingItem = {
        id: 'retry-test',
        retryCount: 2,
      };
      (db.offlineQueue.get as jest.Mock).mockResolvedValueOnce(existingItem);

      await offlineQueue.incrementRetryCount('retry-test');

      expect(db.offlineQueue.update).toHaveBeenCalledWith(
        'retry-test',
        expect.objectContaining({
          retryCount: 3,
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete item from queue', async () => {
      await offlineQueue.remove('delete-test');
      expect(db.offlineQueue.delete).toHaveBeenCalledWith('delete-test');
    });
  });
});
