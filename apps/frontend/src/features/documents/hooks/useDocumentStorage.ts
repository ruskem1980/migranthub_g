'use client';

import { useCallback, useState } from 'react';
import { db, type DBDocument } from '@/lib/db';
import { encryptData, decryptData, type EncryptedData } from '@/lib/crypto';
import { getOrCreateDeviceId } from '@/lib/api/device';
import { validateDocument, type DocumentTypeValue } from '../schemas';
import type {
  BaseDocument,
  TypedDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentDataByType,
} from '@/lib/db/types';

/**
 * Ошибки работы с документами
 */
export class DocumentStorageError extends Error {
  constructor(
    message: string,
    public code: 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED' | 'VALIDATION_FAILED' | 'NOT_FOUND' | 'STORAGE_ERROR'
  ) {
    super(message);
    this.name = 'DocumentStorageError';
  }
}

/**
 * Результат операции
 */
export type DocumentResult<T> =
  | { success: true; data: T }
  | { success: false; error: DocumentStorageError };

/**
 * Конвертация DBDocument в BaseDocument
 */
function dbToBaseDocument(dbDoc: DBDocument): BaseDocument {
  return {
    id: dbDoc.id,
    userId: dbDoc.oderId, // В текущей схеме используется oderId
    type: dbDoc.type as DocumentTypeValue,
    title: dbDoc.title,
    encryptedData: JSON.parse(dbDoc.ocrData || '{}') as EncryptedData,
    expiryDate: dbDoc.expiryDate,
    fileUri: dbDoc.fileUri,
    thumbnailUri: dbDoc.thumbnailUri,
    createdAt: dbDoc.createdAt,
    updatedAt: dbDoc.createdAt, // В текущей схеме нет updatedAt
    syncedAt: dbDoc.syncedAt,
  };
}

/**
 * Конвертация BaseDocument в DBDocument
 */
function baseToDBDocument(doc: BaseDocument): DBDocument {
  return {
    id: doc.id,
    oderId: doc.userId,
    type: doc.type,
    title: doc.title,
    ocrData: JSON.stringify(doc.encryptedData),
    expiryDate: doc.expiryDate,
    fileUri: doc.fileUri,
    thumbnailUri: doc.thumbnailUri,
    createdAt: doc.createdAt,
    syncedAt: doc.syncedAt,
  };
}

/**
 * Хук для работы с хранилищем документов
 */
