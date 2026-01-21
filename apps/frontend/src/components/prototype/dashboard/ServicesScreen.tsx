'use client';

import { Shield, Calculator, FileText, Briefcase, Home, MapPin, Languages, CreditCard } from 'lucide-react';

export function ServicesScreen() {
  const services = [
    { icon: Shield, title: 'Проверка запретов', subtitle: 'МВД/ФССП', color: 'red' },
    { icon: FileText, title: 'Конструктор Договоров', subtitle: 'Скачать PDF', color: 'orange' },
    { icon: Calculator, title: 'Калькулятор 90/180', subtitle: 'Дни пребывания', color: 'blue' },
    { icon: Home, title: 'Поиск Жилья', subtitle: 'С регистрацией', color: 'purple' },
    { icon: MapPin, title: 'Карта Мигранта', subtitle: 'МВД, ММЦ, Маршруты', color: 'pink' },
    { icon: Languages, title: 'AI-Переводчик', subtitle: 'Фото/Голос', color: 'indigo' },
    { icon: Briefcase, title: 'Поиск Работы', subtitle: 'С патентом', color: 'green' },
    { icon: CreditCard, title: 'Оплата штрафов', subtitle: 'Госуслуги', color: 'red' },
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
      </div>
    </div>
  );
}
