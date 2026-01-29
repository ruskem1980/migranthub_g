'use client';

import { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBackupStore } from '@/lib/stores/backupStore';

interface DeleteBackupConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  backupId: string;
  onSuccess?: () => void;
}

export function DeleteBackupConfirm({ isOpen, onClose, backupId, onSuccess }: DeleteBackupConfirmProps) {
  const { t } = useTranslation();
  const { deleteBackup, isLoading, error, clearError } = useBackupStore();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      clearError();
      await deleteBackup(backupId);
      setDeleting(false);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Icon */}
        <div className="flex justify-center pt-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('cloudSafe.delete')}</h3>
          <p className="text-gray-600 text-sm mb-4">{t('cloudSafe.deleteConfirm')}</p>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-800 font-medium">
                {t('cloudSafe.warningLostPassword')}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleClose}
            disabled={deleting || isLoading}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || isLoading}
            className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting || isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                {t('cloudSafe.delete')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBackupConfirm;
