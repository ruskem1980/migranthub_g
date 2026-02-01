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

export interface DBStayPeriod {
  id: string;
  oderId: string; // userId
  entryDate: string;
  exitDate?: string;
  migrationCardId?: string; // связь с документом миграционной карты
  createdAt: string;
  updatedAt: string;
}

export interface DBOfflineQueueItem {
  id: string;
  action: string;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: string;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  lastError?: string;
  lastAttemptAt?: string;
}

export interface DBExamQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string; // JSON array
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;
  tags?: string; // JSON array
  cachedAt: string;
}

export interface DBPatentRegion {
  code: string;
  name: string;
  coefficient: number;
  monthlyCost: number;
  cachedAt: string;
}

export interface DBLegalDataMeta {
  id: string; // 'patent-regions' | 'faq' | etc.
  updatedAt: string;
  cachedAt: string;
}

// Database class
export class MigrantHubDB extends Dexie {
  profiles!: Table<DBProfile>;
  documents!: Table<DBDocument>;
  forms!: Table<DBForm>;
  syncQueue!: Table<DBSyncQueue>;
  stayPeriods!: Table<DBStayPeriod>;
  offlineQueue!: Table<DBOfflineQueueItem>;
  examQuestions!: Table<DBExamQuestion>;
  patentRegions!: Table<DBPatentRegion>;
  legalDataMeta!: Table<DBLegalDataMeta>;

  constructor() {
    super('migranthub');

    this.version(1).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
    });

    this.version(2).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
      stayPeriods: 'id, oderId, entryDate, exitDate, migrationCardId, createdAt',
    });

    this.version(3).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
      stayPeriods: 'id, oderId, entryDate, exitDate, migrationCardId, createdAt',
      offlineQueue: 'id, action, endpoint, method, status, createdAt, retryCount',
    });

    this.version(4).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
      stayPeriods: 'id, oderId, entryDate, exitDate, migrationCardId, createdAt',
      offlineQueue: 'id, action, endpoint, method, status, createdAt, retryCount',
      examQuestions: 'id, category, difficulty, cachedAt',
    });

    this.version(5).stores({
      profiles: 'id, oderId, fullName, passportNumber, citizenship, updatedAt, syncedAt',
      documents: 'id, oderId, type, expiryDate, createdAt, syncedAt',
      forms: 'id, oderId, formType, status, createdAt, updatedAt, syncedAt',
      syncQueue: 'id, action, table, recordId, createdAt, attempts',
      stayPeriods: 'id, oderId, entryDate, exitDate, migrationCardId, createdAt',
      offlineQueue: 'id, action, endpoint, method, status, createdAt, retryCount',
      examQuestions: 'id, category, difficulty, cachedAt',
      patentRegions: 'code, name, cachedAt',
      legalDataMeta: 'id, updatedAt, cachedAt',
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
  await db.stayPeriods.clear();
  await db.offlineQueue.clear();
  await db.examQuestions.clear();
}

// Stay periods helpers
export async function saveStayPeriod(period: DBStayPeriod): Promise<void> {
  await db.stayPeriods.put(period);
}

export async function getStayPeriods(userId: string): Promise<DBStayPeriod[]> {
  return db.stayPeriods.where('oderId').equals(userId).toArray();
}

export async function deleteStayPeriod(id: string): Promise<void> {
  await db.stayPeriods.delete(id);
}

// Exam questions helpers
export interface ExamQuestionData {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;
  tags?: string[];
}

export async function saveExamQuestions(questions: ExamQuestionData[]): Promise<void> {
  const cachedAt = new Date().toISOString();
  const dbQuestions: DBExamQuestion[] = questions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.stringify(q.options),
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    imageUrl: q.imageUrl,
    tags: q.tags ? JSON.stringify(q.tags) : undefined,
    cachedAt,
  }));
  await db.examQuestions.bulkPut(dbQuestions);
}

export async function getExamQuestions(): Promise<ExamQuestionData[]> {
  const dbQuestions = await db.examQuestions.toArray();
  return dbQuestions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.parse(q.options) as string[],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    imageUrl: q.imageUrl,
    tags: q.tags ? (JSON.parse(q.tags) as string[]) : undefined,
  }));
}

export async function getExamQuestionsByCategory(category: string): Promise<ExamQuestionData[]> {
  const dbQuestions = await db.examQuestions.where('category').equals(category).toArray();
  return dbQuestions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.parse(q.options) as string[],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    imageUrl: q.imageUrl,
    tags: q.tags ? (JSON.parse(q.tags) as string[]) : undefined,
  }));
}

export async function getExamQuestionsCount(): Promise<number> {
  return db.examQuestions.count();
}

export async function clearExamQuestionsCache(): Promise<void> {
  await db.examQuestions.clear();
}

// Patent regions cache helpers
export interface PatentRegionData {
  code: string;
  name: string;
  coefficient: number;
  monthlyCost: number;
}

const PATENT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function savePatentRegions(regions: PatentRegionData[]): Promise<void> {
  const cachedAt = new Date().toISOString();
  const dbRegions: DBPatentRegion[] = regions.map((r) => ({
    ...r,
    cachedAt,
  }));
  await db.patentRegions.clear();
  await db.patentRegions.bulkPut(dbRegions);
  await db.legalDataMeta.put({
    id: 'patent-regions',
    updatedAt: cachedAt,
    cachedAt,
  });
}

export async function getPatentRegions(): Promise<PatentRegionData[]> {
  const regions = await db.patentRegions.toArray();
  return regions.map(({ code, name, coefficient, monthlyCost }) => ({
    code,
    name,
    coefficient,
    monthlyCost,
  }));
}

export async function isPatentCacheValid(): Promise<boolean> {
  const meta = await db.legalDataMeta.get('patent-regions');
  if (!meta) return false;

  const cachedTime = new Date(meta.cachedAt).getTime();
  const now = Date.now();
  return now - cachedTime < PATENT_CACHE_TTL_MS;
}

export async function clearPatentRegionsCache(): Promise<void> {
  await db.patentRegions.clear();
  await db.legalDataMeta.delete('patent-regions');
}
