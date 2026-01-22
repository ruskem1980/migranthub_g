'use client';

import { Shield, Calculator, FileText, Briefcase, Home, MapPin, Languages, CreditCard, Wand2, Plus } from 'lucide-react';
import { useState } from 'react';
import { DocumentGenerator } from '../services/DocumentGenerator';

export function ServicesScreen() {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);

  const services = [
    { icon: Wand2, title: '✍️ Автозаполнение', subtitle: 'Генерация заявлений', color: 'purple', special: true },
    { icon: Shield, title: 'Проверка запретов', subtitle: 'Базы МВД/ФССП', color: 'red' },
    { icon: FileText, title: 'Конструктор Договоров', subtitle: 'RU + Родной язык', color: 'orange' },
    { icon: Calculator, title: 'Калькулятор 90/180', subtitle: 'Дни пребывания', color: 'blue' },
    { icon: Home, title: 'Поиск Жилья', subtitle: 'С регистрацией', color: 'purple', badge: '🏠 С регистрацией' },
    { icon: MapPin, title: 'Карта Мигранта', subtitle: 'МВД, ММЦ, Маршруты', color: 'pink', hasModal: true },
    { icon: Languages, title: 'AI-Переводчик', subtitle: 'Фото/Голос', color: 'indigo' },
    { icon: Briefcase, title: 'Поиск Работы', subtitle: 'С патентом', color: 'green' },
    { icon: CreditCard, title: 'Оплата штрафов', subtitle: 'Интеграция Госуслуги', color: 'red' },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    pink: { bg: 'bg-pink-50', icon: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
  };

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Сервисы</h1>
        <p className="text-sm text-gray-500">Инструменты и услуги</p>
      </div>

      {/* Services Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const colors = colorClasses[service.color];

            return (
              <button
                key={index}
                onClick={() => {
                  if (service.hasModal) {
                    setShowMapModal(true);
                  } else if (service.special) {
                    setShowDocGenerator(true);
                  }
                }}
                className={`${colors.bg} border-2 ${service.special ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'} rounded-2xl p-5 transition-all hover:scale-105 active:scale-100 shadow-md hover:shadow-xl relative`}
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
              <h3 className="text-xl font-bold text-gray-900">Карта Мигранта</h3>
              <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Выберите категорию точек:</p>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">👮‍♂️</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">МВД / ММТ</h4>
                  <p className="text-xs text-gray-600">Отделы миграции</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">Медцентры</h4>
                  <p className="text-xs text-gray-600">Только авторизованные</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">Экзамены</h4>
                  <p className="text-xs text-gray-600">Центры тестирования</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowMapModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Открыть карту
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
