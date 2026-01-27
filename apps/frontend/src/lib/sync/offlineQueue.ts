/**
 * Offline Queue - управление очередью операций для синхронизации
 */

import { db, type DBOfflineQueueItem } from '../db';
import type { EnqueueParams, OfflineQueueItem, QueueItemStatus } from './types';

class OfflineQueue {
  /**
   * Добавить операцию в очередь
   */
  async enqueue(params: EnqueueParams): Promise<string> {
    const id = crypto.randomUUID();
    const item: DBOfflineQueueItem = {
      id,
      action: params.action,
      endpoint: params.endpoint,
      method: params.method,
      body: params.body ? JSON.stringify(params.body) : undefined,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };

    await db.offlineQueue.add(item);
    return id;
  }

  /**
   * Получить и удалить следующий элемент из очереди (FIFO)
   */
  async dequeue(): Promise<OfflineQueueItem | undefined> {
    const item = await db.offlineQueue
      .where('status')
      .equals('pending')
      .sortBy('createdAt')
      .then((items) => items[0]);

    if (item) {
      await db.offlineQueue.delete(item.id);
    }

    return item;
  }

  /**
   * Посмотреть следующий элемент без удаления
   */
  async peek(): Promise<OfflineQueueItem | undefined> {
    return db.offlineQueue
      .where('status')
      .equals('pending')
      .sortBy('createdAt')
      .then((items) => items[0]);
  }

  /**
   * Получить все pending элементы
   */
  async getAll(): Promise<OfflineQueueItem[]> {
    return db.offlineQueue.where('status').equals('pending').sortBy('createdAt');
  }

  /**
   * Получить все элементы включая failed
   */
  async getAllIncludingFailed(): Promise<OfflineQueueItem[]> {
    return db.offlineQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .sortBy('createdAt');
  }

  /**
   * Очистить всю очередь
   */
  async clear(): Promise<void> {
    await db.offlineQueue.clear();
  }

  /**
   * Очистить только завершённые
   */
  async clearCompleted(): Promise<void> {
    await db.offlineQueue.where('status').equals('completed').delete();
  }

  /**
   * Получить количество pending элементов
   */
  async getCount(): Promise<number> {
    return db.offlineQueue.where('status').equals('pending').count();
  }

  /**
   * Получить количество всех незавершённых (pending + failed)
   */
  async getPendingAndFailedCount(): Promise<number> {
    return db.offlineQueue.where('status').anyOf(['pending', 'failed']).count();
  }

  /**
   * Получить элемент по ID
   */
  async getById(id: string): Promise<OfflineQueueItem | undefined> {
    return db.offlineQueue.get(id);
  }

  /**
   * Обновить статус элемента
   */
  async updateStatus(
    id: string,
    status: QueueItemStatus,
    error?: string
  ): Promise<void> {
    const updates: Partial<DBOfflineQueueItem> = {
      status,
      lastAttemptAt: new Date().toISOString(),
    };

    if (error) {
      updates.lastError = error;
    }

    await db.offlineQueue.update(id, updates);
  }

  /**
   * Увеличить счётчик попыток
   */
  async incrementRetryCount(id: string): Promise<void> {
    const item = await db.offlineQueue.get(id);
    if (item) {
      await db.offlineQueue.update(id, {
        retryCount: item.retryCount + 1,
        lastAttemptAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Сбросить failed элементы обратно в pending для повторной попытки
   */
  async resetFailed(): Promise<number> {
    const failedItems = await db.offlineQueue
      .where('status')
      .equals('failed')
      .toArray();

    for (const item of failedItems) {
      await db.offlineQueue.update(item.id, {
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
      });
    }

    return failedItems.length;
  }

  /**
   * Удалить элемент из очереди
   */
  async remove(id: string): Promise<void> {
    await db.offlineQueue.delete(id);
  }

  /**
   * Пометить элемент как processing
   */
  async markAsProcessing(id: string): Promise<void> {
    await this.updateStatus(id, 'processing');
  }

  /**
   * Пометить элемент как completed и удалить
   */
  async markAsCompleted(id: string): Promise<void> {
    await db.offlineQueue.delete(id);
  }

  /**
   * Пометить элемент как failed
   */
  async markAsFailed(id: string, error: string): Promise<void> {
    await this.incrementRetryCount(id);
    await this.updateStatus(id, 'failed', error);
  }
}

export const offlineQueue = new OfflineQueue();
