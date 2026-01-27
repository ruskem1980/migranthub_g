/**
 * Background Sync Service - синхронизация offline очереди
 */

import { tokenStorage } from '../api/storage';
import { offlineQueue } from './offlineQueue';
import type {
  BackgroundSyncConfig,
  OfflineQueueItem,
  QueueSyncResult,
  SyncResult,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const DEFAULT_CONFIG: BackgroundSyncConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  requestTimeout: 30000,
};

class BackgroundSync {
  private config: BackgroundSyncConfig;
  private isSyncing = false;
  private lastSyncAt: Date | null = null;
  private listeners: Set<() => void> = new Set();

  constructor(config: Partial<BackgroundSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Вычислить задержку с exponential backoff
   */
  private calculateDelay(retryCount: number): number {
    const delay = this.config.baseDelay * Math.pow(2, retryCount);
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Ожидание с задержкой
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Получить access token
   */
  private async getAccessToken(): Promise<string | null> {
    return tokenStorage.getAccessToken();
  }

  /**
   * Синхронизация одного элемента очереди
   */
  async syncOne(item: OfflineQueueItem): Promise<SyncResult> {
    const token = await this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.requestTimeout
    );

    try {
      await offlineQueue.markAsProcessing(item.id);

      const response = await fetch(`${API_BASE_URL}${item.endpoint}`, {
        method: item.method,
        headers,
        body: item.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.text();
      const parsedResponse = responseData ? JSON.parse(responseData) : {};

      await offlineQueue.markAsCompleted(item.id);

      return {
        success: true,
        item,
        response: parsedResponse,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Проверяем, превышено ли количество попыток
      if (item.retryCount + 1 >= this.config.maxRetries) {
        await offlineQueue.markAsFailed(item.id, errorMessage);
      } else {
        // Увеличиваем счётчик и оставляем в pending
        await offlineQueue.incrementRetryCount(item.id);
        await offlineQueue.updateStatus(item.id, 'pending', errorMessage);
      }

      return {
        success: false,
        item,
        error: errorMessage,
      };
    }
  }

  /**
   * Обработка всей очереди
   */
  async processQueue(): Promise<QueueSyncResult> {
    if (this.isSyncing) {
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }

    if (!navigator.onLine) {
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }

    this.isSyncing = true;
    this.notifyListeners();

    const results: SyncResult[] = [];
    let processed = 0;
    let successful = 0;
    let failed = 0;

    try {
      const items = await offlineQueue.getAllIncludingFailed();

      for (const item of items) {
        // Пропускаем элементы, которые уже обрабатываются
        if (item.status === 'processing') {
          continue;
        }

        // Если элемент failed и не превысил лимит, применяем delay
        if (item.retryCount > 0) {
          const delay = this.calculateDelay(item.retryCount);
          await this.sleep(delay);
        }

        // Проверяем онлайн статус перед каждым запросом
        if (!navigator.onLine) {
          break;
        }

        const result = await this.syncOne(item);
        results.push(result);
        processed++;

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }

      this.lastSyncAt = new Date();
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return {
      processed,
      successful,
      failed,
      results,
    };
  }

  /**
   * Проверить, идёт ли синхронизация
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Получить время последней синхронизации
   */
  getLastSyncAt(): Date | null {
    return this.lastSyncAt;
  }

  /**
   * Подписаться на изменения состояния синхронизации
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Уведомить всех подписчиков об изменении
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Получить конфигурацию
   */
  getConfig(): BackgroundSyncConfig {
    return { ...this.config };
  }

  /**
   * Обновить конфигурацию
   */
  setConfig(config: Partial<BackgroundSyncConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const backgroundSync = new BackgroundSync();
