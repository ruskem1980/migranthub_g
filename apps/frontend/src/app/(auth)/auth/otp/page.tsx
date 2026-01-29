'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const OTP_LENGTH = 4;
const RESEND_TIMEOUT = 60;

export default function OtpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [phone, setPhone] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Get phone from session storage
    const storedPhone = sessionStorage.getItem('auth_phone');
    if (!storedPhone) {
      router.push('/auth/phone');
      return;
    }
    setPhone(storedPhone);

    // Focus first input
    inputRefs.current[0]?.focus();

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const formatPhone = (digits: string) => {
    if (digits.length !== 11) return digits;
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === OTP_LENGTH - 1) {
      const code = newOtp.join('');
      if (code.length === OTP_LENGTH) {
        handleSubmit(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus appropriate input
    if (pastedData.length >= OTP_LENGTH) {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      handleSubmit(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  // Fallback UUID generator for non-secure contexts
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch {
        // Fallback for non-secure contexts (HTTP)
      }
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleSubmit = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Demo bypass: accept code "1234"
      if (code === '1234') {
        // Clear session storage first
        sessionStorage.removeItem('auth_phone');

        // Set mock user
        const now = new Date().toISOString();
        const mockUser = {
          id: generateUUID(),
          citizenshipCode: null,
          regionCode: null,
          entryDate: null,
          subscriptionType: 'free',
          subscriptionExpiresAt: null,
          settings: {
            locale: 'ru',
            timezone: 'Europe/Moscow',
            notifications: {
              push: true,
              telegram: false,
              deadlines: true,
              news: true,
            },
          },
          createdAt: now,
          updatedAt: now,
        };
        setUser(mockUser);

        // Navigate to onboarding
        router.push('/onboarding');
        return;
      }

      // Wrong code
      setError(t('auth.otp.wrongCode'));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(t('auth.otp.verifyError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendTimer(RESEND_TIMEOUT);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();

    // In production, call authApi.sendOtp
    // For demo, just show success message
  };

  const handleBack = () => {
    sessionStorage.removeItem('auth_phone');
    router.push('/auth/phone');
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
          {t('auth.otp.changeNumber')}
        </button>
        <LanguageSwitcher variant="compact" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 px-6 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.otp.title')}
            </h2>
            <p className="text-gray-500">
              {t('auth.otp.codeSent')}
              <br />
              <span className="font-semibold text-gray-900">
                {formatPhone(phone)}
              </span>
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  error ? 'border-red-300 bg-red-50' : digit ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-center text-red-600 mb-4">{error}</p>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Resend button */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-gray-500">
                {t('auth.otp.resendIn', { seconds: resendTimer.toString() })}
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                {t('auth.otp.resend')}
              </button>
            )}
          </div>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              <strong>{t('auth.demo.title')}:</strong> {t('auth.demo.otpHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
