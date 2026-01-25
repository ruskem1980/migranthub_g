import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
  type PermissionStatus,
} from '@capacitor/local-notifications';
import type { TypedDocument } from '@/lib/db/types';
import { documentTypeLabels } from '@/lib/db/types';

/**
 * Проверяем, запущено ли приложение на нативной платформе
 */
const isNative = Capacitor.isNativePlatform();

/**
 * Дни до истечения срока для напоминаний
 */
const REMINDER_DAYS = [30, 14, 7, 3, 1] as const;

/**
 * Генерирует уникальный ID уведомления
 * Формат: hash от "doc-{docId}-{days}"
 */
export function generateNotificationId(docId: string, days: number): number {
  const str = `doc-${docId}-${days}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Запрашивает разрешения на уведомления
 * На web платформе возвращает granted с логированием
 */
export async function requestPermissions(): Promise<PermissionStatus> {
  if (!isNative) {
    console.log('[Notifications] Web fallback: разрешения не требуются');
    return { display: 'granted' };
  }

  try {
    const status = await LocalNotifications.checkPermissions();

    if (status.display === 'prompt' || status.display === 'prompt-with-rationale') {
      const result = await LocalNotifications.requestPermissions();
      return result;
    }

    return status;
  } catch (error) {
    console.error('[Notifications] Ошибка запроса разрешений:', error);
    return { display: 'denied' };
  }
}

/**
 * Проверяет статус разрешений
 */
export async function checkPermissions(): Promise<PermissionStatus> {
  if (!isNative) {
    return { display: 'granted' };
  }

  try {
    return await LocalNotifications.checkPermissions();
  } catch (error) {
    console.error('[Notifications] Ошибка проверки разрешений:', error);
    return { display: 'denied' };
  }
}

/**
 * Форматирует сообщение уведомления
 */
function formatNotificationBody(docType: string, daysUntilExpiry: number): string {
  const docName = documentTypeLabels[docType as keyof typeof documentTypeLabels] || docType;

  if (daysUntilExpiry === 0) {
    return `${docName} истекает сегодня! Требуется срочное продление.`;
  }

  if (daysUntilExpiry === 1) {
    return `${docName} истекает завтра! Не забудьте продлить.`;
  }

  const daysText = pluralizeDays(daysUntilExpiry);
  return `${docName} истекает через ${daysUntilExpiry} ${daysText}. Позаботьтесь о продлении заранее.`;
}

/**
 * Склонение слова "день"
 */
function pluralizeDays(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней';
  }

  if (lastDigit === 1) {
    return 'день';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }

  return 'дней';
}

/**
 * Планирует уведомления для документа
 * Напоминания за 30, 14, 7, 3 и 1 день до истечения
 */
export async function scheduleDocumentReminders(doc: TypedDocument): Promise<void> {
  if (!doc.expiryDate) {
    return;
  }

  const expiryDate = new Date(doc.expiryDate);
  expiryDate.setHours(9, 0, 0, 0); // Уведомления в 9:00

  const now = new Date();
  const notifications: LocalNotificationSchema[] = [];

  for (const days of REMINDER_DAYS) {
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - days);

    // Не планируем уведомления в прошлом
    if (notificationDate <= now) {
      continue;
    }

    const docName = documentTypeLabels[doc.type] || doc.type;

    notifications.push({
      id: generateNotificationId(doc.id, days),
      title: `${docName}: срок истекает`,
      body: formatNotificationBody(doc.type, days),
      schedule: { at: notificationDate },
      extra: {
        documentId: doc.id,
        documentType: doc.type,
        daysUntilExpiry: days,
      },
    });
  }

  if (notifications.length === 0) {
    return;
  }

  if (!isNative) {
    console.log('[Notifications] Web fallback: запланированы уведомления', {
      documentId: doc.id,
      documentType: doc.type,
      count: notifications.length,
      dates: notifications.map(n => n.schedule?.at),
    });
    return;
  }

  try {
    await LocalNotifications.schedule({ notifications });
    console.log(`[Notifications] Запланировано ${notifications.length} уведомлений для документа ${doc.id}`);
  } catch (error) {
    console.error('[Notifications] Ошибка планирования уведомлений:', error);
  }
}

/**
 * Отменяет все уведомления для документа
 */
export async function cancelDocumentReminders(docId: string): Promise<void> {
  const notificationIds = REMINDER_DAYS.map(days => ({
    id: generateNotificationId(docId, days),
  }));

  if (!isNative) {
    console.log('[Notifications] Web fallback: отменены уведомления для документа', docId);
    return;
  }

  try {
    await LocalNotifications.cancel({ notifications: notificationIds });
    console.log(`[Notifications] Отменены уведомления для документа ${docId}`);
  } catch (error) {
    console.error('[Notifications] Ошибка отмены уведомлений:', error);
  }
}

/**
 * Перепланирует все уведомления для списка документов
 * Полезно при синхронизации или изменении данных
 */
export async function rescheduleAllReminders(docs: TypedDocument[]): Promise<void> {
  if (!isNative) {
    console.log('[Notifications] Web fallback: перепланирование уведомлений для', docs.length, 'документов');
    for (const doc of docs) {
      if (doc.expiryDate) {
        await scheduleDocumentReminders(doc);
      }
    }
    return;
  }

  try {
    // Получаем все запланированные уведомления
    const pending = await LocalNotifications.getPending();

    // Отменяем все существующие уведомления документов
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Планируем новые уведомления для каждого документа
    for (const doc of docs) {
      if (doc.expiryDate) {
        await scheduleDocumentReminders(doc);
      }
    }

    console.log(`[Notifications] Перепланированы уведомления для ${docs.length} документов`);
  } catch (error) {
    console.error('[Notifications] Ошибка перепланирования уведомлений:', error);
  }
}

/**
 * Получает список запланированных уведомлений
 */
export async function getPendingNotifications(): Promise<LocalNotificationSchema[]> {
  if (!isNative) {
    console.log('[Notifications] Web fallback: нет запланированных уведомлений');
    return [];
  }

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('[Notifications] Ошибка получения уведомлений:', error);
    return [];
  }
}

/**
 * Регистрирует слушатель клика по уведомлению
 * Возвращает функцию для отписки
 */
export function addNotificationClickListener(
  callback: (documentId: string) => void
): () => void {
  if (!isNative) {
    console.log('[Notifications] Web fallback: слушатель кликов не зарегистрирован');
    return () => {};
  }

  const handle = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    (action) => {
      const documentId = action.notification.extra?.documentId;
      if (documentId) {
        callback(documentId);
      }
    }
  );

  return () => {
    handle.then(h => h.remove());
  };
}

/**
 * Регистрирует слушатель получения уведомления
 */
export function addNotificationReceivedListener(
  callback: (notification: LocalNotificationSchema) => void
): () => void {
  if (!isNative) {
    return () => {};
  }

  const handle = LocalNotifications.addListener(
    'localNotificationReceived',
    (notification) => {
      callback(notification);
    }
  );

  return () => {
    handle.then(h => h.remove());
  };
}
