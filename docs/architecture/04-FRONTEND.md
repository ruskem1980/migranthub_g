# Блок 4: Фронтенд и Мобильное Приложение

> Спецификация клиентской архитектуры MigrantHub

---

## Содержание

1. [Технологический стек](#1-технологический-стек)
2. [Структура проекта](#2-структура-проекта)
3. [State Management](#3-state-management)
4. [Локальное хранилище](#4-локальное-хранилище)
5. [Синхронизация](#5-синхронизация)
6. [Навигация](#6-навигация)
7. [PWA и Capacitor](#7-pwa-и-capacitor)
8. [Обработка ошибок](#8-обработка-ошибок)
9. [Тестирование](#9-тестирование)

---

## 1. Технологический стек

### 1.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Capacitor | 5.x | Native mobile wrapper |
| Tailwind CSS | 3.x | Styling |
| Radix UI | latest | Accessible components |

### 1.2 State & Data

| Technology | Purpose |
|------------|---------|
| Zustand | Global state management |
| React Query (TanStack) | Server state & caching |
| Dexie.js | IndexedDB wrapper |
| React Hook Form | Form handling |
| Zod | Schema validation |

### 1.3 Mobile & Native

| Technology | Purpose |
|------------|---------|
| Capacitor Camera | Document scanning |
| Capacitor Biometrics | Security |
| Capacitor Push | Notifications |
| ML Kit | On-device OCR |

---

## 2. Структура проекта

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   ├── onboarding/
│   │   └── recovery/
│   ├── (main)/                   # Main app layout
│   │   ├── @modal/               # Parallel routes for modals
│   │   ├── home/
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── add/
│   │   ├── assistant/
│   │   ├── reference/
│   │   └── profile/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── sheet.tsx
│   │   └── toast.tsx
│   ├── forms/                    # Form components
│   │   ├── document-form.tsx
│   │   ├── profile-form.tsx
│   │   └── onboarding-form.tsx
│   ├── documents/                # Document-related
│   │   ├── document-card.tsx
│   │   ├── document-list.tsx
│   │   ├── document-scanner.tsx
│   │   └── deadline-badge.tsx
│   ├── assistant/                # AI assistant
│   │   ├── chat-message.tsx
│   │   ├── chat-input.tsx
│   │   └── source-card.tsx
│   ├── navigation/               # Navigation
│   │   ├── tab-bar.tsx
│   │   ├── header.tsx
│   │   └── back-button.tsx
│   └── shared/                   # Shared components
│       ├── error-boundary.tsx
│       ├── loading.tsx
│       ├── offline-banner.tsx
│       └── smart-error.tsx
│
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-documents.ts
│   ├── use-deadlines.ts
│   ├── use-network.ts
│   ├── use-platform.ts
│   ├── use-biometrics.ts
│   └── use-deep-links.ts
│
├── stores/                       # Zustand stores
│   ├── auth.store.ts
│   ├── profile.store.ts
│   ├── documents.store.ts
│   ├── sync.store.ts
│   └── ui.store.ts
│
├── lib/                          # Utilities & services
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── billing.ts
│   │   ├── ai.ts
│   │   └── legal.ts
│   ├── db/                       # Local database
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── encryption.ts
│   ├── crypto/                   # Cryptography
│   │   ├── encryption.ts
│   │   ├── signing.ts
│   │   └── hashing.ts
│   ├── ocr/                      # OCR utilities
│   │   ├── ml-kit.ts
│   │   ├── mrz-parser.ts
│   │   └── validators.ts
│   ├── notifications/            # Notification handling
│   │   ├── push.ts
│   │   └── local.ts
│   ├── i18n/                     # Internationalization
│   │   ├── config.ts
│   │   └── translations/
│   │       ├── ru.json
│   │       ├── uz.json
│   │       ├── tg.json
│   │       ├── ky.json
│   │       └── en.json
│   ├── utils/                    # Utility functions
│   │   ├── dates.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   └── constants/                # Constants
│       ├── document-types.ts
│       ├── deadlines.ts
│       └── regions.ts
│
├── types/                        # TypeScript types
│   ├── api.ts
│   ├── documents.ts
│   ├── user.ts
│   └── navigation.ts
│
└── capacitor/                    # Capacitor-specific
    ├── plugins/
    └── config.ts
```

---

## 3. State Management

### 3.1 Store Architecture

```typescript
// stores/profile.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db/schema';

interface Profile {
  fullName?: string;
  citizenship: string;
  regionCode: string;
  entryDate: string;
  purpose: string;
  isEAEU: boolean;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const profile = await db.profile.get('profile');
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: error as Error, isLoading: false });
        }
      },

      updateProfile: async (data) => {
        const current = get().profile;
        const updated = { ...current, ...data, version: (current?.version || 0) + 1 };

        // Save locally
        await db.profile.put(updated, 'profile');

        // Queue for sync
        useSyncStore.getState().addToQueue({
          action: 'update',
          entity: 'profile',
          entityId: 'profile',
          payload: anonymizeForServer(updated)
        });

        set({ profile: updated });
      },

      clearProfile: () => set({ profile: null })
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile })
    }
  )
);

// Helper: Extract only anonymous data for server
function anonymizeForServer(profile: Profile) {
  return {
    citizenshipCode: profile.citizenship,
    regionCode: profile.regionCode,
    entryDate: profile.entryDate,
    purpose: profile.purpose,
    isEAEU: profile.isEAEU
    // fullName and other PII NOT included
  };
}
```

### 3.2 Documents Store

```typescript
// stores/documents.store.ts

import { create } from 'zustand';
import { db } from '@/lib/db/schema';
import { Document, DocumentType } from '@/types/documents';

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;

  // Actions
  loadDocuments: () => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => Promise<Document>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Selectors
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByType: (type: DocumentType) => Document[];
  getExpiringDocuments: (days: number) => Document[];
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  isLoading: false,

  loadDocuments: async () => {
    set({ isLoading: true });
    const documents = await db.documents.toArray();
    set({ documents, isLoading: false });
  },

  addDocument: async (docData) => {
    const doc: Document = {
      id: crypto.randomUUID(),
      ...docData,
      status: calculateStatus(docData.expiresDate),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    await db.documents.add(doc);

    // Add deadline if document has expiry
    if (doc.expiresDate) {
      await addDocumentDeadline(doc);
    }

    set(state => ({ documents: [...state.documents, doc] }));
    return doc;
  },

  updateDocument: async (id, data) => {
    const existing = get().documents.find(d => d.id === id);
    if (!existing) return;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
      version: existing.version + 1
    };

    await db.documents.put(updated);

    set(state => ({
      documents: state.documents.map(d => d.id === id ? updated : d)
    }));
  },

  deleteDocument: async (id) => {
    await db.documents.delete(id);
    // Also delete related deadlines
    await db.deadlines.where('documentId').equals(id).delete();

    set(state => ({
      documents: state.documents.filter(d => d.id !== id)
    }));
  },

  // Selectors
  getDocumentById: (id) => get().documents.find(d => d.id === id),

  getDocumentsByType: (type) => get().documents.filter(d => d.type === type),

  getExpiringDocuments: (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return get().documents.filter(d =>
      d.expiresDate && new Date(d.expiresDate) <= cutoff
    );
  }
}));
```

### 3.3 Sync Store

```typescript
// stores/sync.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'profile' | 'document' | 'deadline';
  entityId: string;
  payload: any;
  createdAt: Date;
  retries: number;
  lastError?: string;
}

