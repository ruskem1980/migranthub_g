'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, ChevronRight, ChevronLeft, FileText, Download, Share2, Check, AlertCircle } from 'lucide-react';
import {
  FORMS_REGISTRY,
  FORMS_BY_CATEGORY,
  CATEGORY_LABELS,
  getFormById,
  getMissingFields,
  FIELD_LABELS,
  type FormDefinition,
  type FormCategory,
} from '../formsRegistry';
import { downloadPDF, sharePDF } from '../pdfGenerator';

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

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormSelect = (form: FormDefinition) => {
    setSelectedForm(form);
    const missing = getMissingFields(form.id, profileData);
    setMissingFields(missing);

    if (missing.length > 0) {
      setStep('fill-missing');
    } else {
      setStep('review');
    }
  };

  const handleMissingFieldsSubmit = (data: any) => {
    setAdditionalData(data);
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
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
              <h2 className="text-lg font-bold text-gray-900">
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
        <div className="flex-1 overflow-y-auto p-4">
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
            <form onSubmit={handleSubmit(handleMissingFieldsSubmit)} className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 mb-4">
                <p className="text-sm text-orange-800">
                  Для генерации документа нужно заполнить ещё {missingFields.length} поля
                </p>
              </div>

              {missingFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {FIELD_LABELS[field] || field} *
                  </label>
                  {field.includes('Address') ? (
                    <textarea
                      {...register(field, { required: true })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder={`Введите ${(FIELD_LABELS[field] || field).toLowerCase()}`}
                    />
                  ) : field.includes('Date') || field.includes('Expiry') ? (
                    <input
                      type="date"
                      {...register(field, { required: true })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      {...register(field, { required: true })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Введите ${(FIELD_LABELS[field] || field).toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Продолжить
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
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

              <h3 className="font-semibold text-gray-900 mb-3">Данные для документа:</h3>

              <div className="space-y-2 mb-6">
                {selectedForm.requiredFields.map((field) => (
                  <div
                    key={field}
                    className="flex justify-between py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-500">{FIELD_LABELS[field]}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">
                      {allData[field] || '—'}
                    </span>
                  </div>
                ))}
              </div>

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
      </div>
    </div>
  );
}