export function useDocumentStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DocumentStorageError | null>(null);

  /**
   * Сохраняет документ (шифрует и записывает в Dexie)
   */
  const saveDocument = useCallback(async <T extends DocumentTypeValue>(
    input: CreateDocumentInput<T>
  ): Promise<DocumentResult<TypedDocument>> => {
    setIsLoading(true);
    setError(null);

    try {
      // Валидация данных
      const validationResult = validateDocument(input.type, input.data);
      if (!validationResult.success) {
        const err = new DocumentStorageError(
          `Ошибка валидации: ${validationResult.errors.issues[0]?.message || 'Некорректные данные'}`,
          'VALIDATION_FAILED'
        );
        setError(err);
        return { success: false, error: err };
      }

      // Получаем deviceId для шифрования
      const deviceId = await getOrCreateDeviceId();

      // Шифруем данные
      let encryptedData: EncryptedData;
      try {
        encryptedData = await encryptData(input.data, deviceId);
      } catch {
        const err = new DocumentStorageError(
          'Не удалось зашифровать данные',
          'ENCRYPTION_FAILED'
        );
        setError(err);
        return { success: false, error: err };
      }

      const now = new Date().toISOString();
      const id = crypto.randomUUID();

      const baseDoc: BaseDocument = {
        id,
        userId: input.userId,
        type: input.type,
        title: input.title,
        encryptedData,
        expiryDate: input.expiryDate,
        fileUri: input.fileUri,
        thumbnailUri: input.thumbnailUri,
        createdAt: now,
        updatedAt: now,
      };

      // Сохраняем в Dexie
      await db.documents.put(baseToDBDocument(baseDoc));

      // Возвращаем типизированный документ
      const typedDoc = {
        type: input.type,
        id,
        userId: input.userId,
        title: input.title,
        data: input.data,
        expiryDate: input.expiryDate,
        fileUri: input.fileUri,
        thumbnailUri: input.thumbnailUri,
        createdAt: now,
        updatedAt: now,
      } as TypedDocument;

      setIsLoading(false);
      return { success: true, data: typedDoc };
    } catch {
      const err = new DocumentStorageError(
        'Ошибка сохранения документа',
        'STORAGE_ERROR'
      );
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Получает все документы пользователя (расшифровывает)
   */
  const getDocuments = useCallback(async (
    userId: string
  ): Promise<DocumentResult<TypedDocument[]>> => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceId = await getOrCreateDeviceId();

      // Получаем документы из Dexie
      const dbDocs = await db.documents.where('oderId').equals(userId).toArray();

      const typedDocs: TypedDocument[] = [];

      for (const dbDoc of dbDocs) {
        try {
          const baseDoc = dbToBaseDocument(dbDoc);

          // Расшифровываем данные
          const data = await decryptData<DocumentDataByType[DocumentTypeValue]>(
            baseDoc.encryptedData,
            deviceId
          );

          typedDocs.push({
            type: baseDoc.type,
            id: baseDoc.id,
            userId: baseDoc.userId,
            title: baseDoc.title,
            data,
            expiryDate: baseDoc.expiryDate,
            fileUri: baseDoc.fileUri,
            thumbnailUri: baseDoc.thumbnailUri,
            createdAt: baseDoc.createdAt,
            updatedAt: baseDoc.updatedAt,
          } as TypedDocument);
        } catch {
          // Пропускаем документы, которые не удалось расшифровать
          console.warn(`Failed to decrypt document ${dbDoc.id}`);
        }
      }

      setIsLoading(false);
      return { success: true, data: typedDocs };
    } catch {
      const err = new DocumentStorageError(
        'Ошибка чтения документов',
        'STORAGE_ERROR'
      );
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Получает документ по ID
   */
  const getDocument = useCallback(async (
    id: string
  ): Promise<DocumentResult<TypedDocument>> => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceId = await getOrCreateDeviceId();

      const dbDoc = await db.documents.get(id);
      if (!dbDoc) {
        const err = new DocumentStorageError(
          'Документ не найден',
          'NOT_FOUND'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      const baseDoc = dbToBaseDocument(dbDoc);

      let data: DocumentDataByType[DocumentTypeValue];
      try {
        data = await decryptData(baseDoc.encryptedData, deviceId);
      } catch {
        const err = new DocumentStorageError(
          'Не удалось расшифровать документ',
          'DECRYPTION_FAILED'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      const typedDoc = {
        type: baseDoc.type,
        id: baseDoc.id,
        userId: baseDoc.userId,
        title: baseDoc.title,
        data,
        expiryDate: baseDoc.expiryDate,
        fileUri: baseDoc.fileUri,
        thumbnailUri: baseDoc.thumbnailUri,
        createdAt: baseDoc.createdAt,
        updatedAt: baseDoc.updatedAt,
      } as TypedDocument;

      setIsLoading(false);
      return { success: true, data: typedDoc };
    } catch {
      const err = new DocumentStorageError(
        'Ошибка чтения документа',
        'STORAGE_ERROR'
      );
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Обновляет документ
   */
  const updateDocument = useCallback(async <T extends DocumentTypeValue>(
    input: UpdateDocumentInput<T>
  ): Promise<DocumentResult<TypedDocument>> => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceId = await getOrCreateDeviceId();

      // Получаем существующий документ
      const dbDoc = await db.documents.get(input.id);
      if (!dbDoc) {
        const err = new DocumentStorageError(
          'Документ не найден',
          'NOT_FOUND'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      const baseDoc = dbToBaseDocument(dbDoc);

      // Расшифровываем текущие данные
      let currentData: DocumentDataByType[DocumentTypeValue];
      try {
        currentData = await decryptData(baseDoc.encryptedData, deviceId);
      } catch {
        const err = new DocumentStorageError(
          'Не удалось расшифровать документ',
          'DECRYPTION_FAILED'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      // Объединяем данные
      const newData = input.data
        ? { ...currentData, ...input.data }
        : currentData;

      // Валидация обновлённых данных
      const validationResult = validateDocument(baseDoc.type, newData);
      if (!validationResult.success) {
        const err = new DocumentStorageError(
          `Ошибка валидации: ${validationResult.errors.issues[0]?.message || 'Некорректные данные'}`,
          'VALIDATION_FAILED'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      // Шифруем обновлённые данные
      let encryptedData: EncryptedData;
      try {
        encryptedData = await encryptData(newData, deviceId);
      } catch {
        const err = new DocumentStorageError(
          'Не удалось зашифровать данные',
          'ENCRYPTION_FAILED'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      const now = new Date().toISOString();

      const updatedBaseDoc: BaseDocument = {
        ...baseDoc,
        title: input.title ?? baseDoc.title,
        encryptedData,
        expiryDate: input.expiryDate ?? baseDoc.expiryDate,
        fileUri: input.fileUri ?? baseDoc.fileUri,
        thumbnailUri: input.thumbnailUri ?? baseDoc.thumbnailUri,
        updatedAt: now,
      };

      // Сохраняем в Dexie
      await db.documents.put(baseToDBDocument(updatedBaseDoc));

      const typedDoc = {
        type: baseDoc.type,
        id: baseDoc.id,
        userId: baseDoc.userId,
        title: updatedBaseDoc.title,
        data: newData,
        expiryDate: updatedBaseDoc.expiryDate,
        fileUri: updatedBaseDoc.fileUri,
        thumbnailUri: updatedBaseDoc.thumbnailUri,
        createdAt: baseDoc.createdAt,
        updatedAt: now,
      } as TypedDocument;

      setIsLoading(false);
      return { success: true, data: typedDoc };
    } catch {
      const err = new DocumentStorageError(
        'Ошибка обновления документа',
        'STORAGE_ERROR'
      );
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Удаляет документ
   */
  const deleteDocument = useCallback(async (
    id: string
  ): Promise<DocumentResult<void>> => {
    setIsLoading(true);
    setError(null);

    try {
      const dbDoc = await db.documents.get(id);
      if (!dbDoc) {
        const err = new DocumentStorageError(
          'Документ не найден',
          'NOT_FOUND'
        );
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
      }

      await db.documents.delete(id);

      setIsLoading(false);
      return { success: true, data: undefined };
    } catch {
      const err = new DocumentStorageError(
        'Ошибка удаления документа',
        'STORAGE_ERROR'
      );
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Получает документы по типу
   */
  const getDocumentsByType = useCallback(async <T extends DocumentTypeValue>(
    userId: string,
    type: T
  ): Promise<DocumentResult<TypedDocument[]>> => {
    const result = await getDocuments(userId);
    if (!result.success) {
      return result;
    }

    const filtered = result.data.filter((doc) => doc.type === type);
    return { success: true, data: filtered };
  }, [getDocuments]);

  return {
    isLoading,
    error,
    saveDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByType,
  };
}

export type UseDocumentStorageReturn = ReturnType<typeof useDocumentStorage>;
