import type { z } from 'zod';
import { passportSchema, type PassportData } from './passport.schema';
import { migrationCardSchema, type MigrationCardData } from './migrationCard.schema';
import { patentSchema, type PatentData } from './patent.schema';
import { registrationSchema, type RegistrationData } from './registration.schema';

// Passport
export {
  passportSchema,
  passportUpdateSchema,
  type PassportData,
  type PassportUpdateData,
} from './passport.schema';

// Migration Card
export {
  migrationCardSchema,
  migrationCardUpdateSchema,
  visitPurposes,
  visitPurposeLabels,
  type MigrationCardData,
  type MigrationCardUpdateData,
  type VisitPurpose,
} from './migrationCard.schema';

// Patent
export {
  patentSchema,
  patentUpdateSchema,
  russianRegions,
  getDaysUntilPayment,
  isPaymentOverdue,
  type PatentData,
  type PatentUpdateData,
  type RussianRegion,
} from './patent.schema';

// Registration
export {
  registrationSchema,
  registrationUpdateSchema,
  registrationTypes,
  registrationTypeLabels,
  getDaysUntilExpiry,
  isRegistrationExpired,
  isRegistrationExpiringSoon,
  formatFullAddress,
  type RegistrationData,
  type RegistrationUpdateData,
  type RegistrationType,
} from './registration.schema';

// Document types enum
export const DocumentType = {
  PASSPORT: 'passport',
  MIGRATION_CARD: 'migration_card',
  PATENT: 'patent',
  REGISTRATION: 'registration',
} as const;

export type DocumentTypeValue = (typeof DocumentType)[keyof typeof DocumentType];

// Названия документов на русском
export const documentTypeLabels: Record<DocumentTypeValue, string> = {
  passport: 'Паспорт',
  migration_card: 'Миграционная карта',
  patent: 'Патент на работу',
  registration: 'Регистрация',
};

// Union type для всех данных документов
export type DocumentData =
  | { type: 'passport'; data: PassportData }
  | { type: 'migration_card'; data: MigrationCardData }
  | { type: 'patent'; data: PatentData }
  | { type: 'registration'; data: RegistrationData };

export const documentSchemas = {
  passport: passportSchema,
  migration_card: migrationCardSchema,
  patent: patentSchema,
  registration: registrationSchema,
} as const;

export function getDocumentSchema(type: DocumentTypeValue): z.ZodSchema {
  return documentSchemas[type];
}

// Валидация документа по типу
export function validateDocument(
  type: DocumentTypeValue,
  data: unknown
): { success: true; data: DocumentData['data'] } | { success: false; errors: z.ZodError } {
  const schema = getDocumentSchema(type);
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as DocumentData['data'] };
  }

  return { success: false, errors: result.error };
}
