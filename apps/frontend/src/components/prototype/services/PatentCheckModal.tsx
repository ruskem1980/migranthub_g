'use client';

import { useState } from 'react';
import { X, FileCheck, Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';

interface PatentCheckModalProps {
  onClose: () => void;
}

interface FormData {
  series: string;
  number: string;
  lastName: string;
  firstName: string;
}

type PatentStatus = 'valid' | 'invalid' | 'expired' | 'not_found' | 'error';

interface PatentCheckResponse {
  status: PatentStatus;
  validUntil?: string;
  checkedAt: string;
  source: string;
  message?: string;
}

const initialFormData: FormData = {
  series: '',
  number: '',
  lastName: '',
  firstName: '',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function PatentCheckModal({ onClose }: PatentCheckModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PatentCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isSeriesValid = () => /^\d{2}$/.test(formData.series);
  const isNumberValid = () => /^\d{8,10}$/.test(formData.number);

  const isFormValid = () => {
    return isSeriesValid() && isNumberValid();
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/patent/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: formData.series,
          number: formData.number,
          lastName: formData.lastName.trim() || undefined,
          firstName: formData.firstName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check patent');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Patent check error:', err);
      setError(
        err instanceof Error
          ? err.message
          : language === 'ru'
            ? 'Произошла ошибка при проверке. Попробуйте позже.'
            : 'An error occurred during the check. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  const getStatusConfig = (status: PatentStatus) => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle,
          color: 'green',
          bgClass: 'bg-green-100',
          iconClass: 'text-green-600',
          borderClass: 'border-green-200',
          bgLight: 'bg-green-50',
          textClass: 'text-green-800',
          title: language === 'ru' ? 'Патент действителен' : 'Patent is Valid',
          subtitle: language === 'ru' ? 'Документ прошел проверку' : 'Document verified successfully',
        };
      case 'expired':
        return {
          icon: Clock,
          color: 'red',
          bgClass: 'bg-red-100',
          iconClass: 'text-red-600',
          borderClass: 'border-red-200',
          bgLight: 'bg-red-50',
          textClass: 'text-red-800',
          title: language === 'ru' ? 'Патент просрочен' : 'Patent Expired',
          subtitle: language === 'ru' ? 'Срок действия истек' : 'Validity period has ended',
        };
      case 'invalid':
        return {
          icon: XCircle,
          color: 'red',
          bgClass: 'bg-red-100',
          iconClass: 'text-red-600',
          borderClass: 'border-red-200',
          bgLight: 'bg-red-50',
          textClass: 'text-red-800',
          title: language === 'ru' ? 'Патент недействителен' : 'Patent Invalid',
          subtitle: language === 'ru' ? 'Документ не прошел проверку' : 'Document verification failed',
        };
      case 'not_found':
        return {
          icon: AlertCircle,
          color: 'yellow',
          bgClass: 'bg-yellow-100',
          iconClass: 'text-yellow-600',
          borderClass: 'border-yellow-200',
          bgLight: 'bg-yellow-50',
          textClass: 'text-yellow-800',
          title: language === 'ru' ? 'Патент не найден' : 'Patent Not Found',
          subtitle: language === 'ru' ? 'Документ не найден в базе' : 'Document not found in database',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          bgClass: 'bg-gray-100',
          iconClass: 'text-gray-600',
          borderClass: 'border-gray-200',
          bgLight: 'bg-gray-50',
          textClass: 'text-gray-800',
          title: language === 'ru' ? 'Ошибка проверки' : 'Check Error',
          subtitle: language === 'ru' ? 'Не удалось выполнить проверку' : 'Could not complete verification',
        };
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Серия патента' : 'Patent Series'} *
          </label>
          <input
            type="text"
            value={formData.series}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 2);
              handleInputChange('series', value);
            }}
            placeholder="77"
            maxLength={2}
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              formData.series && !isSeriesValid() ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {formData.series && !isSeriesValid() && (
            <p className="text-xs text-red-500 mt-1">
              {language === 'ru' ? 'Серия должна содержать 2 цифры' : 'Series must contain 2 digits'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Номер патента' : 'Patent Number'} *
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleInputChange('number', value);
            }}
            placeholder="12345678"
            maxLength={10}
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              formData.number && !isNumberValid() ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {formData.number && !isNumberValid() && (
            <p className="text-xs text-red-500 mt-1">
              {language === 'ru' ? 'Номер должен содержать 8-10 цифр' : 'Number must contain 8-10 digits'}
            </p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm text-gray-500 mb-3">
          {language === 'ru' ? 'Дополнительно (необязательно):' : 'Additional (optional):'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ru' ? 'Фамилия (латиницей)' : 'Last Name (Latin)'}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value.toUpperCase())}
              placeholder="IVANOV"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ru' ? 'Имя (латиницей)' : 'First Name (Latin)'}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value.toUpperCase())}
              placeholder="IVAN"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isFormValid() || isLoading}
        className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
          isFormValid() && !isLoading
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {language === 'ru' ? 'Проверяем...' : 'Checking...'}
          </>
        ) : (
          <>
            <FileCheck className="w-5 h-5" />
            {language === 'ru' ? 'Проверить патент' : 'Check Patent'}
          </>
        )}
      </button>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          {language === 'ru'
            ? 'Проверка выполняется через официальные источники МВД России. Серия и номер указаны на лицевой стороне патента.'
            : 'The check is performed through the official sources of the Russian Ministry of Internal Affairs. Series and number are indicated on the front of the patent.'}
        </p>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const config = getStatusConfig(result.status);
    const IconComponent = config.icon;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${config.bgClass}`}
          >
            <IconComponent className={`w-10 h-10 ${config.iconClass}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-sm text-gray-600">{result.message || config.subtitle}</p>
        </div>

        <div className={`${config.bgLight} border-2 ${config.borderClass} rounded-2xl p-6`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {language === 'ru' ? 'Серия и номер' : 'Series and Number'}
              </span>
              <span className={`font-bold font-mono ${config.textClass}`}>
                {formData.series} {formData.number}
              </span>
            </div>
            {result.validUntil && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {language === 'ru' ? 'Действителен до' : 'Valid Until'}
                </span>
                <span className={`font-bold ${config.textClass}`}>
                  {new Date(result.validUntil).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </span>
              </div>
            )}
            {(formData.lastName || formData.firstName) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {language === 'ru' ? 'Владелец' : 'Holder'}
                </span>
                <span className={`font-bold ${config.textClass}`}>
                  {[formData.lastName, formData.firstName].filter(Boolean).join(' ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {result.status === 'not_found' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              {language === 'ru' ? 'Возможные причины:' : 'Possible reasons:'}
            </h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>
                {language === 'ru'
                  ? '1. Проверьте правильность серии и номера'
                  : '1. Check that series and number are correct'}
              </li>
              <li>
                {language === 'ru'
                  ? '2. Данные могут еще не поступить в базу'
                  : '2. Data may not yet be in the database'}
              </li>
              <li>
                {language === 'ru'
                  ? '3. Обратитесь в территориальный орган МВД'
                  : '3. Contact the territorial body of the Ministry of Internal Affairs'}
              </li>
            </ul>
          </div>
        )}

        {(result.status === 'invalid' || result.status === 'expired') && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-900 mb-2">
              {language === 'ru' ? 'Рекомендации:' : 'Recommendations:'}
            </h4>
            <ul className="text-sm text-red-800 space-y-2">
              <li>
                {language === 'ru'
                  ? '1. Обратитесь в миграционный отдел МВД'
                  : '1. Contact the migration department of the Ministry of Internal Affairs'}
              </li>
              <li>
                {language === 'ru'
                  ? '2. Уточните статус патента и возможность продления'
                  : '2. Clarify the patent status and the possibility of extension'}
              </li>
              <li>
                {language === 'ru'
                  ? '3. Не работайте с недействительным патентом'
                  : '3. Do not work with an invalid patent'}
              </li>
            </ul>
          </div>
        )}

        {/* Warning for mock/fallback sources */}
        {(result.source === 'mock' || result.source === 'fallback') && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  {language === 'ru' ? 'Тестовые данные' : 'Test Data'}
                </p>
                <p className="text-sm text-orange-800">
                  {result.source === 'mock'
                    ? language === 'ru'
                      ? 'Сервис проверки отключен. Показаны тестовые данные, которые не отражают реальный статус патента. Для реальной проверки используйте официальный сайт ФМС.'
                      : 'Verification service is disabled. Test data shown, which does not reflect the actual patent status. For real verification, use the official FMS website.'
                    : language === 'ru'
                      ? 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте ФМС: services.fms.gov.ru'
                      : 'Service is temporarily unavailable. Try again later or check on the official FMS website: services.fms.gov.ru'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          {language === 'ru' ? 'Источник' : 'Source'}: {result.source.toUpperCase()} |{' '}
          {language === 'ru' ? 'Проверено' : 'Checked'}:{' '}
          {new Date(result.checkedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {language === 'ru' ? 'Проверить другой' : 'Check Another'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            {language === 'ru' ? 'Готово' : 'Done'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'ru' ? 'Проверка патента' : 'Patent Check'}
              </h2>
              <p className="text-xs text-orange-100">
                {language === 'ru' ? 'Проверьте действительность патента' : 'Verify patent validity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {result ? renderResult() : renderForm()}
        </div>
      </div>
    </div>
  );
}