interface SyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncAt: Date | null;

  // Actions
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries'>) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      lastSyncAt: null,

      addToQueue: (item) => {
        const queueItem: SyncQueueItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          retries: 0
        };

        set(state => ({ queue: [...state.queue, queueItem] }));
      },

      removeFromQueue: (id) => {
        set(state => ({
          queue: state.queue.filter(item => item.id !== id)
        }));
      },

      processQueue: async () => {
        const { queue, isSyncing } = get();
        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });

        for (const item of queue) {
          try {
            await syncItem(item);
            get().removeFromQueue(item.id);
          } catch (error) {
            // Update retry count
            set(state => ({
              queue: state.queue.map(q =>
                q.id === item.id
                  ? { ...q, retries: q.retries + 1, lastError: error.message }
                  : q
              )
            }));

            // Stop if too many retries
            if (item.retries >= 3) {
              console.error('Max retries reached for', item.id);
            }
          }
        }

        set({ isSyncing: false, lastSyncAt: new Date() });
      },

      clearQueue: () => set({ queue: [] })
    }),
    {
      name: 'sync-queue-storage'
    }
  )
);

async function syncItem(item: SyncQueueItem) {
  const endpoint = `/api/v1/${item.entity}s`;

  switch (item.action) {
    case 'create':
      await api.post(endpoint, item.payload);
      break;
    case 'update':
      await api.patch(`${endpoint}/${item.entityId}`, item.payload);
      break;
    case 'delete':
      await api.delete(`${endpoint}/${item.entityId}`);
      break;
  }
}
```

### 3.4 React Query Setup

```typescript
// lib/api/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes (was cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});

