'use client';

import { useState } from 'react';
import { X, FileText, Home, Briefcase, FileCheck, Plus, Download, AlertCircle, Camera, Edit3, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface DocumentGeneratorProps {
  onClose: () => void;
  onSaveProfileData?: (data: Record<string, any>) => void;
  profileData: {
    // Personal data
    passportNumber?: string;
    fullName?: string;
    entryDate?: string;
    citizenship?: string;
    birthDate?: string;
    birthPlace?: string;
    
    // Employment data
    employerName?: string;
    employerINN?: string;
    employerAddress?: string;
    jobTitle?: string;
    salary?: string;
    
    // Housing data
    hostAddress?: string;
    hostFullName?: string;
    hostPassport?: string;
    
    // Education data
    certificateNumber?: string;
    testCenter?: string;
    educationLevel?: string;
    
    // Family data
    spouseName?: string;
    marriageDate?: string;
    childrenCount?: string;
  };
}

type TemplateId = 
  // Work
  | 'patent' | 'contract' | 'employment_notification' | 'termination_notification'
  // Housing
  | 'arrival' | 'employer_petition' | 'owner_consent'
  // Long-term
  | 'rvp' | 'vnzh' | 'annual_notification'
  // Requests
  | 'lost_docs' | 'inn_application';

interface DocumentTemplate {
  id: TemplateId;
  title: string;
  subtitle: string;
  icon: string;
  formNumber: string;
  category: 'work' | 'housing' | 'longterm' | 'requests';
  isCritical?: boolean;
  requiredFields: string[];
}

const TEMPLATES: DocumentTemplate[] = [
  // CATEGORY 1: WORK (РАБОТА)
  {
    id: 'patent',
    title: 'Заявление на патент',
    subtitle: 'Первичное получение или переоформление',
    icon: '📄',
    formNumber: 'Форма 26.5-1',
    category: 'work',
    requiredFields: ['passportNumber', 'fullName', 'entryDate', 'citizenship', 'jobTitle', 'employerName'],
  },
  {
    id: 'contract',
    title: 'Трудовой договор',
    subtitle: 'Стандартный договор с физлицом или юрлицом',
    icon: '🤝',
    formNumber: 'Типовой шаблон',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN', 'jobTitle', 'salary', 'startDate'],
  },
  {
    id: 'employment_notification',
    title: 'Уведомление о заключении договора',
    subtitle: '⚠️ Обязательно отправить в МВД в течение 2 месяцев!',
    icon: '📢',
    formNumber: 'Приказ МВД №846',
    category: 'work',
    isCritical: true,
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN', 'contractDate', 'jobTitle'],
  },
  {
    id: 'termination_notification',
    title: 'Уведомление о расторжении договора',
    subtitle: 'Подавать при увольнении в течение 3 дней',
    icon: '💔',
    formNumber: 'Приказ МВД №846',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'terminationDate', 'reason'],
  },

  // CATEGORY 2: HOUSING & REGISTRATION (ЖИЛЬЕ)
  {
    id: 'arrival',
    title: 'Уведомление о прибытии',
    subtitle: 'Первичная регистрация или продление',
    icon: '🏠',
    formNumber: 'Форма 21',
    category: 'housing',
    requiredFields: ['passportNumber', 'fullName', 'entryDate', 'hostAddress', 'hostFullName'],
  },
  {
    id: 'employer_petition',
    title: 'Ходатайство от работодателя',
    subtitle: 'Основание для продления регистрации',
    icon: '🏢',
    formNumber: 'Свободная форма',
    category: 'housing',
    requiredFields: ['employerName', 'employerINN', 'employeeFullName', 'employeePassport', 'reason'],
  },
  {
    id: 'owner_consent',
    title: 'Согласие собственника на регистрацию',
    subtitle: 'Заявление от владельца квартиры',
    icon: '✍️',
    formNumber: 'Типовой бланк',
    category: 'housing',
    requiredFields: ['ownerFullName', 'ownerPassport', 'propertyAddress', 'guestFullName', 'guestPassport'],
  },

  // CATEGORY 3: LONG-TERM STATUS (РВП / ВНЖ)
  {
    id: 'rvp',
    title: 'Заявление на РВП',
    subtitle: 'Разрешение на временное проживание',
    icon: '📘',
    formNumber: 'Форма РВП',
    category: 'longterm',
    requiredFields: ['passportNumber', 'fullName', 'citizenship', 'entryDate', 'birthDate', 'birthPlace'],
  },
  {
    id: 'vnzh',
    title: 'Заявление на ВНЖ',
    subtitle: 'Вид на жительство',
    icon: '📗',
    formNumber: 'Форма ВНЖ',
    category: 'longterm',
    requiredFields: ['passportNumber', 'fullName', 'citizenship', 'rvpNumber', 'rvpDate', 'address'],
  },
  {
    id: 'annual_notification',
    title: 'Ежегодное уведомление (РВП/ВНЖ)',
    subtitle: 'Подтверждение проживания',
    icon: '📅',
    formNumber: 'Форма уведомления',
    category: 'longterm',
    requiredFields: ['fullName', 'rvpNumber', 'address', 'income', 'employer'],
  },

  // CATEGORY 4: REQUESTS & SOS (РАЗНОЕ)
  {
    id: 'lost_docs',
    title: 'Заявление об утере документов',
    subtitle: 'Для полиции и восстановления',
    icon: '🆘',
    formNumber: 'Свободная форма',
    category: 'requests',
    requiredFields: ['fullName', 'passportNumber', 'lostDocType', 'lostDate', 'circumstances'],
  },
  {
    id: 'inn_application',
    title: 'Заявление на ИНН',
    subtitle: 'Постановка на налоговый учет',
    icon: '🔢',
    formNumber: 'Форма №2-2-Учет',
    category: 'requests',
    requiredFields: ['fullName', 'passportNumber', 'birthDate', 'address'],
  },
];

