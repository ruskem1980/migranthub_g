import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Resets a Zustand store to its initial state for testing
 * Works with stores that have persist middleware
 */
export const resetStore = <T extends object>(
  store: UseBoundStore<StoreApi<T>>,
  initialState: Partial<T>
): void => {
  store.setState(initialState as T, true);
};

/**
 * Gets the current state of a store for assertions
 */
export const getStoreState = <T extends object>(
  store: UseBoundStore<StoreApi<T>>
): T => {
  return store.getState();
};

/**
 * Waits for store state to match a predicate
 * Useful for testing async operations
 */
export const waitForStoreState = <T extends object>(
  store: UseBoundStore<StoreApi<T>>,
  predicate: (state: T) => boolean,
  timeout = 1000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkState = () => {
      if (predicate(store.getState())) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for store state'));
        return;
      }

      setTimeout(checkState, 10);
    };

    checkState();
  });
};

/**
 * Mock localStorage for testing persist middleware
 */
export const createMockLocalStorage = (): Storage => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => Object.keys(store)[index] || null,
  };
};
