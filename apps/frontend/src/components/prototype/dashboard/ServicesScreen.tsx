'use client';

import { Shield, Calculator, FileText, Briefcase, Home, MapPin, Languages, CreditCard, Wand2, Plus, Grid3x3, X, GraduationCap, Map } from 'lucide-react';
import { useState } from 'react';
import { DocumentGenerator } from '../services/DocumentGenerator';
import { useTranslation } from '@/lib/i18n';

export function ServicesScreen() {
  const { t } = useTranslation();
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [showOtherServices, setShowOtherServices] = useState(false);

  // Core Services (Main Grid)
  const coreServices = [
    { id: 'autofill', icon: Wand2, title: '✍️ Мои Заявления', subtitle: 'Генерация документов', color: 'purple', special: true },
    { id: 'check', icon: Shield, title: 'Проверка запретов', subtitle: 'Базы МВД/ФССП', color: 'red' },
    { id: 'payment', icon: CreditCard, title: 'Оплата патента', subtitle: 'Быстрая оплата', color: 'green' },
    { id: 'map', icon: MapPin, title: 'Карта Мигранта', subtitle: 'МВД, ММЦ, Маршруты', color: 'pink', hasModal: true },
    { id: 'other', icon: Grid3x3, title: '🧩 Другие услуги', subtitle: '7 дополнительных', color: 'gray' },
  ];

  // Secondary Services (Hidden in "Other Services")
  const otherServices = [
    { id: 'translator', icon: Languages, title: '🗣️ Переводчик', subtitle: 'Текст/Голос/Фото', color: 'indigo' },
    { id: 'contracts', icon: FileText, title: '📝 Конструктор договоров', subtitle: 'RU + Родной язык', color: 'orange' },
    { id: 'jobs', icon: Briefcase, title: '💼 Поиск работы', subtitle: 'Вакансии с патентом', color: 'green' },
    { id: 'housing', icon: Home, title: '🏠 Поиск жилья', subtitle: 'С регистрацией', color: 'purple' },
    { id: 'calculator', icon: Calculator, title: '🧮 Калькулятор', subtitle: '90/180 дней', color: 'blue' },
    { id: 'exam', icon: GraduationCap, title: '📚 Экзамен по русскому', subtitle: 'Тренажер тестов', color: 'emerald' },
    { id: 'mosques', icon: Map, title: '🕌 Карта мечетей', subtitle: 'Найти мечеть', color: 'teal' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    pink: { bg: 'bg-pink-50', icon: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
    gray: { bg: 'bg-gray-50', icon: 'text-gray-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600' },
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{t('services.title')}</h1>
        <p className="text-sm text-gray-500">{t('services.subtitle')}</p>
      </div>

      {/* Core Services Grid */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {t('services.mainServices')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {coreServices.map((service, index) => {
            const Icon = service.icon;
            const colors = colorClasses[service.color];

            return (
              <button
                key={index}
                onClick={() => {
                  if (service.id === 'map') {
                    setShowMapModal(true);
                  } else if (service.id === 'autofill') {
                    setShowDocGenerator(true);
                  } else if (service.id === 'other') {
                    setShowOtherServices(true);
                  }
                }}
                className={`${colors.bg} border-2 ${service.special ? 'border-purple-400 ring-2 ring-purple-200' : service.id === 'other' ? 'border-gray-300 border-dashed' : 'border-gray-200'} rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md hover:shadow-xl relative`}
              >
                {service.special && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </div>
                )}
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                  <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 text-center">
                  {service.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('services.migrantMap.title')}</h3>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{t('services.migrantMap.selectCategory')}</p>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">👮‍♂️</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.mvd')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.migrationDepts')}</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.medCenters')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.authorizedOnly')}</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{t('poi.examCenters')}</h4>
                  <p className="text-xs text-gray-600">{t('poi.testingCenters')}</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowMapModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('services.migrantMap.openMap')}
            </button>
          </div>
        </div>
      )}

      {/* Other Services Modal */}
      {showOtherServices && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('services.otherServices.title')}</h3>
                <p className="text-sm text-gray-500">{t('services.otherServices.subtitle')}</p>
              </div>
              <button
                onClick={() => setShowOtherServices(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Secondary Services Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {otherServices.map((service, index) => {
                const Icon = service.icon;
                const colors = colorClasses[service.color];

                return (
                  <button
                    key={index}
                    className={`${colors.bg} border-2 border-gray-200 rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md hover:shadow-xl`}
                  >
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
                      <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-600 text-center">
                      {service.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Info Card */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
              <p className="text-sm text-blue-800">
                {t('services.otherServices.tip')}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowOtherServices(false)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* Document Generator */}
      {showDocGenerator && (
        <DocumentGenerator
          onClose={() => setShowDocGenerator(false)}
          profileData={{
            fullName: 'Усманов Алишер Бахтиярович',
            passportNumber: 'AA 1234567',
            entryDate: '2024-01-01',
            citizenship: 'Узбекистан',
            // hostAddress and employerName intentionally missing to demo the flow
          }}
        />
      )}
    </div>
  );
}
