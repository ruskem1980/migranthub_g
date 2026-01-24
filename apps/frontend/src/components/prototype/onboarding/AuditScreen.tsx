'use client';

import { Check, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface AuditScreenProps {
  onNext: (checkedItems: string[]) => void;
}

interface DocumentItem {
  id: string;
  labelKey: string;
  subtitleKey?: string;
  isNew?: boolean;
}

export function AuditScreen({ onNext }: AuditScreenProps) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<string[]>([]);

  const items: DocumentItem[] = [
    { id: 'passport', labelKey: 'audit.documents.passport' },
    { id: 'mig_card', labelKey: 'audit.documents.migCard' },
    { id: 'registration', labelKey: 'audit.documents.registration' },
    { id: 'green_card', labelKey: 'audit.documents.greenCard', subtitleKey: 'audit.documents.greenCardSubtitle', isNew: true },
    { id: 'education', labelKey: 'audit.documents.education', subtitleKey: 'audit.documents.educationSubtitle', isNew: true },
    { id: 'patent', labelKey: 'audit.documents.patent' },
    { id: 'contract', labelKey: 'audit.documents.contract', subtitleKey: 'audit.documents.contractSubtitle', isNew: true },
    { id: 'receipts', labelKey: 'audit.documents.receipts' },
    { id: 'insurance', labelKey: 'audit.documents.insurance' },
    { id: 'inn', labelKey: 'audit.documents.inn' },
    { id: 'family', labelKey: 'audit.documents.family', subtitleKey: 'audit.documents.familySubtitle', isNew: true },
  ];

  const toggleItem = (id: string) => {
    setChecked(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header with Language Switcher */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">MigrantHub</h1>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('audit.title')}
          </h2>
          <p className="text-gray-600">
            {t('audit.subtitle')}
          </p>
        </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = checked.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all active:scale-98 relative ${
                  isChecked
                    ? 'bg-green-50 border-green-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* New Badge */}
                {item.isNew && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                    {t('common.new')}
                  </div>
                )}

                {/* Checkbox */}
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}>
                  {isChecked && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                </div>

                {/* Label and Subtitle */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${
                      isChecked ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {t(item.labelKey)}
                    </span>
                    {item.subtitleKey && (
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  {item.subtitleKey && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t(item.subtitleKey)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional Logic Hint */}
        {checked.includes('receipts') && !checked.includes('patent') && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>{t('audit.hint')}:</strong> {t('audit.receiptsHint')}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>{t('audit.tip')}:</strong> {t('audit.tipText')}
          </p>
        </div>
        </div>

        <button
          onClick={() => onNext(checked)}
          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all active:scale-98 shadow-lg"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
}
