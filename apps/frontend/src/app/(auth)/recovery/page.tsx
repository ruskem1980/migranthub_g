'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Key, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const CODE_LENGTH = 12;
const SEGMENT_LENGTH = 4;

export default function RecoveryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [code, setCode] = useState<string[]>(Array(3).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { recoverAccess } = useAuthStore();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric characters, convert to uppercase
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, SEGMENT_LENGTH);

    const newCode = [...code];
    newCode[index] = cleanValue;
    setCode(newCode);
    setError('');

    // Auto-focus next input when segment is complete
    if (cleanValue.length === SEGMENT_LENGTH && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle tab navigation
    if (e.key === 'Tab' && !e.shiftKey && code[index].length === SEGMENT_LENGTH && index < 2) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Split into segments of 4
    const segments: string[] = [];
    for (let i = 0; i < Math.min(pastedData.length, CODE_LENGTH); i += SEGMENT_LENGTH) {
      segments.push(pastedData.slice(i, i + SEGMENT_LENGTH));
    }

    const newCode = [...code];
    segments.forEach((segment, i) => {
      if (i < 3) {
        newCode[i] = segment;
      }
    });
    setCode(newCode);

    // Focus last filled segment or first empty one
    const lastFilledIndex = Math.min(segments.length - 1, 2);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const getFullCode = () => code.join('');

  const isCodeComplete = () => getFullCode().length === CODE_LENGTH;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const fullCode = getFullCode();
    if (fullCode.length !== CODE_LENGTH) {
      setError(t('recovery.error.incomplete'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await recoverAccess(fullCode);
      router.push('/prototype');
    } catch (err) {
      console.error('Recovery error:', err);
      setError(t('recovery.error.invalid'));
      // Clear code on error
      setCode(Array(3).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('recovery.backToLogin')}
        </button>
        <LanguageSwitcher variant="compact" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 px-6 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('recovery.title')}
            </h2>
            <p className="text-gray-500">
              {t('recovery.subtitle')}
            </p>
          </div>

          {/* Recovery Code Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {code.map((segment, index) => (
                <div key={index} className="flex items-center">
                  <input
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="text"
                    maxLength={SEGMENT_LENGTH}
                    value={segment}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    placeholder="XXXX"
                    className={`w-20 h-14 text-center text-lg font-mono font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase ${
                      error ? 'border-red-300 bg-red-50' : segment ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  />
                  {index < 2 && (
                    <span className="mx-1 text-gray-400 font-bold">-</span>
                  )}
                </div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isCodeComplete() || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isCodeComplete() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                t('recovery.submit')
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-8 p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              {t('recovery.helpText')}
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              <strong>{t('auth.demo.title')}:</strong> {t('recovery.demo.hint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
