'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  userId: string;

  // Personal Info
  fullName: string;
  fullNameLatin?: string;
  birthDate?: string;
  gender?: 'male' | 'female';

  // Passport
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  citizenship: string;

  // Migration Info
  entryDate?: string;
  migrationCardNumber?: string;
  migrationCardExpiry?: string;
  purpose?: 'work' | 'study' | 'tourist' | 'private';
  selectedDocuments?: string[];

  // Registration
  registrationAddress?: string;
  registrationExpiry?: string;
  hostFullName?: string;
  hostAddress?: string;

  // Work
  hasPatent?: boolean;
  patentRegion?: string;
  patentExpiry?: string;
  employerName?: string;
  employerINN?: string;

  // Contact
  phone?: string;
  email?: string;

  // Meta
  language: 'ru' | 'uz' | 'tg' | 'ky';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'migration_card' | 'registration' | 'patent' | 'medical' | 'exam' | 'inn' | 'other';
  title: string;
  fileUri?: string;
  thumbnailUri?: string;
  ocrData?: Record<string, string>;
  expiryDate?: string;
  createdAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // Profile actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  // Document actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  removeDocument: (id: string) => void;

  // Status
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  documents: [],
  isLoading: false,
  error: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) =>
        set({ profile, error: null }),

      updateProfile: (data) =>
        set((state) => {
          if (state.profile) {
            // Update existing profile
            return {
              profile: { ...state.profile, ...data, updatedAt: new Date().toISOString() },
            };
          } else {
            // Create new profile with provided data
            const now = new Date().toISOString();
            return {
              profile: {
                id: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                fullName: '',
                passportNumber: '',
                citizenship: '',
                language: 'ru',
                onboardingCompleted: false,
                createdAt: now,
                updatedAt: now,
                ...data,
              } as UserProfile,
            };
          }
        }),

      setDocuments: (documents) =>
        set({ documents }),

      addDocument: (document) =>
        set((state) => ({
          documents: [...state.documents, document],
        })),

      updateDocument: (id, data) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...data } : doc
          ),
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        })),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'migranthub-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        documents: state.documents,
      }),
    }
  )
);
