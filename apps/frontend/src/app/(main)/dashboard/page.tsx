'use client';

import { useAuthStore } from '@/lib/stores';
import { AnonymousDashboard } from '@/components/anonymous';
import { PersonalDashboard } from '@/components/personal';
import { DashboardLayout } from '@/components/prototype/DashboardLayout';

/**
 * Dashboard Page with Lazy Auth
 *
 * - Анонимные пользователи видят AnonymousDashboard (ценность сразу)
 * - Зарегистрированные пользователи видят PersonalDashboard
 * - Если есть профиль (prototype mode) - показываем DashboardLayout
 */
export default function DashboardPage() {
  const { isAnonymous, _hasHydrated } = useAuthStore();

  // Ждем гидрации Zustand для избежания hydration mismatch
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Показываем разный dashboard в зависимости от режима
  if (isAnonymous) {
    return <AnonymousDashboard />;
  }

  // Для зарегистрированных - PersonalDashboard
  // (или DashboardLayout если нужен prototype mode)
  return <PersonalDashboard />;
}
