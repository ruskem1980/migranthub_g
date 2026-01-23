'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { DocumentWizard, FORMS_REGISTRY, CATEGORY_LABELS, type FormCategory } from '@/features/documents';
import { useProfileStore } from '@/lib/stores';

interface GeneratedDocument {
  id: string;
  formId: string;
  title: string;
  createdAt: string;
  status: 'draft' | 'completed';
}

export default function DocumentsPage() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);
  const { profile } = useProfileStore();

  // Demo: show some generated documents
  const [documents] = useState<GeneratedDocument[]>([
    {
      id: '1',
      formId: 'notification-arrival',
      title: 'Уведомление о прибытии',
      createdAt: new Date().toISOString(),
      status: 'completed',
    },
  ]);

  const profileData = profile || {
    fullName: 'Усманов Алишер Бахтиярович',
    passportNumber: 'AA 1234567',
    citizenship: 'UZB',
    birthDate: '1990-05-15',
    entryDate: '2024-01-01',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
          Создать
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {FORMS_REGISTRY.length}
                </div>
                <div className="text-sm text-gray-500">Доступных форм</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {documents.length}
                </div>
                <div className="text-sm text-gray-500">Создано</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated documents */}
        {documents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Созданные документы
            </h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {doc.title}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Готов
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create new button */}
        <button
          onClick={() => setShowWizard(true)}
          className="w-full flex items-center justify-center gap-3 p-6 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-blue-600">Создать новый документ</span>
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Как это работает?
          </h3>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Выберите нужный документ из списка</li>
            <li>2. Заполните недостающие данные (если нужно)</li>
            <li>3. Проверьте информацию</li>
            <li>4. Скачайте готовый PDF</li>
          </ol>
        </div>
      </div>

      {/* Document Wizard */}
      {showWizard && (
        <DocumentWizard
          profileData={profileData}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
