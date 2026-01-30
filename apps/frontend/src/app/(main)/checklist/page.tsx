'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ClipboardList, CheckCircle2, Circle } from 'lucide-react';

// Placeholder checklist items - to be replaced with actual data
const checklistItems = [
  { id: '1', title: 'checklist.items.migration_card', completed: false },
  { id: '2', title: 'checklist.items.registration', completed: false },
  { id: '3', title: 'checklist.items.patent', completed: false },
  { id: '4', title: 'checklist.items.medical', completed: false },
  { id: '5', title: 'checklist.items.fingerprints', completed: false },
];

export default function ChecklistPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 safe-area-top">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">{t('checklist.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('checklist.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('checklist.required_documents')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                  {t(item.title)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card variant="outlined">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('checklist.info')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