// hooks/use-legal.ts
import { useQuery } from '@tanstack/react-query';
import { legalApi } from '@/lib/api/legal';

export function useFaq(category?: string) {
  return useQuery({
    queryKey: ['faq', category],
    queryFn: () => legalApi.getFaq({ category }),
    staleTime: 24 * 60 * 60 * 1000  // 24 hours - laws don't change often
  });
}

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => legalApi.getRegions(),
    staleTime: 7 * 24 * 60 * 60 * 1000  // 1 week
  });
}

export function useLegalUpdates(since: Date) {
  return useQuery({
    queryKey: ['legal-updates', since.toISOString()],
    queryFn: () => legalApi.getUpdates({ since }),
    refetchInterval: 60 * 60 * 1000  // Refetch every hour
  });
}
```

---

## 4. Локальное хранилище

### 4.1 Dexie Schema

```typescript
// lib/db/schema.ts

import Dexie, { Table } from 'dexie';
import { encryptionMiddleware } from './encryption';

export interface Profile {
  id: string;
  fullName?: string;
  birthDate?: string;
  citizenship: string;
  phone?: string;
  email?: string;
  address?: string;
  entryDate: string;
  purpose: string;
  region: string;
  isEAEU: boolean;
  syncedAt?: Date;
  version: number;
}

export interface Document {
  id: string;
  type: DocumentType;
  number?: string;
  series?: string;
  issuedDate?: string;
  expiresDate?: string;
  issuedBy?: string;
  scans?: Scan[];
  status: DocumentStatus;
  daysUntilExpiry?: number;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  version: number;
}

export interface Deadline {
  id: string;
  type: DeadlineType;
  date: Date;
  documentId?: string;
  documentType?: DocumentType;
  status: DeadlineStatus;
  completedAt?: Date;
  notificationsSent: number[];
  snoozedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncQueueItem {
  id: string;
  action: SyncAction;
  entity: SyncEntity;
  entityId: string;
  payload: any;
  createdAt: Date;
  retries: number;
  lastError?: string;
}

export interface CachedLaw {
  id: string;
  code: string;
  content: string;
  version: number;
  cachedAt: Date;
  expiresAt: Date;
}

export interface Setting {
  key: string;
  value: any;
}

class MigrantHubDB extends Dexie {
  profile!: Table<Profile>;
  documents!: Table<Document>;
  deadlines!: Table<Deadline>;
  syncQueue!: Table<SyncQueueItem>;
  cachedLaws!: Table<CachedLaw>;
  settings!: Table<Setting>;