const FIELD_LABELS: Record<string, string> = {
  // Personal data
  passportNumber: 'Номер паспорта',
  fullName: 'ФИО',
  entryDate: 'Дата въезда',
  citizenship: 'Гражданство',
  birthDate: 'Дата рождения',
  birthPlace: 'Место рождения',
  
  // Employment
  employerName: 'Название работодателя',
  employerINN: 'ИНН работодателя',
  employerAddress: 'Адрес работодателя',
  jobTitle: 'Должность',
  salary: 'Зарплата (руб/мес)',
  startDate: 'Дата начала работы',
  contractDate: 'Дата заключения договора',
  terminationDate: 'Дата расторжения',
  reason: 'Причина',
  
  // Housing
  hostAddress: 'Адрес регистрации',
  hostFullName: 'ФИО принимающего',
  hostPassport: 'Паспорт принимающего',
  employeeFullName: 'ФИО работника',
  employeePassport: 'Паспорт работника',
  ownerFullName: 'ФИО собственника',
  ownerPassport: 'Паспорт собственника',
  propertyAddress: 'Адрес недвижимости',
  guestFullName: 'ФИО гостя',
  guestPassport: 'Паспорт гостя',
  
  // Long-term status
  rvpNumber: 'Номер РВП',
  rvpDate: 'Дата выдачи РВП',
  vnzhNumber: 'Номер ВНЖ',
  address: 'Адрес проживания',
  income: 'Доход за год (руб)',
  employer: 'Работодатель',
  
  // Education
  certificateNumber: 'Номер сертификата',
  testCenter: 'Центр тестирования',
  score: 'Балл',
  educationLevel: 'Уровень образования',
  
  // Family
  spouseName: 'ФИО супруга/супруги',
  marriageDate: 'Дата заключения брака',
  marriageCertNumber: 'Номер свидетельства о браке',
  childrenCount: 'Количество детей',
  
  // Requests
  lostDocType: 'Тип утерянного документа',
  lostDate: 'Дата утери',
  circumstances: 'Обстоятельства утери',
};

