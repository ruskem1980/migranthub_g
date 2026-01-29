'use client';

import { useState, useEffect } from 'react';
import { Cloud, Shield, Calendar, HardDrive, RefreshCw, Trash2, Download } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBackupStore, type BackupInfo } from '@/lib/stores/backupStore';
import { CreateBackupModal } from '@/components/modals/CreateBackupModal';
import { RestoreBackupModal } from '@/components/modals/RestoreBackupModal';
import { DeleteBackupConfirm } from '@/components/modals/DeleteBackupConfirm';

function formatDate(dateString: string, language: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CloudSafeSection() {
  const { t, language } = useTranslation();
  const { backups, lastBackupAt, isLoading, fetchBackups, progress } = useBackupStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);

  // Fetch backups on mount
  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleRestore = (backupId: string) => {
    setSelectedBackupId(backupId);
    setShowRestoreModal(true);
  };

  const handleDelete = (backupId: string) => {
    setSelectedBackupId(backupId);
    setShowDeleteConfirm(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchBackups();
  };

  const handleRestoreSuccess = () => {
    setShowRestoreModal(false);
    setSelectedBackupId(null);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteConfirm(false);
    setSelectedBackupId(null);
    fetchBackups();
  };

  return (
    <div className="pt-4 border-t-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-gray-900">{t('cloudSafe.title')}</h4>
        </div>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" />
          AES-256
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">{t('cloudSafe.subtitle')}</p>

      {/* Status */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
        {lastBackupAt ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {t('cloudSafe.lastBackup', { date: formatDate(lastBackupAt, language) })}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{t('cloudSafe.notConfigured')}</span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {progress !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {progress < 100 ? t('cloudSafe.creating') : t('cloudSafe.success')}
            </span>
            <span className="text-xs font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Backup List */}
      {backups.length > 0 && (
        <div className="space-y-2 mb-4">
          {backups.map((backup: BackupInfo) => (
            <div
              key={backup.id}
              className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {t('cloudSafe.backupDate', { date: formatDate(backup.createdAt, language) })}
                  </span>
                </div>
                <span className="text-xs text-gray-500 ml-6">
                  {t('cloudSafe.backupSize', { size: formatSize(backup.sizeBytes) })}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <button
                  onClick={() => handleRestore(backup.id)}
                  disabled={isLoading}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  title={t('cloudSafe.restore')}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(backup.id)}
                  disabled={isLoading}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  title={t('cloudSafe.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No backups message */}
      {backups.length === 0 && !isLoading && (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center mb-4">
          <Cloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{t('cloudSafe.noBackups')}</p>
        </div>
      )}

      {/* Create Backup Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Cloud className="w-5 h-5" />
        )}
        {t('cloudSafe.createBackup')}
      </button>

      {/* Modals */}
      {showCreateModal && (
        <CreateBackupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showRestoreModal && (
        <RestoreBackupModal
          isOpen={showRestoreModal}
          onClose={() => {
            setShowRestoreModal(false);
            setSelectedBackupId(null);
          }}
          backupId={selectedBackupId || undefined}
          onSuccess={handleRestoreSuccess}
        />
      )}

      {showDeleteConfirm && selectedBackupId && (
        <DeleteBackupConfirm
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedBackupId(null);
          }}
          backupId={selectedBackupId}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

export default CloudSafeSection;
