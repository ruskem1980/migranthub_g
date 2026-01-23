'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { useServiceWorker } from '@/lib/hooks/useServiceWorker';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

function AppInitializer({ children }: { children: ReactNode }) {
  // Register service worker
  const { isUpdating, skipWaiting } = useServiceWorker();

  // Track online status
  const isOnline = useOnlineStatus();

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 text-center text-sm py-1 z-50">
          Нет подключения к интернету
        </div>
      )}

      {/* Update notification */}
      {isUpdating && (
        <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 flex items-center justify-between">
          <span>Доступно обновление</span>
          <button
            onClick={skipWaiting}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg"
          >
            Обновить
          </button>
        </div>
      )}

      {children}
    </>
  );
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AppInitializer>{children}</AppInitializer>
    </QueryProvider>
  );
}