export function DocumentGenerator({ onClose, onSaveProfileData, profileData }: DocumentGeneratorProps) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [showMissingDataModal, setShowMissingDataModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [tempData, setTempData] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Translated field labels
  const getFieldLabel = (field: string): string => {
    return t(`docgen.fields.${field}`);
  };

  // Get translated template data
  const getTemplateTitle = (id: TemplateId): string => t(`docgen.templates.${id}.title`);
  const getTemplateSubtitle = (id: TemplateId): string => t(`docgen.templates.${id}.subtitle`);
  const getTemplateFormNumber = (id: TemplateId): string => t(`docgen.templates.${id}.formNumber`);

  // Check if all required data is available
  const checkDataCompleteness = (template: DocumentTemplate): string[] => {
    const missing: string[] = [];
    
    template.requiredFields.forEach(field => {
      if (!profileData[field as keyof typeof profileData]) {
        missing.push(field);
      }
    });
    
    return missing;
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template.id);
    
    // Check for missing data
    const missing = checkDataCompleteness(template);
    
    if (missing.length > 0) {
      // Data is incomplete - show requirement modal
      setMissingFields(missing);
      setShowMissingDataModal(true);
    } else {
      // Data is complete - go straight to preview
      setShowPreview(true);
    }
  };

  const handleDataSubmit = () => {
    // Validate temp data
    const allFilled = missingFields.every(field => tempData[field]);

    if (allFilled) {
      // Save temp data to profile
      if (onSaveProfileData && Object.keys(tempData).length > 0) {
        onSaveProfileData(tempData);
      }
      setShowMissingDataModal(false);
      setShowPreview(true);
    }
  };

  const renderTemplateSelector = () => {
    const categories = [
      { id: 'work', title: `👔 ${t('docgen.categories.work')}`, templates: TEMPLATES.filter(tpl => tpl.category === 'work') },
      { id: 'housing', title: `🏠 ${t('docgen.categories.housing')}`, templates: TEMPLATES.filter(tpl => tpl.category === 'housing') },
      { id: 'longterm', title: `📘 ${t('docgen.categories.longterm')}`, templates: TEMPLATES.filter(tpl => tpl.category === 'longterm') },
      { id: 'requests', title: `📋 ${t('docgen.categories.requests')}`, templates: TEMPLATES.filter(tpl => tpl.category === 'requests') },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('docgen.selectDocument')}</h3>
          <p className="text-sm text-gray-600">
            {t('docgen.autoFillDescription')}
          </p>
        </div>

        {/* Categorized Templates */}
        {categories.map((category) => (
          <div key={category.id}>
            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              {category.title}
            </h4>
            <div className="space-y-3 mb-6">
              {category.templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all active:scale-98 relative ${
                    template.isCritical
                      ? 'bg-red-50 border-red-300 hover:border-red-400 hover:bg-red-100'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {/* Critical Badge */}
                  {template.isCritical && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t('docgen.important')}
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    template.isCritical ? 'bg-red-100' : 'bg-purple-100'
                  }`}>
                    <span className="text-3xl">{template.icon}</span>
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 mb-1">{getTemplateTitle(template.id)}</h4>
                    <p className={`text-sm mb-2 ${template.isCritical ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
                      {getTemplateSubtitle(template.id)}
                    </p>
                    <span className={`text-xs font-medium ${template.isCritical ? 'text-red-600' : 'text-purple-600'}`}>
                      {getTemplateFormNumber(template.id)}
                    </span>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>{t('docgen.tip')}:</strong> {t('docgen.tipText')}
          </p>
        </div>
      </div>
    );
  };

  const renderMissingDataModal = () => {
    const template = TEMPLATES.find(tpl => tpl.id === selectedTemplate)!;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 text-center p-6 pb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('docgen.missingData')}</h3>
            <p className="text-sm text-gray-600">
              {t('docgen.missingDataDesc', { document: getTemplateTitle(template.id) })}
            </p>

            {/* Counterparty Data Warning */}
            {(missingFields.includes('employerName') || missingFields.includes('employerINN') || missingFields.includes('hostFullName')) && (
              <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">{t('docgen.thirdPartyData')}</p>
                    <p className="text-xs text-yellow-800">
                      {missingFields.includes('employerName') && `${t('docgen.enterEmployerData')} `}
                      {missingFields.includes('hostFullName') && `${t('docgen.enterHostData')} `}
                      {t('docgen.dataNotSaved')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6">
            {/* Missing Fields Form */}
            <div className="space-y-4">
            {missingFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {getFieldLabel(field)}
                </label>

                {field === 'entryDate' ? (
                  <input
                    type="date"
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : field === 'citizenship' ? (
                  <select
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{t('docgen.selectCountry')}</option>
                    <option value="Узбекистан">🇺🇿 {t('countries.UZ')}</option>
                    <option value="Таджикистан">🇹🇯 {t('countries.TJ')}</option>
                    <option value="Киргизия">🇰🇬 {t('countries.KG')}</option>
                  </select>
                ) : field === 'hostAddress' ? (
                  <textarea
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    placeholder={t('docgen.addressPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    placeholder={t('docgen.enterValue')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            ))}
            </div>

            {/* Quick Scan Option */}
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">{t('docgen.quickFill')}</p>
                  <p className="text-xs text-blue-800">
                    {t('docgen.scanPassportHint')}
                  </p>
                  <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                    📸 {t('docgen.scanPassport')} →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 space-y-3">
            <button
              onClick={handleDataSubmit}
              disabled={!missingFields.every(field => tempData[field])}
              className={`w-full font-bold py-4 rounded-xl transition-colors ${
                missingFields.every(field => tempData[field])
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('docgen.saveAndContinue')}
            </button>

            <button
              onClick={() => {
                setShowMissingDataModal(false);
                setSelectedTemplate(null);
                setTempData({});
              }}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    const template = TEMPLATES.find(tpl => tpl.id === selectedTemplate)!;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('docgen.documentReady')}</h3>
          <p className="text-sm text-gray-600">
            {t('docgen.autoFillDescription')}
          </p>
        </div>

        {/* Document Preview Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-24 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-red-200">
              <FileText className="w-10 h-10 text-red-600" />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">{getTemplateTitle(template.id)}</h4>
              <p className="text-sm text-gray-600 mb-2">{getTemplateFormNumber(template.id)}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('docgen.size')}: 156 KB</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">2 {t('docgen.pages')}</span>
              </div>
            </div>
          </div>

          {/* Auto-filled Data Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">{t('docgen.filledData')}:</p>
            <div className="space-y-2 text-sm">
              {profileData.fullName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.fullName')}:</span>
                  <span className="font-semibold text-gray-900">{profileData.fullName}</span>
                </div>
              )}
              {profileData.passportNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.passportNumber')}:</span>
                  <span className="font-semibold text-gray-900 font-mono">{profileData.passportNumber}</span>
                </div>
              )}
              {profileData.citizenship && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.citizenship')}:</span>
                  <span className="font-semibold text-gray-900">{profileData.citizenship}</span>
                </div>
              )}
              {profileData.entryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.entryDate')}:</span>
                  <span className="font-semibold text-gray-900">{profileData.entryDate}</span>
                </div>
              )}
              {profileData.hostAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.hostAddress')}:</span>
                  <span className="font-semibold text-gray-900 text-right text-xs">{profileData.hostAddress}</span>
                </div>
              )}
              {profileData.employerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('docgen.fields.employerName')}:</span>
                  <span className="font-semibold text-gray-900">{profileData.employerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors active:scale-98 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              {t('docgen.downloadPdf')}
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5" />
              {t('docgen.edit')}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">{t('docgen.readyToUse')}</p>
              <p className="text-xs text-green-800 leading-relaxed">
                {t('docgen.printAndSubmit')}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
            onClose();
          }}
          className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors"
        >
          {t('docgen.great')}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('docgen.title')}</h2>
              <p className="text-xs text-purple-100">{t('docgen.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {!selectedTemplate && renderTemplateSelector()}
          {showPreview && renderPreview()}
        </div>
      </div>

      {/* Missing Data Modal (Nested) */}
      {showMissingDataModal && renderMissingDataModal()}
    </div>
  );
}
