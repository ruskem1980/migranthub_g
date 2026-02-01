'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { legalApi } from '@/lib/api/client';

const LAST_VIEWED_KEY = 'migranthub_legal_reports_last_viewed';

export type ChangeUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface LegalChange {
  lawId: string;
  title: string;
  changePercentage: number;
  urgency: ChangeUrgency;
  summary: string;
  recommendations: string[];
}

export interface DailyReport {
  id: string;
  date: string;
  changesCount: number;
  changes: LegalChange[];
  generatedAt: string;
}

interface UseLegalReportsResult {
  /** Latest report */
  latestReport: DailyReport | null;
  /** List of reports */
  reports: DailyReport[];
  /** Whether there are new unread changes */
  hasNewChanges: boolean;
  /** Number of new changes since last view */
  newChangesCount: number;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch latest report */
  fetchLatestReport: () => Promise<void>;
  /** Fetch list of reports */
  fetchReports: (limit?: number) => Promise<void>;
  /** Mark changes as read */
  markAsRead: () => void;
  /** Refresh all data */
  refresh: () => Promise<void>;
}

/**
 * Hook for loading and managing legal change reports
 * - Fetches reports from legal-core API
 * - Tracks last viewed date in localStorage
 * - Provides hasNewChanges indicator
 */
export function useLegalReports(): UseLegalReportsResult {
  const [latestReport, setLatestReport] = useState<DailyReport | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastViewedDate, setLastViewedDate] = useState<string | null>(null);
  const initRef = useRef(false);

  // Load last viewed date from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_VIEWED_KEY);
      if (stored) {
        setLastViewedDate(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Calculate if there are new changes
  const hasNewChanges = useCallback((): boolean => {
    if (!latestReport) return false;
    if (!lastViewedDate) return latestReport.changesCount > 0;

    const reportDate = new Date(latestReport.generatedAt);
    const viewedDate = new Date(lastViewedDate);
    return reportDate > viewedDate && latestReport.changesCount > 0;
  }, [latestReport, lastViewedDate]);

  // Calculate new changes count
  const newChangesCount = useCallback((): number => {
    if (!latestReport) return 0;
    if (!lastViewedDate) return latestReport.changesCount;

    const reportDate = new Date(latestReport.generatedAt);
    const viewedDate = new Date(lastViewedDate);
    if (reportDate <= viewedDate) return 0;

    return latestReport.changesCount;
  }, [latestReport, lastViewedDate]);

  // Fetch latest report
  const fetchLatestReport = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await legalApi.getLatestReport();
      setLatestReport(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch latest report';
      setError(message);
      console.error('Failed to fetch latest legal report:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch list of reports
  const fetchReports = useCallback(async (limit = 10): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await legalApi.getReports(limit);
      setReports(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(message);
      console.error('Failed to fetch legal reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback((): void => {
    const now = new Date().toISOString();
    setLastViewedDate(now);
    try {
      localStorage.setItem(LAST_VIEWED_KEY, now);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([fetchLatestReport(), fetchReports()]);
  }, [fetchLatestReport, fetchReports]);

  // Load on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (navigator.onLine) {
      fetchLatestReport();
    }
  }, [fetchLatestReport]);

  return {
    latestReport,
    reports,
    hasNewChanges: hasNewChanges(),
    newChangesCount: newChangesCount(),
    isLoading,
    error,
    fetchLatestReport,
    fetchReports,
    markAsRead,
    refresh,
  };
}
