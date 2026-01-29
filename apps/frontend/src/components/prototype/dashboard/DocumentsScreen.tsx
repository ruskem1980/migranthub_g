'use client';

import { useState, useCallback } from 'react';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Share2, Info, Lock, X, Download, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

type InstructionModal = {
  isOpen: boolean;
  title: string;
  content: string;
};

export function DocumentsScreen() {
  const { t } = useTranslation();
  const [instructionModal, setInstructionModal] = useState<InstructionModal>({
    isOpen: false,
    title: '',
    content: '',
  });

  const handleShare = useCallback(async (docTitle: string) => {
    const shareData = {
      title: docTitle,
      text: `${docTitle} - MigrantHub`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${docTitle}\n${window.location.href}`);
        alert(t('common.copied'));
      }
    } catch {
      // User cancelled or error - silently ignore
    }
  }, [t]);

  const handleInstruction = useCallback((docKey: string, docTitle: string) => {
    // Map document keys to instruction keys in localization
    const instructionKeyMap: Record<string, string> = {
      passport: 'passport',
      mig_card: 'migCard',
      registration: 'registration',
      green_card: 'greenCard',
      education: 'education',
      patent: 'patent',
      contract: 'contract',
      receipts: 'receipts',
      insurance: 'insurance',
      inn: 'inn',
      family: 'family',
    };

    const instructionKey = instructionKeyMap[docKey] || docKey;
    const instruction = t(`sos.documentRecovery.${instructionKey}.instruction`);

    setInstructionModal({
      isOpen: true,
      title: docTitle,
      content: instruction,
    });
  }, [t]);

  const closeModal = useCallback(() => {
    setInstructionModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const documents = [
    // УРОВЕНЬ 1: ОСНОВА
    {
      key: 'passport',
      title: t('documents.types.passport'),
      status: 'active',
      statusText: t('documents.statusText.active'),
      icon: '🛂',
      color: 'green',
      hasFile: true,
    },

    // УРОВЕНЬ 2: ВЪЕЗД И ПРЕБЫВАНИЕ
    {
      key: 'mig_card',
      title: t('documents.types.migCard'),
      status: 'active',
      statusText: t('documents.statusText.activeF'),
      icon: '🎫',
      color: 'green',
      hasFile: true,
    },
    {
      key: 'registration',
      title: t('documents.types.registration'),
      status: 'error',
      statusText: t('documents.statusText.expired'),
      icon: '📋',
      color: 'red',
      action: t('documents.actions.update'),
      hasFile: false,
    },

    // УРОВЕНЬ 3: РАБОТА
    {
      key: 'green_card',
      title: t('documents.types.greenCard'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '💳',
      color: 'gray',
      action: t('documents.actions.add'),
      hasFile: false,
    },
    {
      key: 'education',
      title: t('documents.types.education'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '🎓',
      color: 'gray',
      action: t('documents.actions.add'),
      hasFile: false,
    },
    {
      key: 'patent',
      title: t('documents.types.patent'),
      status: 'warning',
      statusText: t('documents.statusText.payIn', { days: '3' }),
      icon: '📄',
      color: 'yellow',
      action: t('documents.actions.extend'),
      hasFile: true,
    },
    {
      key: 'contract',
      title: t('documents.types.contract'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '📝',
      color: 'gray',
      action: t('documents.actions.add'),
      hasFile: false,
    },

    // УРОВЕНЬ 4: ПОДДЕРЖКА
    {
      key: 'receipts',
      title: t('documents.types.receipts'),
      status: 'active',
      statusText: t('documents.statusText.activePl'),
      icon: '🧾',
      color: 'green',
      hasFile: true,
    },
    {
      key: 'insurance',
      title: t('documents.types.insurance'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '🩺',
      color: 'gray',
      action: t('documents.actions.apply'),
      hasFile: false,
    },
    {
      key: 'inn',
      title: t('documents.types.inn'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '🔢',
      color: 'gray',
      action: t('documents.actions.get'),
      hasFile: false,
    },
    {
      key: 'family',
      title: t('documents.types.family'),
      status: 'missing',
      statusText: t('documents.statusText.missing'),
      icon: '💍',
      color: 'gray',
      action: t('documents.actions.add'),
      hasFile: false,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 flex-shrink-0 relative z-20">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">{t('documents.title')}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">{t('documents.encrypted')}</span>
            </div>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
        <p className="text-sm text-gray-500">{t('documents.activeRegistry')}</p>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-4 py-6 h-full">
          {documents.map((doc, index) => {
            const statusConfig = {
              green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                icon: CheckCircle2,
                iconColor: 'text-green-600',
                textColor: 'text-green-700',
                button: 'bg-green-600 hover:bg-green-700',
              },
              yellow: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: AlertTriangle,
                iconColor: 'text-yellow-600',
                textColor: 'text-yellow-700',
                button: 'bg-yellow-600 hover:bg-yellow-700',
              },
              red: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: XCircle,
                iconColor: 'text-red-600',
                textColor: 'text-red-700',
                button: 'bg-red-600 hover:bg-red-700',
              },
              gray: {
                bg: 'bg-gray-50',
                border: 'border-gray-300',
                icon: XCircle,
                iconColor: 'text-gray-500',
                textColor: 'text-gray-600',
                button: 'bg-blue-600 hover:bg-blue-700',
              },
            }[doc.color as 'green' | 'yellow' | 'red' | 'gray'] || {
              bg: 'bg-gray-50',
              border: 'border-gray-300',
              icon: XCircle,
              iconColor: 'text-gray-500',
              textColor: 'text-gray-600',
              button: 'bg-blue-600 hover:bg-blue-700',
            };

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={index}
                className={`flex-shrink-0 w-72 ${statusConfig.bg} border-2 ${statusConfig.border} rounded-3xl p-6 shadow-xl transition-transform hover:scale-105 active:scale-100`}
              >
                {/* Icon */}
                <div className="text-7xl text-center mb-4">{doc.icon}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  {doc.title}
                </h3>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                  <span className={`font-semibold ${statusConfig.textColor}`}>
                    {doc.statusText}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {doc.hasFile ? (
                    <button
                      className={`w-full ${statusConfig.button} text-white font-semibold py-3 px-4 rounded-xl transition-colors active:scale-98 shadow-lg`}
                    >
                      {doc.action}
                    </button>
                  ) : (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors active:scale-98 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      {t('documents.scanOcr')}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare(doc.title)}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-1 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      {t('common.share')}
                    </button>
                    <button
                      onClick={() => handleInstruction(doc.key, doc.title)}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-1 text-sm"
                    >
                      <Info className="w-4 h-4" />
                      {t('documents.instruction')}
                    </button>
                  </div>

                  {/* Document Actions */}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors active:scale-98">
                      <Download className="w-3 h-3" /> {t('common.download')}
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors active:scale-98">
                      <Pencil className="w-3 h-3" /> {t('common.edit')}
                    </button>
                    <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors active:scale-98">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center z-40"
        aria-label={t('documents.scanOcr')}
      >
        <div className="flex flex-col items-center">
          <Camera className="w-6 h-6" />
          <span className="text-xs mt-0.5">OCR</span>
        </div>
      </button>

      {/* Instruction Modal */}
      {instructionModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {instructionModal.title}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {instructionModal.content}
            </p>
            <button
              onClick={closeModal}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
