'use client';

import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Shield, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useBackupStore } from '@/lib/stores/backupStore';

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

function PasswordStrengthIndicator({ strength }: { strength: PasswordStrength }) {
  const colors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const widths = {
    weak: 'w-1/3',
    medium: 'w-2/3',
    strong: 'w-full',
  };

  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[strength]} ${widths[strength]} transition-all duration-300`}
      />
    </div>
  );
}

export function CreateBackupModal({ isOpen, onClose, onSuccess }: CreateBackupModalProps) {
  const { t } = useTranslation();
  const { createBackup, isLoading, progress, recoveryCode, clearRecoveryCode, error, clearError } = useBackupStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToWarning, setAgreedToWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'form' | 'creating' | 'success' | 'error'>('form');

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword;
  const isFormValid = password.length >= 8 && passwordsMatch && agreedToWarning;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setStep('creating');
      clearError();
      await createBackup(password);
      setStep('success');
    } catch {
      setStep('error');
    }
  };

  const handleCopyCode = async () => {
    if (!recoveryCode) return;

    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = recoveryCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setAgreedToWarning(false);
    setCopied(false);
    setStep('form');
    clearRecoveryCode();
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('cloudSafe.createBackup')}</h2>
              <p className="text-xs text-green-100">{t('cloudSafe.encryption')}</p>
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
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <PasswordStrengthIndicator strength={passwordStrength} />
                    <p className="text-xs text-gray-500">
                      {t('cloudSafe.passwordRequirements')}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('cloudSafe.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className={`w-full px-4 py-3 pr-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      confirmPassword.length > 0 && !passwordsMatch
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Mismatch Error */}
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-500">
                    {t('cloudSafe.passwordMismatch')}
                  </p>
                )}
              </div>

              {/* Warning Checkbox */}
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToWarning}
                    onChange={(e) => setAgreedToWarning(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-800">
                        {t('cloudSafe.warningLostPassword')}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`w-full font-bold py-4 rounded-xl transition-all ${
                  isFormValid && !isLoading
                    ? 'bg-green-500 text-white hover:bg-green-600 active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('cloudSafe.createBackup')}
              </button>
            </div>
          )}

          {/* Creating Step */}
          {step === 'creating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium mb-4">{t('cloudSafe.creating')}</p>

              {progress !== null && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('cloudSafe.creating')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && recoveryCode && (
            <div className="space-y-5">
              {/* Success Icon */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cloudSafe.success')}</h3>
              </div>

              {/* Recovery Code */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-800">
                    {t('cloudSafe.recoveryCode')}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('cloudSafe.recoveryCodeCopied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('cloudSafe.copyRecoveryCode')}
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-white border border-blue-200 rounded-lg">
                  <code className="text-lg font-mono text-blue-900 break-all select-all">
                    {recoveryCode}
                  </code>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    {t('cloudSafe.saveRecoveryCode')}
                  </p>
                </div>
              </div>
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

export default CreateBackupModal;
