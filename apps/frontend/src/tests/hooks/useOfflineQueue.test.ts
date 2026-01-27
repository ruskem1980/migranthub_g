import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { offlineQueue } from '@/lib/sync/offlineQueue';
import { backgroundSync } from '@/lib/sync/backgroundSync';

// Mock offlineQueue module
jest.mock('@/lib/sync/offlineQueue', () => ({
  offlineQueue: {
    getPendingAndFailedCount: jest.fn().mockResolvedValue(0),
    clear: jest.fn().mockResolvedValue(undefined),
    resetFailed: jest.fn().mockResolvedValue(0),
  },
}));

// Mock backgroundSync module
jest.mock('@/lib/sync/backgroundSync', () => ({
  backgroundSync: {
    getIsSyncing: jest.fn().mockReturnValue(false),
    getLastSyncAt: jest.fn().mockReturnValue(null),
    processQueue: jest.fn().mockResolvedValue({
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
    }),
    subscribe: jest.fn().mockReturnValue(() => {}),
  },
}));

describe('useOfflineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset mocks to default values
    (offlineQueue.getPendingAndFailedCount as jest.Mock).mockResolvedValue(0);
    (backgroundSync.getIsSyncing as jest.Mock).mockReturnValue(false);
    (backgroundSync.getLastSyncAt as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial state', async () => {
    const { result } = renderHook(() => useOfflineQueue());

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.lastSyncAt).toBe(null);
      expect(result.current.lastError).toBe(null);
    });
  });

  it('provides sync function', () => {
    const { result } = renderHook(() => useOfflineQueue());

    expect(typeof result.current.sync).toBe('function');
  });

  it('provides clearQueue function', () => {
    const { result } = renderHook(() => useOfflineQueue());

    expect(typeof result.current.clearQueue).toBe('function');
  });

  it('provides resetFailed function', () => {
    const { result } = renderHook(() => useOfflineQueue());

    expect(typeof result.current.resetFailed).toBe('function');
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => useOfflineQueue());

    expect(typeof result.current.refresh).toBe('function');
  });

  it('calls refresh on mount', async () => {
    renderHook(() => useOfflineQueue());

    await waitFor(() => {
      expect(offlineQueue.getPendingAndFailedCount).toHaveBeenCalled();
    });
  });

  it('subscribes to backgroundSync changes', () => {
    renderHook(() => useOfflineQueue());

    expect(backgroundSync.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = jest.fn();
    (backgroundSync.subscribe as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useOfflineQueue());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('updates pendingCount from offlineQueue', async () => {
    (offlineQueue.getPendingAndFailedCount as jest.Mock).mockResolvedValue(5);

    const { result } = renderHook(() => useOfflineQueue());

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(5);
    });
  });

  it('sync triggers processQueue', async () => {
    (backgroundSync.processQueue as jest.Mock).mockResolvedValue({
      processed: 2,
      successful: 2,
      failed: 0,
      results: [],
    });

    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.sync();
    });

    expect(backgroundSync.processQueue).toHaveBeenCalled();
  });

  it('sync sets isSyncing during operation', async () => {
    let resolveSync: () => void;
    (backgroundSync.processQueue as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSync = () =>
            resolve({ processed: 0, successful: 0, failed: 0, results: [] });
        })
    );

    const { result } = renderHook(() => useOfflineQueue());

    let syncPromise: Promise<any>;
    act(() => {
      syncPromise = result.current.sync();
    });

    // Should be syncing
    expect(result.current.isSyncing).toBe(true);

    await act(async () => {
      resolveSync!();
      await syncPromise;
    });

    // Should no longer be syncing
    expect(result.current.isSyncing).toBe(false);
  });

  it('sync sets lastError on failure', async () => {
    (backgroundSync.processQueue as jest.Mock).mockResolvedValue({
      processed: 2,
      successful: 1,
      failed: 1,
      results: [],
    });

    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.sync();
    });

    expect(result.current.lastError).toContain('1');
  });

  it('sync handles exceptions', async () => {
    (backgroundSync.processQueue as jest.Mock).mockRejectedValue(
      new Error('Sync failed')
    );

    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.sync();
    });

    expect(result.current.lastError).toBe('Sync failed');
    expect(result.current.isSyncing).toBe(false);
  });

  it('clearQueue calls offlineQueue.clear', async () => {
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(offlineQueue.clear).toHaveBeenCalled();
  });

  it('clearQueue refreshes state after clearing', async () => {
    const { result } = renderHook(() => useOfflineQueue());

    (offlineQueue.getPendingAndFailedCount as jest.Mock).mockClear();

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(offlineQueue.getPendingAndFailedCount).toHaveBeenCalled();
  });

  it('resetFailed calls offlineQueue.resetFailed', async () => {
    (offlineQueue.resetFailed as jest.Mock).mockResolvedValue(3);

    const { result } = renderHook(() => useOfflineQueue());

    let resetCount: number;
    await act(async () => {
      resetCount = await result.current.resetFailed();
    });

    expect(offlineQueue.resetFailed).toHaveBeenCalled();
    expect(resetCount!).toBe(3);
  });

  it('refresh updates state from offlineQueue and backgroundSync', async () => {
    (offlineQueue.getPendingAndFailedCount as jest.Mock).mockResolvedValue(10);
    (backgroundSync.getIsSyncing as jest.Mock).mockReturnValue(true);
    (backgroundSync.getLastSyncAt as jest.Mock).mockReturnValue(
      new Date('2024-01-01')
    );

    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(10);
      expect(result.current.isSyncing).toBe(true);
    });
  });

  it('sets up periodic refresh interval', async () => {
    renderHook(() => useOfflineQueue());

    (offlineQueue.getPendingAndFailedCount as jest.Mock).mockClear();

    // Advance timers by 5 seconds (the interval)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(offlineQueue.getPendingAndFailedCount).toHaveBeenCalled();
    });
  });

  it('clears periodic refresh on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useOfflineQueue());
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('adds online event listener', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useOfflineQueue());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it('removes online event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineQueue());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