  constructor() {
    super('MigrantHubDB');

    // Version 1
    this.version(1).stores({
      profile: 'id',
      documents: 'id, type, status, expiresDate',
      deadlines: 'id, type, date, status, documentId',
      syncQueue: 'id, action, entity, createdAt',
      cachedLaws: 'id, code, expiresAt',
      settings: 'key'
    });

    // Version 2 - additional indexes
    this.version(2).stores({
      documents: 'id, type, status, expiresDate, updatedAt',
      deadlines: 'id, type, date, status, documentId, [type+status]'
    });

    // Apply encryption middleware
    this.use(encryptionMiddleware);
  }
}

export const db = new MigrantHubDB();
```

### 4.2 Encryption Middleware

```typescript
// lib/db/encryption.ts

import { getEncryptionKey, encrypt, decrypt } from '@/lib/crypto/encryption';

const ENCRYPTED_FIELDS: Record<string, string[]> = {
  profile: ['fullName', 'birthDate', 'phone', 'email', 'address'],
  documents: ['number', 'series', 'issuedBy', 'scans']
};

export const encryptionMiddleware = {
  stack: 'dbcore',
  name: 'encryptionMiddleware',

  create(downlevelDatabase: any) {
    return {
      ...downlevelDatabase,

      table(tableName: string) {
        const table = downlevelDatabase.table(tableName);
        const fieldsToEncrypt = ENCRYPTED_FIELDS[tableName];

        if (!fieldsToEncrypt) return table;

        return {
          ...table,

          // Encrypt on write
          mutate: async (req: any) => {
            if (req.type === 'put' || req.type === 'add') {
              const key = await getEncryptionKey();
              req.values = await Promise.all(
                req.values.map(async (value: any) => {
                  const encrypted = { ...value };
                  for (const field of fieldsToEncrypt) {
                    if (encrypted[field] !== undefined) {
                      encrypted[field] = await encrypt(encrypted[field], key);
                    }
                  }
                  return encrypted;
                })
              );
            }
            return table.mutate(req);
          },

          // Decrypt on read
          get: async (req: any) => {
            const result = await table.get(req);
            if (result) {
              const key = await getEncryptionKey();
              for (const field of fieldsToEncrypt) {
                if (result[field]) {
                  try {
                    result[field] = await decrypt(result[field], key);
                  } catch (e) {
                    // Field not encrypted or corrupted
                  }
                }
              }
            }
            return result;
          },

          query: async (req: any) => {
            const result = await table.query(req);
            const key = await getEncryptionKey();

            result.result = await Promise.all(
              result.result.map(async (item: any) => {
                for (const field of fieldsToEncrypt) {
                  if (item[field]) {
                    try {
                      item[field] = await decrypt(item[field], key);
                    } catch (e) {
                      // Field not encrypted or corrupted
                    }
                  }
                }
                return item;
              })
            );

            return result;
          }
        };
      }
    };
  }
};
```

### 4.3 Database Migrations

```typescript
// lib/db/migrations.ts

import { db } from './schema';

export async function runMigrations() {
  const currentVersion = await db.settings.get('db_version');
  const version = currentVersion?.value || 0;

  if (version < 1) {
    await migrateToV1();
  }

  if (version < 2) {
    await migrateToV2();
  }

  await db.settings.put({ key: 'db_version', value: 2 });
}

async function migrateToV1() {
  // Initial setup - nothing to migrate
  console.log('Migration to v1 complete');
}

async function migrateToV2() {
  // Add version field to all documents
  await db.documents.toCollection().modify(doc => {
    if (!doc.version) doc.version = 1;
  });

  console.log('Migration to v2 complete');
}
```

---

## 5. Синхронизация

### 5.1 Background Sync

```typescript
// lib/sync/background-sync.ts

import { useSyncStore } from '@/stores/sync.store';
import { useNetworkStore } from '@/stores/network.store';

export class BackgroundSyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;

    // Sync every 5 minutes when online
    this.intervalId = setInterval(() => {
      this.syncIfOnline();
    }, 5 * 60 * 1000);

    // Also sync on network reconnect
    window.addEventListener('online', () => this.syncIfOnline());

    // Initial sync
    this.syncIfOnline();

    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async syncIfOnline() {
    const isOnline = navigator.onLine;
    if (!isOnline) return;

    const { queue, processQueue } = useSyncStore.getState();
    if (queue.length > 0) {
      await processQueue();
    }
  }
}

