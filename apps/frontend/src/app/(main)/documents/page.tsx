'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, FileText, CreditCard, Briefcase, Home } from 'lucide-react';
import {
  DocumentWizard,
  DocumentsList,
  documentTypeLabels,
  type DocumentTypeValue,
} from '@/features/documents';
import { useDocumentStorage } from '@/features/documents/hooks/useDocumentStorage';
import { useProfileStore } from '@/lib/stores';
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
};

export default function DocumentsPage() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [documents, setDocuments] = useState<TypedDocument[]>([]);
  const { profile } = useProfileStore();
  const { getDocuments, isLoading, deleteDocument } = useDocumentStorage();

  // Загрузка документов
  const loadDocuments = useCallback(async () => {
    if (!profile?.id) return;

    const result = await getDocuments(profile.id);
    if (result.success) {
      setDocuments(result.data);
    }
  }, [profile?.id, getDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Обработчик обновления
  const handleRefresh = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  // Открыть селектор типа документа
  const handleAddDocument = useCallback(() => {
    setShowTypeSelector(true);
  }, []);

  // Выбрать тип документа и открыть мастер создания
  const handleSelectType = useCallback((_type: DocumentTypeValue) => {
    setShowTypeSelector(false);
    // Открываем DocumentWizard вместо навигации на несуществующую страницу
    setShowWizard(true);
  }, []);

  // Перейти к детальной странице документа
  const handleSelectDocument = useCallback(
    (document: TypedDocument) => {
      router.push(`/documents/${document.id}`);
    },
    [router]
  );

  // Удаление документа
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

  const profileData = profile || {
    fullName: 'Усманов Алишер Бахтиярович',
    passportNumber: 'AA 1234567',
    citizenship: 'UZB',
    birthDate: '1990-05-15',
    entryDate: '2024-01-01',
  };

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
          <h1 className="text-lg font-bold text-gray-900">Мои документы</h1>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Формы
        </button>
      </div>

      {/* Documents List */}
      <DocumentsList
        documents={documents}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onAddDocument={handleAddDocument}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
        showWarnings={true}
        showFilters={documents.length > 3}
        emptyStateAction={handleAddDocument}
      />

      {/* Document Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Добавить документ
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
                Все данные хранятся только на вашем устройстве в зашифрованном
                виде
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
        />
      )}
    </div>
  );
}
