'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, X, FileText, CreditCard, Briefcase, Home, Hash, UserCheck, HeartPulse, User } from 'lucide-react';
import { ProfileForm } from '@/features/profile/components';
import { useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { previewDocumentPDF, downloadDocumentPDF } from '@/features/documents/utils/generateDocumentPDF';
import {
  DocumentWizard,
  DocumentsList,
  PassportForm,
  MigrationCardForm,
  PatentForm,
  RegistrationForm,
  documentTypeLabels,
  type DocumentTypeValue,
} from '@/features/documents';
import { useDocumentStorage } from '@/features/documents/hooks/useDocumentStorage';
import type { TypedDocument } from '@/lib/db/types';

const documentTypeConfig: Record<
  DocumentTypeValue,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  passport: {
    icon: CreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Основной документ удостоверяющий личность',
  },
  migration_card: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Подтверждение легального въезда в РФ',
  },
  patent: {
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Разрешение на работу для иностранцев',
  },
  registration: {
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Миграционный учёт по месту пребывания',
  },
  inn: {
    icon: Hash,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Идентификационный номер налогоплательщика',
  },
  snils: {
    icon: UserCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    description: 'Страховой номер индивидуального лицевого счёта',
  },
  dms: {
    icon: HeartPulse,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Добровольное медицинское страхование',
  },
};

// Типы документов с формами ввода (остальные в разработке)
const SUPPORTED_FORM_TYPES: DocumentTypeValue[] = ['passport', 'migration_card', 'patent', 'registration'];

type TabType = 'profile' | 'documents';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const { t } = useTranslation();

  // Tab state from URL or default
  const initialTab = (searchParams.get('tab') as TabType) || 'profile';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Documents state
  const [showWizard, setShowWizard] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentTypeValue | null>(null);
  const [documents, setDocuments] = useState<TypedDocument[]>([]);
  const { getDocuments, isLoading: isDocumentsLoading, deleteDocument } = useDocumentStorage();

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Profile submit handler
  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // If no profile exists, create one
      if (!profile) {
        const newProfile = {
          id: crypto.randomUUID(),
          userId: crypto.randomUUID(), // Would come from auth
          ...data,
          language: 'ru',
          onboardingCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProfile(newProfile);
      } else {
        updateProfile(data);
      }

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Documents loading
  const loadDocuments = useCallback(async () => {
    if (!profile?.id) return;

    const result = await getDocuments(profile.id);
    if (result.success) {
      setDocuments(result.data);
    }
  }, [profile?.id, getDocuments]);

  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab, loadDocuments]);

  // Document handlers
  const handleRefresh = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  const handleAddDocument = useCallback(() => {
    setShowTypeSelector(true);
  }, []);

  const handleSelectType = useCallback((type: DocumentTypeValue) => {
    setShowTypeSelector(false);
    if (SUPPORTED_FORM_TYPES.includes(type)) {
      setEditingDocumentType(type);
    } else {
      alert(`Форма для "${documentTypeLabels[type]}" в разработке`);
    }
  }, []);

  const handleFormClose = useCallback(() => {
    setEditingDocumentType(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setEditingDocumentType(null);
    loadDocuments();
  }, [loadDocuments]);

  const handleSelectDocument = useCallback(
    (document: TypedDocument) => {
      router.push(`/documents/${document.id}`);
    },
    [router]
  );

  const handleDeleteDocument = useCallback(
    async (document: TypedDocument) => {
      const confirmed = window.confirm(
        `Удалить "${documentTypeLabels[document.type]}"? Это действие нельзя отменить.`
      );

      if (confirmed) {
        const result = await deleteDocument(document.id);
        if (result.success) {
          setDocuments((prev) => prev.filter((d) => d.id !== document.id));
        }
      }
    },
    [deleteDocument]
  );

  const handlePreviewDocument = useCallback(async (document: TypedDocument) => {
    try {
      await previewDocumentPDF(document);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Ошибка при создании PDF');
    }
  }, []);

  const handleDownloadDocument = useCallback(async (document: TypedDocument) => {
    try {
      await downloadDocumentPDF(document);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Ошибка при скачивании PDF');
    }
  }, []);

  const profileData = profile || {};

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{t('profile.title')}</h1>
        </div>
        {activeTab === 'documents' && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            PDF
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            {t('profile.tab.profile')}
          </button>
          <button
            onClick={() => handleTabChange('documents')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            {t('profile.tab.documents')}
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
          <ProfileForm
            initialData={profile || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Documents Tab Content */}
      {activeTab === 'documents' && (
        <DocumentsList
          documents={documents}
          isLoading={isDocumentsLoading}
          onRefresh={handleRefresh}
          onAddDocument={handleAddDocument}
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={handleDeleteDocument}
          onPreviewDocument={handlePreviewDocument}
          onDownloadDocument={handleDownloadDocument}
          showWarnings={true}
          showFilters={documents.length > 3}
          emptyStateAction={handleAddDocument}
        />
      )}

      {/* Document Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {t('documents.addDocument')}
              </h2>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Document Types */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(
                Object.entries(documentTypeConfig) as [
                  DocumentTypeValue,
                  (typeof documentTypeConfig)[DocumentTypeValue],
                ][]
              ).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all active:scale-[0.98] text-left"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`}
                    >
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {documentTypeLabels[type]}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {t('documents.localStorageNote')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Wizard (for forms generation) */}
      {showWizard && (
        <DocumentWizard
          profileData={profileData}
          onClose={() => setShowWizard(false)}
          onSaveProfileData={updateProfile}
        />
      )}

      {/* Document Input Forms */}
      {editingDocumentType && profile?.id && (
        <div className="fixed inset-0 z-50 bg-white">
          {editingDocumentType === 'passport' && (
            <PassportForm
              userId={profile.id}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          )}
          {editingDocumentType === 'migration_card' && (
            <MigrationCardForm
              userId={profile.id}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          )}
          {editingDocumentType === 'patent' && (
            <PatentForm
              userId={profile.id}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          )}
          {editingDocumentType === 'registration' && (
            <RegistrationForm
              userId={profile.id}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          )}
        </div>
      )}
    </div>
  );
}
