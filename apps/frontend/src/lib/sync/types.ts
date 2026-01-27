/**
 * Типы для Offline Queue и Background Sync
 */

/** HTTP методы, которые ставятся в очередь при offline */
export type QueueableMethod = 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Статус элемента в очереди */
export type QueueItemStatus = 'pending' | 'processing' | 'failed' | 'completed';

/** Элемент очереди для синхронизации */
export interface OfflineQueueItem {
  id: string;
  /** Название действия для отображения пользователю */
  action: string;
  /** API endpoint */
  endpoint: string;
  /** HTTP метод */
  method: QueueableMethod;
  /** Тело запроса (JSON) */
  body?: string;
  /** Дата создания */
  createdAt: string;
  /** Количество попыток отправки */
  retryCount: number;
  /** Текущий статус */
  status: QueueItemStatus;
  /** Последняя ошибка */
  lastError?: string;
  /** Дата последней попытки */
  lastAttemptAt?: string;
}

/** Параметры для добавления в очередь */
export interface EnqueueParams {
  action: string;
  endpoint: string;
  method: QueueableMethod;
  body?: unknown;
}

/** Результат синхронизации одного элемента */
export interface SyncResult {
  success: boolean;
  item: OfflineQueueItem;
  error?: string;
  response?: unknown;
}

/** Общий результат синхронизации очереди */
export interface QueueSyncResult {
  processed: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

/** Конфигурация Background Sync */
export interface BackgroundSyncConfig {
  /** Максимальное количество попыток */
  maxRetries: number;
  /** Базовая задержка для exponential backoff (мс) */
  baseDelay: number;
  /** Максимальная задержка (мс) */
  maxDelay: number;
  /** Таймаут запроса (мс) */
  requestTimeout: number;
}

/** Состояние синхронизации */
export interface SyncState {
  /** Количество ожидающих элементов */
  pendingCount: number;
  /** Идёт синхронизация */
  isSyncing: boolean;
  /** Время последней успешной синхронизации */
  lastSyncAt: Date | null;
  /** Последняя ошибка синхронизации */
  lastError: string | null;
}

/** Conflict resolution стратегия */
export type ConflictResolution = 'last-write-wins' | 'server-wins' | 'client-wins';
