'use client';

import { useAuthStore } from '@/lib/stores';
import { AnonymousDashboard } from '@/components/anonymous';
import { PersonalDashboard } from '@/components/personal';
// DashboardLayout available for prototype mode if needed

/**
 * Dashboard Page with Lazy Auth
 *
 * - Анонимные пользователи видят AnonymousDashboard (ценность сразу)
 * - Зарегистрированные пользователи видят PersonalDashboard
 * - Если есть профиль (prototype mode) - показываем DashboardLayout
 */
export default function DashboardPage() {
  // Use stable selectors to prevent re-render loops
  const isAnonymous = useAuthStore((state) => state.isAnonymous);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

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
