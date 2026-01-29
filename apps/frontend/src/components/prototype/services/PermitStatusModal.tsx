'use client';

import { useState } from 'react';
import { X, ClipboardCheck, Loader2, Clock, CheckCircle2, XCircle, AlertCircle, FileWarning, HelpCircle, Calendar } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';

interface PermitStatusModalProps {
  onClose: () => void;
}

type PermitType = 'RVP' | 'VNJ';

interface FormData {
  permitType: PermitType;
  region: string;
  applicationDate: string;
  applicationNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
}

interface PermitStatusResponse {
  found: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'READY_FOR_PICKUP' |
          'ADDITIONAL_DOCS_REQUIRED' | 'NOT_FOUND' | 'UNKNOWN';
  message: string;
  estimatedDate?: string;
  checkedAt: string;
  error?: string;
}

const REGIONS = [
  { code: '77', name: 'Москва' },
  { code: '78', name: 'Санкт-Петербург' },
  { code: '50', name: 'Московская область' },
  { code: '47', name: 'Ленинградская область' },
  { code: '54', name: 'Новосибирская область' },
  { code: '66', name: 'Свердловская область' },
  { code: '16', name: 'Республика Татарстан' },
  { code: '23', name: 'Краснодарский край' },
];

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; Icon: typeof Clock; label: { ru: string; en: string } }> = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', Icon: Clock, label: { ru: 'На рассмотрении', en: 'Pending' } },
  APPROVED: { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', Icon: CheckCircle2, label: { ru: 'Одобрено', en: 'Approved' } },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', Icon: XCircle, label: { ru: 'Отказано', en: 'Rejected' } },
  READY_FOR_PICKUP: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', Icon: CheckCircle2, label: { ru: 'Готово к выдаче', en: 'Ready' } },
  ADDITIONAL_DOCS_REQUIRED: { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', Icon: FileWarning, label: { ru: 'Нужны документы', en: 'Docs Required' } },
  NOT_FOUND: { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', Icon: HelpCircle, label: { ru: 'Не найдено', en: 'Not Found' } },
  UNKNOWN: { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', Icon: AlertCircle, label: { ru: 'Неизвестно', en: 'Unknown' } },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function PermitStatusModal({ onClose }: PermitStatusModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>({
    permitType: 'RVP',
    region: '77',
    applicationDate: '',
    applicationNumber: '',
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PermitStatusResponse | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.region || !formData.applicationDate || !formData.lastName || !formData.firstName || !formData.birthDate) {
      setError(language === 'ru' ? 'Заполните все обязательные поля' : 'Fill all required fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = API_BASE_URL + '/api/v1/utilities/permit-status';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permitType: formData.permitType,
          region: formData.region,
          applicationDate: formData.applicationDate,
          applicationNumber: formData.applicationNumber || undefined,
          lastName: formData.lastName.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim() || undefined,
          birthDate: formData.birthDate,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      setResult(await response.json());
    } catch {
      setError(language === 'ru' ? 'Ошибка проверки' : 'Check failed');
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.UNKNOWN) : null;
  const StatusIcon = statusConfig?.Icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{language === 'ru' ? 'Статус РВП/ВНЖ' : 'Permit Status'}</h2>
              <p className="text-xs text-blue-100">{language === 'ru' ? 'Проверка заявления' : 'Check application'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {result && statusConfig && StatusIcon ? (
            <div className="space-y-5">
              <div className={'p-6 ' + statusConfig.bgColor + ' border-2 ' + statusConfig.borderColor + ' rounded-2xl'}>
                <div className="flex items-start gap-4">
                  <StatusIcon className={'w-8 h-8 ' + statusConfig.color} />
                  <div>
                    <h3 className={'text-lg font-bold ' + statusConfig.color}>
                      {language === 'ru' ? statusConfig.label.ru : statusConfig.label.en}
                    </h3>
                    <p className="text-sm text-gray-700">{result.message}</p>
                  </div>
                </div>
              </div>
              {result.estimatedDate && (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{language === 'ru' ? 'Ориентировочно' : 'Estimated'}</p>
                    <p className="text-sm text-blue-700">{new Date(result.estimatedDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              )}
              <button onClick={() => setResult(null)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">
                {language === 'ru' ? 'Новая проверка' : 'New Check'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(['RVP', 'VNJ'] as PermitType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => handleInputChange('permitType', t)}
                    className={'p-4 rounded-xl border-2 ' + (formData.permitType === t ? 'bg-blue-50 border-blue-500' : 'border-gray-200')}
                  >
                    <div className="font-bold">{t === 'RVP' ? 'РВП' : 'ВНЖ'}</div>
                  </button>
                ))}
              </div>
              <select
                value={formData.region}
                onChange={e => handleInputChange('region', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                {REGIONS.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={e => handleInputChange('applicationDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                placeholder="Дата подачи"
              />
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                placeholder={language === 'ru' ? 'Фамилия *' : 'Last Name *'}
              />
              <input
                type="text"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                placeholder={language === 'ru' ? 'Имя *' : 'First Name *'}
              />
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => handleInputChange('birthDate', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === 'ru' ? 'Проверка...' : 'Checking...'}
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-5 h-5" />
                    {language === 'ru' ? 'Проверить' : 'Check'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
