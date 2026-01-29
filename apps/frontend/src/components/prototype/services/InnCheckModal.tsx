'use client';

import { useState } from 'react';
import { X, Hash, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';

interface InnCheckModalProps {
  onClose: () => void;
}

type ForeignDocumentType = 'FOREIGN_PASSPORT' | 'RVP' | 'VNJ';

interface FormData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  documentType: ForeignDocumentType;
  documentSeries: string;
  documentNumber: string;
  documentDate: string;
}

interface InnCheckResponse {
  found: boolean;
  inn?: string;
  source: 'fns' | 'cache' | 'mock' | 'fallback';
  checkedAt: string;
  error?: string;
  message?: string;
}

const initialFormData: FormData = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  documentType: 'FOREIGN_PASSPORT',
  documentSeries: '',
  documentNumber: '',
  documentDate: '',
};

const documentTypeLabels: Record<ForeignDocumentType, { ru: string; en: string }> = {
  FOREIGN_PASSPORT: { ru: 'Загранпаспорт', en: 'Foreign Passport' },
  RVP: { ru: 'РВП', en: 'Temporary Residence Permit' },
  VNJ: { ru: 'ВНЖ', en: 'Residence Permit' },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function InnCheckModal({ onClose }: InnCheckModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InnCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isFormValid = () => {
    return (
      formData.lastName.trim() !== '' &&
      formData.firstName.trim() !== '' &&
      formData.birthDate !== '' &&
      formData.documentSeries.trim() !== '' &&
      formData.documentNumber.trim() !== '' &&
      formData.documentDate !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/inn-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: formData.lastName.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim() || undefined,
          birthDate: formData.birthDate,
          documentType: formData.documentType,
          documentSeries: formData.documentSeries.trim(),
          documentNumber: formData.documentNumber.trim(),
          documentDate: formData.documentDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check INN');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('INN check error:', err);
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

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Фамилия' : 'Last Name'} *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="IVANOV"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Имя' : 'First Name'} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="IVAN"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {language === 'ru' ? 'Отчество' : 'Middle Name'}
        </label>
        <input
          type="text"
          value={formData.middleName}
          onChange={(e) => handleInputChange('middleName', e.target.value)}
          placeholder={language === 'ru' ? 'IVANOVICH (если есть)' : 'IVANOVICH (if any)'}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {language === 'ru' ? 'Дата рождения' : 'Date of Birth'} *
        </label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleInputChange('birthDate', e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {language === 'ru' ? 'Тип документа' : 'Document Type'} *
        </label>
        <select
          value={formData.documentType}
          onChange={(e) => handleInputChange('documentType', e.target.value as ForeignDocumentType)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {Object.entries(documentTypeLabels).map(([value, labels]) => (
            <option key={value} value={value}>
              {language === 'ru' ? labels.ru : labels.en}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Серия документа' : 'Document Series'} *
          </label>
          <input
            type="text"
            value={formData.documentSeries}
            onChange={(e) => handleInputChange('documentSeries', e.target.value)}
            placeholder="75"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {language === 'ru' ? 'Номер документа' : 'Document Number'} *
          </label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
            placeholder="1234567"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {language === 'ru' ? 'Дата выдачи документа' : 'Document Issue Date'} *
        </label>
        <input
          type="date"
          value={formData.documentDate}
          onChange={(e) => handleInputChange('documentDate', e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
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
            <Hash className="w-5 h-5" />
            {language === 'ru' ? 'Проверить ИНН' : 'Check INN'}
          </>
        )}
      </button>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          {language === 'ru'
            ? 'Проверка выполняется через официальный сервис ФНС России. Все данные передаются по защищенному соединению.'
            : 'The check is performed through the official service of the Russian Federal Tax Service. All data is transmitted over a secure connection.'}
        </p>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const isFound = result.found;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isFound ? 'bg-green-100' : 'bg-yellow-100'
            }`}
          >
            {isFound ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-yellow-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isFound
              ? language === 'ru'
                ? 'ИНН найден!'
                : 'INN Found!'
              : language === 'ru'
                ? 'ИНН не найден'
                : 'INN Not Found'}
          </h3>
          <p className="text-sm text-gray-600">
            {isFound
              ? language === 'ru'
                ? 'Ваш идентификационный номер налогоплательщика'
                : 'Your Individual Taxpayer Number'
              : result.message ||
                (language === 'ru'
                  ? 'В базе ФНС не найден ИНН по указанным данным'
                  : 'No INN found in the Federal Tax Service database for the provided data')}
          </p>
        </div>

        {isFound && result.inn && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-green-700 mb-2">
              {language === 'ru' ? 'Ваш ИНН' : 'Your INN'}
            </p>
            <p className="text-4xl font-bold text-green-800 font-mono tracking-wider">
              {result.inn}
            </p>
          </div>
        )}

        {!isFound && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              {language === 'ru' ? 'Что делать?' : 'What to do?'}
            </h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>
                {language === 'ru'
                  ? '1. Проверьте правильность введенных данных'
                  : '1. Check that the entered data is correct'}
              </li>
              <li>
                {language === 'ru'
                  ? '2. Возможно, ИНН еще не присвоен'
                  : '2. The INN may not have been assigned yet'}
              </li>
              <li>
                {language === 'ru'
                  ? '3. Подайте заявление на получение ИНН в любой налоговой инспекции'
                  : '3. Submit an application for INN at any tax office'}
              </li>
            </ul>
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'ru' ? 'Проверка ИНН' : 'INN Check'}
              </h2>
              <p className="text-xs text-blue-100">
                {language === 'ru' ? 'Узнайте свой налоговый номер' : 'Find your tax ID number'}
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
