'use client';

import { useState } from 'react';
import { X, FileText, Home, Briefcase, FileCheck, Plus, Download, AlertCircle, Camera, Edit3, Check, ChevronRight, AlertTriangle } from 'lucide-react';

interface DocumentGeneratorProps {
  onClose: () => void;
  profileData: {
    passportNumber?: string;
    fullName?: string;
    entryDate?: string;
    citizenship?: string;
    hostAddress?: string;
    employerName?: string;
    jobTitle?: string;
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
  passportNumber: 'Номер паспорта',
  fullName: 'ФИО',
  entryDate: 'Дата въезда',
  citizenship: 'Гражданство',
  hostAddress: 'Адрес регистрации',
  employerName: 'Название работодателя',
  jobTitle: 'Должность',
};

export function DocumentGenerator({ onClose, profileData }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [showMissingDataModal, setShowMissingDataModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [tempData, setTempData] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

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
      // Save temp data to profile (mock)
      setShowMissingDataModal(false);
      setShowPreview(true);
    }
  };

  const renderTemplateSelector = () => {
    const categories = [
      { id: 'work', title: '👔 Работа', templates: TEMPLATES.filter(t => t.category === 'work') },
      { id: 'housing', title: '🏠 Проживание', templates: TEMPLATES.filter(t => t.category === 'housing') },
      { id: 'longterm', title: '📘 РВП / ВНЖ', templates: TEMPLATES.filter(t => t.category === 'longterm') },
      { id: 'requests', title: '📋 Разное', templates: TEMPLATES.filter(t => t.category === 'requests') },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Выберите документ</h3>
          <p className="text-sm text-gray-600">
            Мы автоматически заполним форму вашими данными
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
                      Важно
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    template.isCritical ? 'bg-red-100' : 'bg-purple-100'
                  }`}>
                    <span className="text-3xl">{template.icon}</span>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 mb-1">{template.title}</h4>
                    <p className={`text-sm mb-2 ${template.isCritical ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
                      {template.subtitle}
                    </p>
                    <span className={`text-xs font-medium ${template.isCritical ? 'text-red-600' : 'text-purple-600'}`}>
                      {template.formNumber}
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
            💡 <strong>Совет:</strong> Все формы генерируются автоматически на основе ваших данных. Вам останется только распечатать.
          </p>
        </div>
      </div>
    );
  };

  const renderMissingDataModal = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Не хватает данных</h3>
            <p className="text-sm text-gray-600">
              Для документа <strong>"{template.title}"</strong> нужно добавить недостающую информацию
            </p>
          </div>

          {/* Missing Fields Form */}
          <div className="space-y-4 mb-6">
            {missingFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {FIELD_LABELS[field]}
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
                    <option value="">Выберите страну</option>
                    <option value="Узбекистан">🇺🇿 Узбекистан</option>
                    <option value="Таджикистан">🇹🇯 Таджикистан</option>
                    <option value="Киргизия">🇰🇬 Киргизия</option>
                  </select>
                ) : field === 'hostAddress' ? (
                  <textarea
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={tempData[field] || ''}
                    onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
                    placeholder={`Введите ${FIELD_LABELS[field].toLowerCase()}`}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Quick Scan Option */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Быстрое заполнение</p>
                <p className="text-xs text-blue-800">
                  Вы можете отсканировать паспорт, чтобы автоматически заполнить данные
                </p>
                <button className="mt-2 text-xs text-blue-600 font-semibold hover:underline">
                  📸 Сканировать паспорт →
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDataSubmit}
              disabled={!missingFields.every(field => tempData[field])}
              className={`w-full font-bold py-4 rounded-xl transition-colors ${
                missingFields.every(field => tempData[field])
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Сохранить и продолжить
            </button>

            <button
              onClick={() => {
                setShowMissingDataModal(false);
                setSelectedTemplate(null);
                setTempData({});
              }}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate)!;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Документ готов!</h3>
          <p className="text-sm text-gray-600">
            Мы автоматически заполнили форму вашими данными
          </p>
        </div>

        {/* Document Preview Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-24 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-red-200">
              <FileText className="w-10 h-10 text-red-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{template.formNumber}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Размер: 156 KB</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">2 страницы</span>
              </div>
            </div>
          </div>

          {/* Auto-filled Data Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">Заполненные данные:</p>
            <div className="space-y-2 text-sm">
              {profileData.fullName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ФИО:</span>
                  <span className="font-semibold text-gray-900">{profileData.fullName}</span>
                </div>
              )}
              {profileData.passportNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Паспорт:</span>
                  <span className="font-semibold text-gray-900 font-mono">{profileData.passportNumber}</span>
                </div>
              )}
              {profileData.citizenship && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Гражданство:</span>
                  <span className="font-semibold text-gray-900">{profileData.citizenship}</span>
                </div>
              )}
              {profileData.entryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата въезда:</span>
                  <span className="font-semibold text-gray-900">{profileData.entryDate}</span>
                </div>
              )}
              {profileData.hostAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Адрес:</span>
                  <span className="font-semibold text-gray-900 text-right text-xs">{profileData.hostAddress}</span>
                </div>
              )}
              {profileData.employerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Работодатель:</span>
                  <span className="font-semibold text-gray-900">{profileData.employerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors active:scale-98 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Скачать PDF
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors active:scale-98 flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5" />
              Редактировать
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Документ готов к использованию</p>
              <p className="text-xs text-green-800 leading-relaxed">
                Распечатайте документ и подайте в соответствующий орган. Все данные заполнены согласно требованиям МВД РФ.
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
          Отлично!
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
              <h2 className="text-xl font-bold text-white">Генератор документов</h2>
              <p className="text-xs text-purple-100">Автозаполнение форм</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedTemplate && renderTemplateSelector()}
          {showPreview && renderPreview()}
        </div>
      </div>

      {/* Missing Data Modal (Nested) */}
      {showMissingDataModal && renderMissingDataModal()}
    </div>
  );
}
