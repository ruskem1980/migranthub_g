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
    // DEV: Сброс для тестирования - каждый раз с чистого листа
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('migranthub-welcome-completed');
      localStorage.removeItem('migranthub-auth');
      localStorage.removeItem('migranthub-legal-agreed');
      sessionStorage.clear();
    }

    const determineRoute = () => {
      // Шаг 1: Проверяем, прошел ли пользователь Welcome
      const welcomeCompleted = localStorage.getItem('migranthub-welcome-completed');
      if (!welcomeCompleted) {
        router.replace('/welcome');
        return;
      }

      // Шаг 2: Проверяем авторизацию
      try {
        const authData = localStorage.getItem('migranthub-auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.isAuthenticated) {
            // Авторизован → идём в приложение
            router.replace('/prototype');
            return;
          }
        }
      } catch (e) {
        console.error('Auth check error:', e);
      }

      // Не авторизован → на авторизацию
      router.replace('/auth/method');
    };

    // Небольшая задержка для гарантии доступности localStorage
    const timer = setTimeout(determineRoute, 200);
    return () => clearTimeout(timer);
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