export const backgroundSync = new BackgroundSyncService();
```

### 5.2 Service Worker Sync

```typescript
// public/sw.js (Service Worker)

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  // Get queue from IndexedDB
  const db = await openDB('MigrantHubDB', 2);
  const queue = await db.getAll('syncQueue');

  for (const item of queue) {
    try {
      await fetch(`/api/v1/${item.entity}s`, {
        method: getMethod(item.action),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload)
      });

      // Remove from queue on success
      await db.delete('syncQueue', item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

### 5.3 Offline Queue Hook

```typescript
// hooks/use-offline-queue.ts

import { useEffect } from 'react';
import { useSyncStore } from '@/stores/sync.store';

export function useOfflineQueue() {
  const { queue, processQueue, isSyncing } = useSyncStore();

  // Process queue when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0 && !isSyncing) {
        processQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queue.length, isSyncing, processQueue]);

  // Register for background sync if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-queue');
      });
    }
  }, [queue.length]);

  return {
    pendingCount: queue.length,
    isSyncing,
    sync: processQueue
  };
}
```

---

## 6. Навигация

### 6.1 Tab Navigation

```typescript
// components/navigation/tab-bar.tsx

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, FileText, MessageCircle, Book, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', icon: Home, label: 'Главная' },
  { href: '/documents', icon: FileText, label: 'Документы' },
  { href: '/assistant', icon: MessageCircle, label: 'Помощник' },
  { href: '/reference', icon: Book, label: 'Справочник' },
  { href: '/profile', icon: User, label: 'Профиль' }
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center py-2 px-4 min-w-[64px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 6.2 Modal Navigation

```typescript
// app/(main)/@modal/(.)documents/[id]/page.tsx

import { Modal } from '@/components/ui/modal';
import { DocumentView } from '@/components/documents/document-view';

export default function DocumentModal({
  params
}: {
  params: { id: string }
}) {
  return (
    <Modal>
      <DocumentView id={params.id} />
    </Modal>
  );
}
```

### 6.3 Deep Links

```typescript
// hooks/use-deep-links.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';

export function useDeepLinks() {
  const router = useRouter();

  useEffect(() => {
    const handleAppUrlOpen = App.addListener('appUrlOpen', ({ url }) => {
      const path = new URL(url).pathname;

      const routes: Record<string, string> = {
        '/documents': '/documents',
        '/assistant': '/assistant',
        '/legal': '/reference',
        '/invite': '/onboarding/invite'
      };

      for (const [pattern, route] of Object.entries(routes)) {
        if (path.startsWith(pattern)) {
          router.push(path.replace(pattern, route));
          return;
        }
      }
    });

    return () => {
      handleAppUrlOpen.remove();
    };
  }, [router]);
}
```

### 6.4 Back Button Handler

```typescript
// hooks/use-back-button.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { useNavigationStore } from '@/stores/navigation.store';

export function useBackButton() {
  const router = useRouter();
  const { modals, sheets, closeTopModal, closeTopSheet } = useNavigationStore();

  useEffect(() => {
    const handler = App.addListener('backButton', ({ canGoBack }) => {
      // Priority: sheet → modal → page
      if (sheets.length > 0) {
        closeTopSheet();
        return;
      }

      if (modals.length > 0) {
        closeTopModal();
        return;
      }

      if (canGoBack) {
        router.back();
      } else {
        // Show exit confirmation
        showExitConfirmation();
      }
    });

    return () => {
      handler.remove();
    };
  }, [sheets.length, modals.length, router]);
}
```

---

## 7. PWA и Capacitor

### 7.1 Capacitor Config

```typescript
// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.migranthub.app',
  appName: 'MigrantHub',
  webDir: 'out',
  bundledWebRuntime: false,

  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      showSpinner: false
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },

    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },

    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff'
    }
  },

  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false // Disable in production
  },

  ios: {
    contentInset: 'automatic'
  }
};

export default config;
```

### 7.2 PWA Configuration

```typescript
// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.migranthub\.ru\/api\/v1\/legal\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'legal-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.migranthub\.ru\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    }
  ],

  fallbacks: {
    document: '/offline'
  }
});

