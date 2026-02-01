'use client';

import { FileText, Plus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { useProfileStore, useAuthStore } from '@/lib/stores';
import type { Document } from '@/lib/stores/profileStore';
import { useTranslation } from '@/lib/i18n';

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface DocumentCardProps {
  document: Document;
  language: string;
}

function DocumentCard({ document, language }: DocumentCardProps) {
  const router = useRouter();

  const typeLabels: Record<Document['type'], { ru: string; en: string }> = {
    passport: { ru: 'Паспорт', en: 'Passport' },
    migration_card: { ru: 'Миграционная карта', en: 'Migration Card' },
    registration: { ru: 'Регистрация', en: 'Registration' },
    patent: { ru: 'Патент', en: 'Patent' },
    medical: { ru: 'Мед. справка', en: 'Medical Certificate' },
    exam: { ru: 'Экзамен', en: 'Exam Certificate' },
    inn: { ru: 'ИНН', en: 'Tax ID' },
    other: { ru: 'Другое', en: 'Other' },
  };

  const label = typeLabels[document.type]?.[language === 'ru' ? 'ru' : 'en'] || document.title;

  const isExpiringSoon = document.expiryDate
    ? new Date(document.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <button
      onClick={() => router.push(`/documents/${document.id}`)}
      className={cn(
        'w-full p-3 rounded-lg border flex items-center justify-between',
        'hover:bg-accent/50 transition-colors',
        isExpiringSoon && 'border-yellow-300 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20'
      )}
    >
      <div className="flex items-center gap-3">
        <FileText className={cn('w-5 h-5', isExpiringSoon ? 'text-yellow-500' : 'text-muted-foreground')} />
        <div className="text-left">
          <p className="font-medium text-sm text-foreground">{document.title || label}</p>
          {document.expiryDate && (
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Истекает' : 'Expires'}: {new Date(document.expiryDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export function DocumentsSection() {
  const router = useRouter();
  const documents = useProfileStore((state) => state.documents);
  const subscriptionTier = useAuthStore((state) => state.subscriptionTier);
  const { language } = useTranslation();

  // Free: 3 documents max, Plus: unlimited
  const maxDocs = subscriptionTier === 'free' ? 3 : Infinity;
  const recentDocs = documents.slice(0, 3);

  const title = language === 'ru' ? 'Мои документы' : 'My Documents';
  const viewAllLabel = language === 'ru' ? 'Все' : 'View all';
  const noDocsText = language === 'ru'
    ? 'Нет добавленных документов'
    : 'No documents added';
  const addDocText = language === 'ru' ? 'Добавить документ' : 'Add Document';
  const freePlanText = language === 'ru' ? 'документов (Free план)' : 'documents (Free plan)';

  return (
    <section>
      <SectionHeader
        title={title}
        icon={FileText}
        action={
          documents.length > 0
            ? {
                label: viewAllLabel,
                onClick: () => router.push('/documents'),
              }
            : undefined
        }
      />

      <div className="space-y-2 mt-3">
        {recentDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {noDocsText}
          </p>
        ) : (
          recentDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} language={language} />
          ))
        )}

        {/* Free plan limit indicator */}
        {subscriptionTier === 'free' && documents.length > 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            {documents.length}/{maxDocs} {freePlanText}
          </div>
        )}

        {/* Add document button */}
        <Button
          variant="outline"
          fullWidth
          onClick={() => router.push('/documents/add')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {addDocText}
        </Button>
      </div>
    </section>
  );
}

export default DocumentsSection;
