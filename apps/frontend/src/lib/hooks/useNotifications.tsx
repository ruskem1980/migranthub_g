'use client';

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  requestPermissions,
  checkPermissions,
  addNotificationClickListener,
  scheduleDocumentReminders,
  cancelDocumentReminders,
  rescheduleAllReminders,
} from '@/lib/notifications';
import type { TypedDocument } from '@/lib/db/types';

/**
 * Статус разрешений на уведомления
 */
export type NotificationPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Контекст уведомлений
 */
interface NotificationContextValue {
  /** Статус разрешений */
  permission: NotificationPermission;
  /** Запрос разрешений */
  requestPermission: () => Promise<void>;
  /** Инициализирован ли модуль */
  isInitialized: boolean;
  /** Планирование уведомлений для документа */
  scheduleForDocument: (doc: TypedDocument) => Promise<void>;
  /** Отмена уведомлений для документа */
  cancelForDocument: (docId: string) => Promise<void>;
  /** Перепланирование всех уведомлений */
  rescheduleAll: (docs: TypedDocument[]) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Провайдер уведомлений
 * Инициализирует систему уведомлений и обрабатывает клики
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission>('unknown');
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация при монтировании
  useEffect(() => {
    let unsubscribeClick: (() => void) | undefined;

    const init = async () => {
      // Проверяем текущие разрешения
      const status = await checkPermissions();
      setPermission(status.display as NotificationPermission);

      // Регистрируем обработчик клика
      unsubscribeClick = addNotificationClickListener((documentId) => {
        // Навигация к документу при клике на уведомление
        router.push(`/documents/${documentId}`);
      });

      setIsInitialized(true);
    };

    init();

    return () => {
      unsubscribeClick?.();
    };
  }, [router]);

  // Запрос разрешений
  const requestPermission = useCallback(async () => {
    const status = await requestPermissions();
    setPermission(status.display as NotificationPermission);
  }, []);

  // Планирование уведомлений для документа
  const scheduleForDocument = useCallback(async (doc: TypedDocument) => {
    if (permission !== 'granted') {
      return;
    }
    await scheduleDocumentReminders(doc);
  }, [permission]);

  // Отмена уведомлений для документа
  const cancelForDocument = useCallback(async (docId: string) => {
    await cancelDocumentReminders(docId);
  }, []);

  // Перепланирование всех уведомлений
  const rescheduleAll = useCallback(async (docs: TypedDocument[]) => {
    if (permission !== 'granted') {
      return;
    }
    await rescheduleAllReminders(docs);
  }, [permission]);

  const value: NotificationContextValue = {
    permission,
    requestPermission,
    isInitialized,
    scheduleForDocument,
    cancelForDocument,
    rescheduleAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Хук для работы с уведомлениями
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}

/**
 * Опциональный хук (не бросает ошибку если нет провайдера)
 * Полезен для компонентов, которые могут использоваться без провайдера
 */
export function useNotificationsOptional(): NotificationContextValue | null {
  return useContext(NotificationContext);
}
