/**
 * Offline Sync Module
 *
 * Модуль для работы с offline очередью и фоновой синхронизацией
 */

export { offlineQueue } from './offlineQueue';
export { backgroundSync } from './backgroundSync';
export type {
  QueueableMethod,
  QueueItemStatus,
  OfflineQueueItem,
  EnqueueParams,
  SyncResult,
  QueueSyncResult,
  BackgroundSyncConfig,
  SyncState,
  ConflictResolution,
} from './types';
