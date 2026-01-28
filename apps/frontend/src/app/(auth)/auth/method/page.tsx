'use client';

import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function AuthMethodPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePhoneAuth = () => {
    router.push('/auth/phone');
  };

  const handleTelegramAuth = () => {
    // Telegram WebApp login
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      if (tg.initDataUnsafe?.user) {
        // User is already authenticated via Telegram
        sessionStorage.setItem('telegram_user', JSON.stringify(tg.initDataUnsafe.user));
        router.push('/services');
        return;
      }
    }

    // Fallback: Telegram Login Widget
    // In production, redirect to Telegram OAuth
    alert('Telegram Login Widget будет доступен в продакшене');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
        <LanguageSwitcher variant="compact" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 px-6 py-8 overflow-y-auto">
        {/* Icon and Title */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-blue-600" strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t('auth.method.title')}
          </h1>

          <p className="text-gray-500 text-center max-w-sm">
            {t('auth.method.subtitle')}
          </p>
        </div>

        {/* Auth Method Options */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Phone Auth */}
          <button
            onClick={handlePhoneAuth}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-98 shadow-md"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-7 h-7 text-blue-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {t('auth.method.phone.title')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('auth.method.phone.description')}
              </p>
            </div>
          </button>

          {/* Telegram Auth */}
          <button
            onClick={handleTelegramAuth}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#0088cc] hover:bg-blue-50 transition-all active:scale-98 shadow-md"
          >
            <div className="w-14 h-14 bg-[#0088cc]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-[#0088cc]" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {t('auth.method.telegram.title')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('auth.method.telegram.description')}
              </p>
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-4 bg-green-50 border-2 border-green-200 rounded-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-sm text-green-800">
              {t('auth.method.securityNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
