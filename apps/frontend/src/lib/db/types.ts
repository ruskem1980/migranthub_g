import type { EncryptedData } from '../crypto';
import type {
  PassportData,
  MigrationCardData,
  PatentData,
  RegistrationData,
  InnData,
  SnilsData,
  DmsData,
} from '@/features/documents/schemas';

/**
 * Типы документов
 */
export const DocumentType = {
  PASSPORT: 'passport',
  MIGRATION_CARD: 'migration_card',
  PATENT: 'patent',
  REGISTRATION: 'registration',
  INN: 'inn',
  SNILS: 'snils',
  DMS: 'dms',
} as const;

export type DocumentTypeValue = (typeof DocumentType)[keyof typeof DocumentType];

/**
 * Базовый интерфейс документа в БД
 */
export interface BaseDocument {
  id: string;
  userId: string;
  type: DocumentTypeValue;
  title: string;
  // Зашифрованные данные документа
  encryptedData: EncryptedData;
  // Метаданные (не зашифрованы для индексации)
  expiryDate?: string;
  // Файлы
  fileUri?: string;
  thumbnailUri?: string;
  // Служебные поля
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

/**
 * Типизированные документы (расшифрованные)
 */
export interface PassportDocument {
  type: 'passport';
  id: string;
  userId: string;
  title: string;
  data: PassportData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationCardDocument {
  type: 'migration_card';
  id: string;
  userId: string;
  title: string;
  data: MigrationCardData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatentDocument {
  type: 'patent';
  id: string;
  userId: string;
  title: string;
  data: PatentData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationDocument {
  type: 'registration';
  id: string;
  userId: string;
  title: string;
  data: RegistrationData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InnDocument {
  type: 'inn';
  id: string;
  userId: string;
  title: string;
  data: InnData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SnilsDocument {
  type: 'snils';
  id: string;
  userId: string;
  title: string;
  data: SnilsData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DmsDocument {
  type: 'dms';
  id: string;
  userId: string;
  title: string;
  data: DmsData;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Discriminated union для типизированных документов
 */
export type TypedDocument =
  | PassportDocument
  | MigrationCardDocument
  | PatentDocument
  | RegistrationDocument
  | InnDocument
  | SnilsDocument
  | DmsDocument;

/**
 * Данные документа по типу
 */
export type DocumentDataByType = {
  passport: PassportData;
  migration_card: MigrationCardData;
  patent: PatentData;
  registration: RegistrationData;
  inn: InnData;
  snils: SnilsData;
  dms: DmsData;
};

/**
 * Хелпер для получения типа данных документа
 */
export type GetDocumentData<T extends DocumentTypeValue> = DocumentDataByType[T];

/**
 * Входные данные для создания документа
 */
export interface CreateDocumentInput<T extends DocumentTypeValue> {
  type: T;
  userId: string;
  title: string;
  data: DocumentDataByType[T];
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
}

/**
 * Входные данные для обновления документа
 */
export interface UpdateDocumentInput<T extends DocumentTypeValue> {
  id: string;
  title?: string;
  data?: Partial<DocumentDataByType[T]>;
  expiryDate?: string;
  fileUri?: string;
  thumbnailUri?: string;
}

/**
 * Статус документа на основе срока действия
 */
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

/**
 * Получение статуса документа
 */
export function getDocumentStatus(
  expiryDate: string | undefined,
  warningDays = 30
): DocumentStatus {
  if (!expiryDate) {
    return 'valid';
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();

  // Если дата истечения в прошлом - документ просрочен
  if (diffTime < 0) {
    return 'expired';
  }

  // Используем floor для подсчёта полных дней до истечения
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= warningDays) {
    return 'expiring_soon';
  }

  return 'valid';
}

/**
 * Названия документов на русском
 */
export const documentTypeLabels: Record<DocumentTypeValue, string> = {
  passport: 'Паспорт',
  migration_card: 'Миграционная карта',
  patent: 'Патент на работу',
  registration: 'Регистрация',
  inn: 'ИНН',
  snils: 'СНИЛС',
  dms: 'ДМС',
};

/**
 * Иконки документов (для UI)
 */
export const documentTypeIcons: Record<DocumentTypeValue, string> = {
  passport: 'passport',
  migration_card: 'file-text',
  patent: 'briefcase',
  registration: 'home',
  inn: 'hash',
  snils: 'user-check',
  dms: 'heart-pulse',
};

/**
 * Приоритет документов при отображении
 */
export const documentTypePriority: Record<DocumentTypeValue, number> = {
  passport: 1,
  migration_card: 2,
  registration: 3,
  patent: 4,
  inn: 5,
  snils: 6,
  dms: 7,
};

/**
 * Сортировка документов по приоритету
 */
export function sortDocumentsByPriority<T extends { type: DocumentTypeValue }>(
  documents: T[]
): T[] {
  return [...documents].sort(
    (a, b) => documentTypePriority[a.type] - documentTypePriority[b.type]
  );
}

/**
 * Фильтр документов по статусу
 */
export function filterDocumentsByStatus<T extends { expiryDate?: string }>(
  documents: T[],
  status: DocumentStatus
): T[] {
  return documents.filter((doc) => getDocumentStatus(doc.expiryDate) === status);
}
