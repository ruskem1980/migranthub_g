'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { BottomNavigation, SyncStatusBar } from '@/components/ui';
import { QuickRegistrationSheet } from '@/components/registration/QuickRegistrationSheet';
import { useQuickRegistration } from '@/hooks';
import { useAuthStore } from '@/lib/stores';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const quickReg = useQuickRegistration();
  const initCalledRef = useRef(false);

  // Use stable selectors
  const initializeAnonymous = useAuthStore((state) => state.initializeAnonymous);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // Ждем гидрации Zustand перед инициализацией
    if (!_hasHydrated) return;

    // Инициализируем только один раз если ещё не инициализировали
    if (!isInitialized && !initCalledRef.current) {
      initCalledRef.current = true;
      initializeAnonymous();
    }
  }, [_hasHydrated, isInitialized, initializeAnonymous]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {children}
      {/* Sync Status Bar - above bottom navigation */}
      <div className="fixed bottom-16 left-0 right-0 z-40">
        <SyncStatusBar />
      </div>
      <BottomNavigation />

      {/* QuickRegistration доступен глобально */}
      <QuickRegistrationSheet
        isOpen={quickReg.isOpen}
        onClose={quickReg.close}
        onComplete={() => {
          quickReg.close();
          // После регистрации страница автоматически обновится через store
        }}
        trigger={quickReg.trigger || 'general'}
        prefillData={quickReg.prefillData || undefined}
      />
    </div>
  );
}
