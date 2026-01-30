'use client';

import { type ReactNode, useEffect } from 'react';
import { BottomNavigation } from '@/components/ui';
import { QuickRegistrationSheet } from '@/components/registration/QuickRegistrationSheet';
import { useQuickRegistration } from '@/hooks';
import { useAuthStore } from '@/lib/stores';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const quickReg = useQuickRegistration();
  const { initializeAnonymous, isInitialized, accessMode, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Ждем гидрации Zustand перед инициализацией
    if (!_hasHydrated) return;

    // Инициализируем анонимный режим если сессия не восстановлена
    if (!isInitialized || !accessMode || accessMode === 'anonymous') {
      initializeAnonymous();
    }
  }, [_hasHydrated, isInitialized, accessMode, initializeAnonymous]);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
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
