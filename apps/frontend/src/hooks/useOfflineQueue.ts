'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineQueue } from '../lib/sync/offlineQueue';
import { backgroundSync } from '../lib/sync/backgroundSync';
import type { QueueSyncResult, SyncState } from '../lib/sync/types';

export interface UseOfflineQueueReturn extends SyncState {
  sync: () => Promise<QueueSyncResult>;
  clearQueue: () => Promise<void>;
  resetFailed: () => Promise<number>;
  refresh: () => Promise<void>;
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const count = await offlineQueue.getPendingAndFailedCount();
      if (isMounted.current) {
        setPendingCount(count);
        setIsSyncing(backgroundSync.getIsSyncing());
        setLastSyncAt(backgroundSync.getLastSyncAt());
      }
    } catch (error) {
      console.error('Failed to refresh offline queue state:', error);
    }
  }, []);

  const sync = useCallback(async (): Promise<QueueSyncResult> => {
    if (!isMounted.current) {
      return { processed: 0, successful: 0, failed: 0, results: [] };
    }

    setIsSyncing(true);
    setLastError(null);

    try {
      const result = await backgroundSync.processQueue();

      if (isMounted.current) {
        setLastSyncAt(new Date());

        if (result.failed > 0) {
          setLastError(`${result.failed} операций не удалось синхронизировать`);
        }

        await refresh();
      }

      return result;
    } catch (error) {
      if (isMounted.current) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка синхронизации';
        setLastError(errorMessage);
      }

      return { processed: 0, successful: 0, failed: 0, results: [] };
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  }, [refresh]);

  const clearQueue = useCallback(async () => {
    await offlineQueue.clear();
    await refresh();
  }, [refresh]);

  const resetFailed = useCallback(async () => {
    const count = await offlineQueue.resetFailed();
    await refresh();
    return count;
  }, [refresh]);

  // Инициализация и подписка на изменения
  useEffect(() => {
    isMounted.current = true;
    refresh();

    // Подписка на изменения состояния синхронизации
    const unsubscribe = backgroundSync.subscribe(() => {
      if (isMounted.current) {
        setIsSyncing(backgroundSync.getIsSyncing());
        setLastSyncAt(backgroundSync.getLastSyncAt());
        refresh();
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [refresh]);

  // Автоматическая синхронизация при переходе в online
  useEffect(() => {
    const handleOnline = () => {
      if (isMounted.current && pendingCount > 0) {
        sync();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [pendingCount, sync]);

  // Периодическое обновление счётчика
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    pendingCount,
    isSyncing,
    lastSyncAt,
    lastError,
    sync,
    clearQueue,
    resetFailed,
    refresh,
  };
}
