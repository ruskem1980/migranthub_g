'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

/**
 * Единый поток приложения:
 * 1. Welcome (язык + акцепт) → только первый запуск
 * 2. Auth (авторизация) → только первый раз
 * 3. Profiling (профилирование) → после авторизации
 * 4. Dashboard → основное приложение
 */
export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Сразу переходим на welcome (ценности + выбор языка)
    router.replace('/welcome');
  }, [router]);

  // Splash screen пока определяем маршрут
  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <span className="text-5xl">🛡️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">MigrantHub</h1>
        <p className="text-white/70 mb-8">{t('app.tagline')}</p>
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
