'use client';

import { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, ChevronUp, ChevronDown, Database, Clock, Bell } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { useLegalMetadata } from '@/features/legal/hooks/useLegalMetadata';
import { useLegalReports } from '@/features/legal/hooks/useLegalReports';
import { useTranslation } from '@/lib/i18n';
import { LegalUpdatesModal } from '@/components/legal/LegalUpdatesModal';

/**
 * Format date for display as DD/MM/YYYY
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * SyncStatusBar - Compact status bar showing connection and sync status
 *
 * Displays:
 * - Online/offline status with colored indicator
 * - Legal data currency date (from API metadata.lastUpdatedAt)
 * - Last sync date (when client last fetched data)
 * - New legal changes indicator (red dot)
 *
 * Expandable to show more details
 */
export function SyncStatusBar() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const { lastUpdatedAt, lastSyncAt, isLoading, hasNewUpdates, refresh } = useLegalMetadata();
  const { latestReport, hasNewChanges, newChangesCount, markAsRead } = useLegalReports();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = async () => {
    if (isOnline && !isLoading) {
      await refresh();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChangesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNewChanges) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMarkAsRead = () => {
    markAsRead();
  };

  // Main status text: "Онлайн на 01/02/2026" or "Оффлайн на 31/01/2026"
  const getStatusText = (): string => {
    // Show updating status when new data is being fetched
    if (hasNewUpdates) {
      return t('sync.dataUpdating');
    }

    const status = isOnline ? t('sync.online') : t('sync.offline');
    const date = lastUpdatedAt ? formatDate(lastUpdatedAt) : (lastSyncAt ? formatDate(lastSyncAt) : null);

    if (date) {
      // Add new changes info if available
      if (hasNewChanges && newChangesCount > 0) {
        return `${status} • ${t('legalUpdates.newChanges', { count: newChangesCount })}`;
      }
      return `${status} ${t('sync.asOf')} ${date}`;
    }

    return `${status} • ${t('sync.neverSynced')}`;
  };

  return (
    <>
      <div className="bg-white border-t border-gray-200 shadow-sm">
        {/* Collapsed view */}
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between px-4 py-2 text-sm"
          aria-expanded={isExpanded}
          aria-label={t('sync.statusBarLabel')}
        >
          <div className="flex items-center gap-2">
            {/* Online/Offline indicator */}
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" aria-hidden="true" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" aria-hidden="true" />
              )}
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                aria-hidden="true"
              />
            </div>

            {/* Status text */}
            <span className={`truncate max-w-[200px] ${hasNewChanges ? 'text-primary font-medium' : 'text-gray-600'}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* New changes indicator */}
            {hasNewChanges && (
              <button
                onClick={handleChangesClick}
                className="relative flex items-center justify-center p-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                aria-label={t('legalUpdates.newChanges', { count: newChangesCount })}
              >
                <Bell className="w-4 h-4 text-red-500" aria-hidden="true" />
                {/* Red dot badge */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              </button>
            )}

            {/* Loading indicator or expand icon */}
            {isLoading ? (
              <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" aria-hidden="true" />
            ) : (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
              )
            )}
          </div>
        </button>

        {/* Expanded view with details */}
        {isExpanded && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-100 bg-gray-50">
            <div className="space-y-2">
              {/* Connection status */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span>{t('sync.connectionStatus')}</span>
                </div>
                <span className={isOnline ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {isOnline ? t('sync.online') : t('sync.offline')}
                </span>
              </div>

              {/* Data currency */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span>{t('sync.dataActuality')}</span>
                </div>
                <span className="text-gray-800">
                  {lastUpdatedAt ? formatDate(lastUpdatedAt) : t('sync.neverSynced')}
                </span>
              </div>

              {/* Last sync */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{t('sync.lastSyncLabel')}</span>
                </div>
                <span className="text-gray-800">
                  {lastSyncAt ? formatDate(lastSyncAt) : t('sync.neverSynced')}
                </span>
              </div>

              {/* Legal changes indicator */}
              {hasNewChanges && (
                <button
                  onClick={handleChangesClick}
                  className="w-full flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg text-sm hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2 text-red-700">
                    <Bell className="w-4 h-4" />
                    <span>{t('legalUpdates.newChanges', { count: newChangesCount })}</span>
                  </div>
                  <span className="text-red-600 font-medium">{t('common.show')}</span>
                </button>
              )}

              {/* Refresh button */}
              {isOnline && (
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? t('sync.syncing') : t('sync.syncNow')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legal Updates Modal */}
      <LegalUpdatesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        report={latestReport}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}

export default SyncStatusBar;
