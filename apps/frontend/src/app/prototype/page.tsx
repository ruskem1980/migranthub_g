'use client';

import { AppPrototype } from '@/components/prototype/AppPrototype';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

export default function PrototypePage() {
  const { isLoading, isAuthenticated } = useAuthGuard({
    requireAuth: true,
    redirectTo: '/welcome',
  });

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <AppPrototype />;
}
