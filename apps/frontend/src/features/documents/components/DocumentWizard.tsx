'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, ChevronRight, ChevronLeft, FileText, Download, Share2, Check, AlertCircle } from 'lucide-react';
import {
  FORMS_BY_CATEGORY,
  CATEGORY_LABELS,
  getMissingFields,
  FIELD_LABELS,
  FIELD_SOURCE_DOCUMENT,
  type FormDefinition,
  type FormCategory,
} from '../formsRegistry';
import { downloadPDF, sharePDF } from '../pdfGenerator';
import { MissingFieldsForm } from './MissingFieldsForm';
import { PassportScanner } from '@/features/profile/components/PassportScanner';
import { getSampleData, type DocumentType } from '../sampleData';
import { useTranslation } from '@/lib/i18n';
import { getMissingDocuments, type MissingDocumentsResult } from '../utils/getMissingDocuments';

interface DocumentWizardProps {
  profileData: Record<string, any>;
  onClose: () => void;
}

type WizardStep = 'select' | 'fill-missing' | 'review' | 'complete';

export function DocumentWizard({ profileData, onClose }: DocumentWizardProps) {
  const [step, setStep] = useState<WizardStep>('select');
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [additionalData, setAdditionalData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [missingDocsInfo, setMissingDocsInfo] = useState<MissingDocumentsResult | null>(null);

  const { language } = useTranslation();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Record<string, string>>();

  // Handle passport scan completion
  const handleScanComplete = (
    data: {
      fullName?: string;
      fullNameLatin?: string;
      passportNumber?: string;
      birthDate?: string;
      gender?: 'male' | 'female';
      citizenship?: string;
      passportIssueDate?: string;
      passportExpiryDate?: string;
    },
    _imageUri: string
  ) => {
    missingFields.forEach((field) => {
      const value = (data as Record<string, string | undefined>)[field];
      if (value) {
        setValue(field, value);
      }
    });
    setShowScanner(false);
  };

  // Handle fill with sample data
  const handleFillSample = () => {
    if (!selectedForm) return;

    // Map form IDs to document types for sample data
    const formToDocumentType: Record<string, DocumentType> = {
      'notification-arrival': 'passport',
      'registration-extension': 'registration',
      'patent-initial': 'patent',
      'patent-reissue': 'patent',
      'employer-notification': 'passport',
      'employer-termination': 'passport',
      'departure-notification': 'registration',
      'patent-duplicate': 'patent',
      'patent-territory-change': 'patent',
      'rvp-application': 'passport',
      'vnzh-application': 'passport',
      'invitation-letter': 'passport',
    };

    const docType = formToDocumentType[selectedForm.id] || 'passport';
    const sampleData = getSampleData(docType, { language });

    // Fill only missing fields
    missingFields.forEach((field) => {
      const value = (sampleData as Record<string, unknown>)[field];
      if (value !== undefined && value !== null) {
        setValue(field, String(value));
      }
    });
  };

  const handleFormSelect = (form: FormDefinition) => {
    setSelectedForm(form);
    const missing = getMissingFields(form.id, profileData);
    setMissingFields(missing);

    // Check which documents are missing
    const missingDocs = getMissingDocuments(form.id, profileData);
    setMissingDocsInfo(missingDocs);

    if (missing.length > 0) {
      setStep('fill-missing');
    } else {
      setStep('review');
    }
  };

  const handleMissingFieldsSubmit = (data: any) => {
    setAdditionalData(data);
    // Recalculate missing documents with the new data
    if (selectedForm) {
      const combinedData = { ...profileData, ...data };
      const missingDocs = getMissingDocuments(selectedForm.id, combinedData);
      setMissingDocsInfo(missingDocs);
    }
    setStep('review');
  };

  const handleGeneratePDF = async () => {
    if (!selectedForm) return;

    setIsGenerating(true);

    try {
      await downloadPDF({
        formId: selectedForm.id,
        data: additionalData,
        profileData,
      });
      setPdfGenerated(true);
      setStep('complete');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!selectedForm) return;

    try {
      await sharePDF({
        formId: selectedForm.id,
        data: additionalData,
        profileData,
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  };

  const handleBack = () => {
    if (step === 'fill-missing') {
      setStep('select');
      setSelectedForm(null);
    } else if (step === 'review') {
      if (missingFields.length > 0) {
        setStep('fill-missing');
      } else {
        setStep('select');
        setSelectedForm(null);
      }
    } else if (step === 'complete') {
      setStep('select');
      setSelectedForm(null);
      setPdfGenerated(false);
      setAdditionalData({});
    }
  };

  const allData = { ...profileData, ...additionalData };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-document-wizard"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {step !== 'select' && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div>
              <h2 id="modal-title-document-wizard" className="text-lg font-bold text-gray-900">
                {step === 'select' && 'Выберите документ'}
                {step === 'fill-missing' && 'Заполните данные'}
                {step === 'review' && 'Проверьте данные'}
                {step === 'complete' && 'Готово!'}
              </h2>
              {selectedForm && step !== 'select' && (
                <p className="text-sm text-gray-500">{selectedForm.titleShort}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Step: Select Form */}
          {step === 'select' && (
            <div className="space-y-6">
              {(Object.keys(FORMS_BY_CATEGORY) as FormCategory[]).map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <div className="space-y-2">
                    {FORMS_BY_CATEGORY[category].map((form) => {
                      const missing = getMissingFields(form.id, profileData);
                      const hasAllData = missing.length === 0;

                      return (
                        <button
                          key={form.id}
                          onClick={() => handleFormSelect(form)}
                          className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                        >
                          <div className="text-2xl">{form.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {form.titleShort}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {form.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {form.estimatedTime}
                              </span>
                              {hasAllData ? (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <Check className="w-3 h-3" />
                                  Все данные есть
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-orange-600">
                                  <AlertCircle className="w-3 h-3" />
                                  Нужно {missing.length} поля
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step: Fill Missing Fields */}
          {step === 'fill-missing' && selectedForm && (
            <>
              {showScanner && (
                <PassportScanner
                  onScanComplete={handleScanComplete}
                  onCancel={() => setShowScanner(false)}
                />
              )}
              <form id="fill-missing-form" onSubmit={handleSubmit(handleMissingFieldsSubmit)}>
                <MissingFieldsForm
                  missingFields={missingFields}
                  register={register}
                  errors={errors}
                  onScanPassport={() => setShowScanner(true)}
                  onFillSample={handleFillSample}
                  language={language}
                />
              </form>
            </>
          )}

          {/* Step: Review */}
          {step === 'review' && selectedForm && (
            <div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {selectedForm.icon} {selectedForm.title}
                </h3>
                <p className="text-sm text-blue-800">
                  {selectedForm.description}
                </p>
              </div>

              {/* Warning about missing documents */}
              {missingDocsInfo && missingDocsInfo.missingDocuments.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">
                        Некоторые поля будут неполными
                      </h4>
                      <p className="text-sm text-orange-800 mb-2">
                        Для полного заполнения формы загрузите:
                      </p>
                      <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                        {missingDocsInfo.missingDocuments.map((doc) => (
                          <li key={doc.document}>
                            <span className="font-medium">{doc.label}</span>
                            <span className="text-orange-600"> ({doc.fieldLabels.join(', ')})</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-orange-700 mt-2 italic">
                        Вы можете продолжить генерацию - пустые поля будут отмечены в PDF
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="font-semibold text-gray-900 mb-3">Данные для документа:</h3>

              <div className="space-y-2">
                {selectedForm.requiredFields.map((field) => {
                  const value = allData[field];
                  const hasValue = value !== undefined && value !== null && value !== '';
                  const sourceDoc = FIELD_SOURCE_DOCUMENT[field];

                  return (
                    <div
                      key={field}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-500">{FIELD_LABELS[field]}</span>
                      {hasValue ? (
                        <span className="font-medium text-gray-900 text-right max-w-[60%]">
                          {value}
                        </span>
                      ) : (
                        <span className="text-sm text-orange-600 text-right max-w-[60%]">
                          {sourceDoc && sourceDoc.document !== 'manual'
                            ? `Нужен: ${sourceDoc.label}`
                            : '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && selectedForm && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Документ готов!
              </h3>
              <p className="text-gray-500 mb-8">
                {selectedForm.titleShort} успешно сгенерирован
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleGeneratePDF}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Скачать ещё раз
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Поделиться
                </button>

                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedForm(null);
                    setPdfGenerated(false);
                    setAdditionalData({});
                  }}
                  className="w-full py-3 text-blue-600 font-semibold hover:text-blue-700"
                >
                  Создать другой документ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        {step === 'fill-missing' && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <button
              type="submit"
              form="fill-missing-form"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Продолжить
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 disabled:bg-gray-300 transition-colors"
            >
              {isGenerating ? (
                <span className="animate-pulse">Генерация...</span>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Сгенерировать PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
