'use client';

import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Download, AlertTriangle, Loader2, Check, ChevronDown, Calendar, HardDrive } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBackupStore, type BackupInfo } from '@/lib/stores/backupStore';

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupId?: string;
  onSuccess?: () => void;
}

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

export function RestoreBackupModal({ isOpen, onClose, backupId, onSuccess }: RestoreBackupModalProps) {
  const { t, language } = useTranslation();
  const { backups, restoreBackup, isLoading, progress, error, clearError } = useBackupStore();

  const [selectedBackupId, setSelectedBackupId] = useState<string>(backupId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [step, setStep] = useState<'form' | 'restoring' | 'success' | 'error'>('form');

  const selectedBackup = useMemo(() => {
    return backups.find((b: BackupInfo) => b.id === selectedBackupId);
  }, [backups, selectedBackupId]);

  const isFormValid = selectedBackupId && password.length >= 8;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setStep('restoring');
      clearError();
      await restoreBackup(selectedBackupId, password);
      setStep('success');
    } catch {
      setStep('error');
    }
  };

  const handleClose = () => {
    setPassword('');
    setStep('form');
    clearError();
    onClose();
    if (step === 'success' && onSuccess) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('cloudSafe.restore')}</h2>
              <p className="text-xs text-blue-100">{t('cloudSafe.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {/* Form Step */}
          {step === 'form' && (
            <div className="space-y-5">
              {/* Backup Selector (only if no backupId provided) */}
              {!backupId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('cloudSafe.selectBackup')}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <span className={selectedBackup ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedBackup
                          ? t('cloudSafe.backupDate', { date: formatDate(selectedBackup.createdAt, language) })
                          : t('cloudSafe.selectBackup')}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                      <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          {backups.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                              {t('cloudSafe.noBackups')}
                            </div>
                          ) : (
                            backups.map((backup: BackupInfo) => (
                              <button
                                key={backup.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBackupId(backup.id);
                                  setShowDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${
                                  selectedBackupId === backup.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <HardDrive className="w-5 h-5 text-gray-400" />
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatDate(backup.createdAt, language)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatSize(backup.size)}
                                    </p>
                                  </div>
                                </div>
                                {selectedBackupId === backup.id && (
                                  <Check className="w-5 h-5 text-blue-600" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Backup Info */}
              {selectedBackup && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">
                      {t('cloudSafe.backupDate', { date: formatDate(selectedBackup.createdAt, language) })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      {t('cloudSafe.backupSize', { size: formatSize(selectedBackup.size) })}
                    </span>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('cloudSafe.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      {t('cloudSafe.warningReplace')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`w-full font-bold py-4 rounded-xl transition-all ${
                  isFormValid && !isLoading
                    ? 'bg-red-500 text-white hover:bg-red-600 active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('cloudSafe.restore')}
              </button>
            </div>
          )}

          {/* Restoring Step */}
          {step === 'restoring' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium mb-4">{t('cloudSafe.restoring')}</p>

              {progress !== null && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('cloudSafe.restoring')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cloudSafe.successRestore')}</h3>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cloudSafe.error')}</h3>
              {error && (
                <p className="text-red-600 text-center mb-4">{error}</p>
              )}
              <button
                onClick={() => setStep('form')}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                {t('common.tryAgain') || 'Try again'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestoreBackupModal;
