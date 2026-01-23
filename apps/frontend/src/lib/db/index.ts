import Dexie, { type Table } from 'dexie';

// Types
export interface DBProfile {
  id: string;
  userId: string;
  fullName: string;
  fullNameLatin?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  citizenship: string;
  entryDate?: string;
  migrationCardNumber?: string;
  migrationCardExpiry?: string;
  purpose?: 'work' | 'study' | 'tourist' | 'private';
  registrationAddress?: string;
  registrationExpiry?: string;
  hostFullName?: string;
  hostAddress?: string;
  hasPatent?: boolean;
  patentRegion?: string;
  patentExpiry?: string;
  employerName?: string;
  employerINN?: string;
  phone?: string;
  email?: string;
  language: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface DBDocument {
  id: string;
  oderId: string;
  type: string;
  title: string;
  fileUri?: string;
  thumbnailUri?: string;
  ocrData?: string; // JSON string
  expiryDate?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface DBForm {
  id: string;
  oderId: string;
  formType: string;
  data: string; // JSON string
  status: 'draft' | 'completed' | 'submitted';
  pdfUri?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface DBSyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: string; // JSON string
  createdAt: string;
  attempts: number;
  lastError?: string;
}

// Database class
export class MigrantHubDB extends Dexie {
  profiles!: Table<DBProfile>;
  documents!: Table<DBDocument>;
  forms!: Table<DBForm>;
  syncQueue!: Table<DBSyncQueue>;

  constructor() {
    super('migranthub');

    this.version(1).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
    });
  }
}

// Singleton instance
export const db = new MigrantHubDB();

// Helper functions
export async function saveProfile(profile: DBProfile): Promise<void> {
  await db.profiles.put(profile);
}

export async function getProfile(userId: string): Promise<DBProfile | undefined> {
  return db.profiles.where('userId').equals(userId).first();
}

export async function saveDocument(document: DBDocument): Promise<void> {
  await db.documents.put(document);
}

export async function getDocuments(userId: string): Promise<DBDocument[]> {
  return db.documents.where('userId').equals(userId).toArray();
}

export async function saveForm(form: DBForm): Promise<void> {
  await db.forms.put(form);
}

export async function getForms(userId: string): Promise<DBForm[]> {
  return db.forms.where('userId').equals(userId).toArray();
}

export async function addToSyncQueue(item: Omit<DBSyncQueue, 'id' | 'createdAt' | 'attempts'>): Promise<void> {
  await db.syncQueue.add({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
}

export async function processSyncQueue(): Promise<void> {
  const items = await db.syncQueue.toArray();

  for (const item of items) {
    try {
      // TODO: Implement actual sync logic with server
      console.log('Syncing:', item);
      await db.syncQueue.delete(item.id);
    } catch (error) {
      await db.syncQueue.update(item.id, {
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export async function clearAllData(): Promise<void> {
  await db.profiles.clear();
  await db.documents.clear();
  await db.forms.clear();
  await db.syncQueue.clear();
}
