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
        const legalAgreed = localStorage.getItem('migranthub-legal-agreed');

        if (stored) {
          const parsed = JSON.parse(stored);
          // Only redirect to prototype if BOTH authenticated AND legal agreed
          if (parsed?.state?.isAuthenticated && legalAgreed === 'true') {
            router.replace('/prototype');
            return;
          }
        }
      } catch (e) {
        console.error('Auth check error:', e);
      }
      // Start from welcome screen (language selection + app description)
      router.replace('/welcome');
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      checkAuth();
      setChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading splash screen with reset option
  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-5xl">🛡️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">MigrantHub</h1>
        <p className="text-white/80 mb-6">Экосистема для мигрантов в России</p>
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />

        {/* Debug reset button */}
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/welcome';
          }}
          className="text-white/60 text-sm underline hover:text-white"
        >
          🔄 Сбросить и начать заново
        </button>
      </div>
    </div>
  );
}
