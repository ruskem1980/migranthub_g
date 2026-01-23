'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setLoading } = useAuthStore();

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as +7 (XXX) XXX-XX-XX
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const getDigits = () => phone.replace(/\D/g, '');

  const isValidPhone = () => getDigits().length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone()) {
      setError('Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // Simulate API call - in production, call authApi.sendOtp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store phone for OTP page
      sessionStorage.setItem('auth_phone', getDigits());

      router.push('/auth/otp');
    } catch {
      setError('Ошибка отправки SMS. Попробуйте позже.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleTelegramLogin = () => {
    // Telegram WebApp login
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      if (tg.initDataUnsafe?.user) {
        // User is already authenticated via Telegram
        sessionStorage.setItem('telegram_user', JSON.stringify(tg.initDataUnsafe.user));
        router.push('/auth/onboarding');
        return;
      }
    }

    // Fallback: Telegram Login Widget
    // In production, redirect to Telegram OAuth
    alert('Telegram Login Widget будет доступен в продакшене');
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Войти по номеру
        </h2>
        <p className="text-gray-500">
          Введите номер телефона для получения кода
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="sr-only">Номер телефона</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+7 (___) ___-__-__"
              className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              autoComplete="tel"
              autoFocus
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValidPhone() || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="animate-pulse">Отправка...</span>
          ) : (
            <>
              Получить код
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">или</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Telegram Login */}
      <button
        onClick={handleTelegramLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#0088cc] text-white font-semibold py-4 rounded-xl hover:bg-[#0077b5] transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        Войти через Telegram
      </button>

      {/* Demo hint */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Демо:</strong> Введите любой номер формата +7 (XXX) XXX-XX-XX.
          Код подтверждения: <strong>1234</strong>
        </p>
      </div>
    </div>
  );
}
