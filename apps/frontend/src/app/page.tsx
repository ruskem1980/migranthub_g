'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Simple check after component mounts
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('migranthub-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.isAuthenticated) {
            router.replace('/prototype');
            return;
          }
        }
      } catch (e) {
        console.error('Auth check error:', e);
      }
      // Start from welcome screen (language selection + app description)
      router.replace('/auth/welcome');
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      checkAuth();
      setChecked(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading splash screen
  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-5xl">🛡️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">MigrantHub</h1>
        <p className="text-white/80 mb-6">Экосистема для мигрантов в России</p>
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
