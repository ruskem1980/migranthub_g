'use client';

import {
  deriveKey,
  encrypt,
  decrypt,
  generateSalt,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '../crypto/backup-crypto';
import { db } from '../db';

/**
 * Интерфейс данных бэкапа
 */
export interface BackupData {
  version: number;
  exportedAt: string;
  tables: {
    profiles: unknown[];
    documents: unknown[];
    forms: unknown[];
    stayPeriods: unknown[];
    examQuestions: unknown[];
  };
}

/**
 * Метаданные бэкапа (для хранения на сервере)
 */
export interface BackupMetadata {
  salt: string;
  iv: string;
  hash?: string;
}

/**
 * Текущая версия формата бэкапа
 */
const BACKUP_VERSION = 1;

/**
 * Экспорт всех данных из IndexedDB
 */
export async function exportAllData(): Promise<ArrayBuffer> {
  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tables: {
      profiles: await db.profiles.toArray(),
      documents: await db.documents.toArray(),
      forms: await db.forms.toArray(),
      stayPeriods: await db.stayPeriods.toArray(),
      examQuestions: await db.examQuestions.toArray(),
    },
  };

  const json = JSON.stringify(data);
  const encoder = new TextEncoder();
  return encoder.encode(json).buffer as ArrayBuffer;
}

/**
 * Импорт данных в IndexedDB
 * Очищает существующие данные и заменяет их данными из бэкапа
 */
export async function importAllData(dataBuffer: ArrayBuffer): Promise<void> {
  const decoder = new TextDecoder();
  const json = decoder.decode(dataBuffer);
  const data: BackupData = JSON.parse(json);

  // Проверяем версию
  if (data.version > BACKUP_VERSION) {
    throw new Error(
      `Неподдерживаемая версия бэкапа: ${data.version}. Максимальная поддерживаемая: ${BACKUP_VERSION}`
    );
  }

  // Очищаем и импортируем данные в транзакции
  await db.transaction(
    'rw',
    [db.profiles, db.documents, db.forms, db.stayPeriods, db.examQuestions],
    async () => {
      // Очищаем таблицы
      await db.profiles.clear();
      await db.documents.clear();
      await db.forms.clear();
      await db.stayPeriods.clear();
      await db.examQuestions.clear();

      // Импортируем данные
      if (data.tables.profiles?.length) {
        await db.profiles.bulkAdd(data.tables.profiles as Parameters<typeof db.profiles.bulkAdd>[0]);
      }
      if (data.tables.documents?.length) {
        await db.documents.bulkAdd(data.tables.documents as Parameters<typeof db.documents.bulkAdd>[0]);
      }
      if (data.tables.forms?.length) {
        await db.forms.bulkAdd(data.tables.forms as Parameters<typeof db.forms.bulkAdd>[0]);
      }
      if (data.tables.stayPeriods?.length) {
        await db.stayPeriods.bulkAdd(data.tables.stayPeriods as Parameters<typeof db.stayPeriods.bulkAdd>[0]);
      }
      if (data.tables.examQuestions?.length) {
        await db.examQuestions.bulkAdd(data.tables.examQuestions as Parameters<typeof db.examQuestions.bulkAdd>[0]);
      }
    }
  );
}

/**
 * Создать зашифрованный бэкап
 */
export async function createEncryptedBackup(password: string): Promise<{
  blob: Blob;
  salt: string;
  iv: string;
}> {
  const data = await exportAllData();
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const { encrypted, iv } = await encrypt(data, key);

  return {
    blob: new Blob([encrypted], { type: 'application/octet-stream' }),
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
  };
}

/**
 * Восстановить из зашифрованного бэкапа
 */
export async function restoreFromBackup(
  blob: Blob,
  password: string,
  salt: string,
  iv: string
): Promise<void> {
  const encryptedData = await blob.arrayBuffer();
  const saltBytes = base64ToUint8Array(salt);
  const ivBytes = base64ToUint8Array(iv);

  const key = await deriveKey(password, saltBytes);
  const decrypted = await decrypt(encryptedData, key, ivBytes);

  await importAllData(decrypted);
}

/**
 * Получить размер данных для бэкапа (приблизительно)
 */
export async function getBackupDataSize(): Promise<number> {
  const data = await exportAllData();
  return data.byteLength;
}

/**
 * Валидация бэкапа без импорта
 */
export async function validateBackup(
  blob: Blob,
  password: string,
  salt: string,
  iv: string
): Promise<{ valid: boolean; version?: number; exportedAt?: string; error?: string }> {
  try {
    const encryptedData = await blob.arrayBuffer();
    const saltBytes = base64ToUint8Array(salt);
    const ivBytes = base64ToUint8Array(iv);

    const key = await deriveKey(password, saltBytes);
    const decrypted = await decrypt(encryptedData, key, ivBytes);

    const decoder = new TextDecoder();
    const json = decoder.decode(decrypted);
    const data: BackupData = JSON.parse(json);

    return {
      valid: true,
      version: data.version,
      exportedAt: data.exportedAt,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Неверный пароль или поврежденный файл',
    };
  }
}
