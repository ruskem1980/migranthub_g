'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useAppStore } from '@/lib/stores';
import { legalApi } from '@/lib/api/client';
import { db, type DBLegalDataMeta } from '@/lib/db';
import { emitLegalDataUpdated, hasNewerData } from '@/lib/events/legalDataEvents';

const LEGAL_METADATA_ID = 'legal-metadata';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface LegalMetadata {
  /** Date when the legal data was last updated on the server */
  lastUpdatedAt: string | null;
  /** Date when the client last fetched the data */
  lastSyncAt: string | null;
  /** Whether the cache is valid */
  isCacheValid: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether new updates are available (detected newer lastUpdatedAt) */
  hasNewUpdates: boolean;
}

interface CachedLegalMetadata extends DBLegalDataMeta {
  lastUpdatedAt: string;
  source?: string;
  version?: string;
}

/**
 * Hook for loading and caching legal metadata from API
 * - Caches in Dexie (legalDataMeta table)
 * - Loads on mount and refreshes every 24 hours
 * - Stores lastUpdatedAt (server data date) and cachedAt (when client fetched)
 */
export function useLegalMetadata(): LegalMetadata & {
  refresh: () => Promise<void>;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const initRef = useRef(false);
  const previousDateRef = useRef<string | null>(null);

  // Use stable selectors - each value separately to prevent re-renders
  const legalDataUpdatedAt = useAppStore((state) => state.legalDataUpdatedAt);
  const lastSyncAt = useAppStore((state) => state.lastSyncAt);
  const setLegalMetadata = useAppStore((state) => state.setLegalMetadata);

  const isCacheValid = useCallback(() => {
    if (!lastSyncAt) return false;
    const cachedTime = new Date(lastSyncAt).getTime();
    const now = Date.now();
    return now - cachedTime < CACHE_TTL_MS;
  }, [lastSyncAt]);

  const loadFromCache = useCallback(async (): Promise<CachedLegalMetadata | null> => {
    try {
      const cached = await db.legalDataMeta.get(LEGAL_METADATA_ID) as CachedLegalMetadata | undefined;
      if (cached && cached.lastUpdatedAt) {
        return cached;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: { lastUpdatedAt: string; source?: string; version?: string }): Promise<void> => {
    const cachedAt = new Date().toISOString();
    try {
      await db.legalDataMeta.put({
        id: LEGAL_METADATA_ID,
        updatedAt: data.lastUpdatedAt,
        cachedAt,
        ...data,
      } as CachedLegalMetadata);
    } catch (err) {
      console.error('Failed to save legal metadata to cache:', err);
    }
  }, []);

  const fetchFromApi = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const metadata = await legalApi.getMetadata();
      const syncAt = new Date().toISOString();
      const newDate = metadata.lastUpdatedAt;

      // Check if data has been updated on server
      const isNewer = hasNewerData(previousDateRef.current, newDate);

      // Save to cache
      await saveToCache({
        lastUpdatedAt: newDate,
        source: metadata.source,
        version: metadata.version,
      });

      // Emit event if data was updated
      if (isNewer && previousDateRef.current !== null) {
        setHasNewUpdates(true);
        emitLegalDataUpdated(newDate, previousDateRef.current);
        // Reset flag after a short delay
        setTimeout(() => setHasNewUpdates(false), 3000);
      }

      // Update previous date ref
      previousDateRef.current = newDate;

      // Update store
      setLegalMetadata(newDate, syncAt);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch legal metadata';
      setError(message);
      console.error('Failed to fetch legal metadata:', err);
    } finally {
      setIsLoading(false);
    }
  }, [saveToCache, setLegalMetadata]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchFromApi();
  }, [fetchFromApi]);

  // Load on mount - only once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      // First try to load from cache
      const cached = await loadFromCache();

      if (cached) {
        // Update store with cached data
        setLegalMetadata(cached.lastUpdatedAt, cached.cachedAt);
        // Initialize previous date ref
        previousDateRef.current = cached.lastUpdatedAt;

        // Check if cache is still valid
        const cachedTime = new Date(cached.cachedAt).getTime();
        const now = Date.now();
        const needsRefresh = now - cachedTime >= CACHE_TTL_MS;

        if (needsRefresh && navigator.onLine) {
          // Refresh in background
          fetchFromApi();
        }
      } else if (navigator.onLine) {
        // No cache, fetch from API
        fetchFromApi();
      }
    };

    init();
  }, [loadFromCache, setLegalMetadata, fetchFromApi]);

  // Set up periodic refresh
  useEffect(() => {
    if (!navigator.onLine) return;

    const interval = setInterval(() => {
      if (navigator.onLine && !isCacheValid()) {
        fetchFromApi();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [fetchFromApi, isCacheValid]);

  // Refresh when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (!isCacheValid()) {
        fetchFromApi();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchFromApi, isCacheValid]);

  return {
    lastUpdatedAt: legalDataUpdatedAt,
    lastSyncAt,
    isCacheValid: isCacheValid(),
    isLoading,
    error,
    hasNewUpdates,
    refresh,
  };
}