module.exports = withPWA({
  // Next.js config
});
```

### 7.3 Platform Detection

```typescript
// hooks/use-platform.ts

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

type Platform = 'web' | 'ios' | 'android';

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const p = Capacitor.getPlatform() as Platform;
    setPlatform(p);
  }, []);

  return {
    platform,
    isNative: platform !== 'web',
    isWeb: platform === 'web',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android'
  };
}
```

---

## 8. Обработка ошибок

### 8.1 Smart Error Component

```typescript
// components/shared/smart-error.tsx

import { AlertCircle, WifiOff, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { ErrorCode, getErrorGuidance } from '@/lib/errors';

interface SmartErrorProps {
  error: AppError;
  context: 'document' | 'ai' | 'payment' | 'sync';
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function SmartError({ error, context, onRetry, onDismiss }: SmartErrorProps) {
  const { t } = useTranslation();
  const guidance = getErrorGuidance(error, context);

  return (
    <Card className="p-4 border-destructive/50 bg-destructive/5">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getSeverityColor(guidance.severity)}`}>
          <guidance.icon className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{guidance.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {guidance.message}
          </p>

          {guidance.tips && (
            <ul className="mt-2 space-y-1">
              {guidance.tips.map((tip, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {tip}
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 mt-4">
            {guidance.primaryAction && (
              <Button
                size="sm"
                onClick={guidance.primaryAction.handler}
              >
                {guidance.primaryAction.label}
              </Button>
            )}

            {guidance.secondaryAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={guidance.secondaryAction.handler}
              >
                {guidance.secondaryAction.label}
              </Button>
            )}
          </div>

          {guidance.helpArticle && (
            <a
              href={guidance.helpArticle}
              className="text-sm text-primary mt-2 inline-flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" />
              {t('errors.learnMore')}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
```

### 8.2 Error Guidance

```typescript
// lib/errors/guidance.ts

interface ErrorGuidance {
  icon: LucideIcon;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  tips?: string[];
  primaryAction?: { label: string; handler: () => void };
  secondaryAction?: { label: string; handler: () => void };
  helpArticle?: string;
}

export function getErrorGuidance(
  error: AppError,
  context: string
): ErrorGuidance {
  const code = error.code as ErrorCode;

  const guidance: Record<ErrorCode, ErrorGuidance> = {
    NETWORK_OFFLINE: {
      icon: WifiOff,
      severity: 'warning',
      title: t('errors.offline.title'),
      message: t('errors.offline.message'),
      tips: [
        t('errors.offline.tip1'),
        t('errors.offline.tip2')
      ],
      primaryAction: {
        label: t('common.understood'),
        handler: () => {}
      }
    },

    AI_UNAVAILABLE: {
      icon: AlertCircle,
      severity: 'warning',
      title: t('errors.aiUnavailable.title'),
      message: t('errors.aiUnavailable.message'),
      primaryAction: {
        label: t('errors.aiUnavailable.goToReference'),
        handler: () => router.push('/reference')
      },
      secondaryAction: {
        label: t('common.retry'),
        handler: () => onRetry?.()
      }
    },

    SUBSCRIPTION_REQUIRED: {
      icon: Lock,
      severity: 'info',
      title: t('errors.subscriptionRequired.title'),
      message: t('errors.subscriptionRequired.message'),
      primaryAction: {
        label: t('errors.subscriptionRequired.upgrade'),
        handler: () => router.push('/subscription')
      }
    },

    // ... more error codes
  };

  return guidance[code] || getDefaultGuidance(error);
}
```

---

## 9. Тестирование

### 9.1 Unit Tests

```typescript
// __tests__/utils/dates.test.ts

import { describe, it, expect } from 'vitest';
import { calculateDaysLeft, calculate90_180Rule } from '@/lib/utils/dates';

describe('calculateDaysLeft', () => {
  it('returns correct days for future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    expect(calculateDaysLeft(futureDate)).toBe(30);
  });

  it('returns negative for past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    expect(calculateDaysLeft(pastDate)).toBe(-5);
  });
});

describe('calculate90_180Rule', () => {
  it('calculates correctly for single entry', () => {
    const entries = [
      { entryDate: '2024-01-15', exitDate: null }
    ];

    const result = calculate90_180Rule(entries);

    expect(result.daysUsed).toBeGreaterThan(0);
    expect(result.daysRemaining).toBeLessThanOrEqual(90);
  });

  it('warns when limit reached', () => {
    const entries = [
      { entryDate: '2024-01-01', exitDate: '2024-03-31' }
    ];

    const result = calculate90_180Rule(entries);

    expect(result.daysUsed).toBe(90);
    expect(result.warnings).toContain('LIMIT_REACHED');
  });
});
```

### 9.2 Component Tests

```typescript
// __tests__/components/DocumentCard.test.tsx

import { render, screen } from '@testing-library/react';
import { DocumentCard } from '@/components/documents/document-card';

describe('DocumentCard', () => {
  const mockDocument = {
    id: '1',
    type: 'patent',
    number: '123456',
    expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring'
  };

  it('shows expiring warning when < 30 days', () => {
    render(<DocumentCard document={mockDocument} />);

    expect(screen.getByText(/истекает/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('warning');
  });

  it('displays document number', () => {
    render(<DocumentCard document={mockDocument} />);

    expect(screen.getByText('123456')).toBeInTheDocument();
  });
});
```

### 9.3 E2E Tests

```typescript
// e2e/critical-flows.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('onboarding → document add → deadline check', async ({ page }) => {
    // Onboarding
    await page.goto('/');
    await page.click('[data-testid="start-onboarding"]');
    await page.selectOption('[data-testid="citizenship"]', 'UZ');
    await page.fill('[data-testid="entry-date"]', '2024-01-15');
    await page.click('[data-testid="continue"]');

    // Add document
    await page.click('[data-testid="add-document"]');
    await page.selectOption('[data-testid="doc-type"]', 'patent');
    await page.fill('[data-testid="doc-expires"]', '2024-06-15');
    await page.click('[data-testid="save"]');

    // Check deadline
    await expect(page.locator('[data-testid="deadline-warning"]'))
      .toContainText('Осталось');
  });

  test('offline mode works', async ({ page, context }) => {
    await page.goto('/documents');

    // Go offline
    await context.setOffline(true);

    // Should still work
    await page.click('[data-testid="add-document"]');
    await expect(page.locator('[data-testid="offline-badge"]'))
      .toBeVisible();

    // Data saves locally
    await page.fill('[data-testid="doc-number"]', '123456');
    await page.click('[data-testid="save"]');

    await expect(page.locator('[data-testid="sync-pending"]'))
      .toBeVisible();
  });
});
```

### 9.4 Legal Calculation Tests (CRITICAL)

```typescript
// __tests__/legal/calculations.test.ts

describe('Legal Calculations - CRITICAL', () => {
  describe('Registration Deadlines', () => {
    test.each([
      { citizenship: 'UZ', isEAEU: false, expected: 7 },
      { citizenship: 'KZ', isEAEU: true, expected: 30 },
      { citizenship: 'TJ', isEAEU: false, expected: 15 },
      { citizenship: 'KG', isEAEU: true, expected: 30 }
    ])('$citizenship registration deadline is $expected days',
      ({ citizenship, isEAEU, expected }) => {
        expect(getRegistrationDeadline(citizenship, isEAEU)).toBe(expected);
      }
    );
  });

  describe('Patent Payment Deadline', () => {
    it('calculates first payment deadline correctly', () => {
      const patent = { issueDate: '2024-01-15', region: 'moscow' };
      const deadline = calculatePatentPaymentDeadline(patent);

      expect(deadline.nextPayment).toBe('2024-02-15');
    });

    it('warns 7 days before deadline', () => {
      const warnings = getPatentWarnings({
        nextPayment: addDays(new Date(), 5)
      });

      expect(warnings).toContain('PAYMENT_DUE_SOON');
    });
  });
});
```

---

*Документ: 04-FRONTEND.md*
*Блок 4 из 6 архитектурной документации MigrantHub*
