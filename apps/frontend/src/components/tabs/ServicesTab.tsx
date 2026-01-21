'use client';

import { Shield, Calculator, Briefcase, Home, FileText, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

const services: Service[] = [
  {
    id: '1',
    title: 'Проверка запретов',
    description: 'МВД/ФССП',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: '2',
    title: 'Калькулятор 90/180',
    description: 'Дни пребывания',
    icon: Calculator,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '3',
    title: 'Поиск работы',
    description: 'Вакансии',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: '4',
    title: 'Жилье',
    description: 'Аренда',
    icon: Home,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: '5',
    title: 'Договоры',
    description: 'Генератор',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: '6',
    title: 'Карта и Места',
    description: 'МВД локации',
    icon: MapPin,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export function ServicesTab() {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Сервисы</h1>
        <p className="text-sm text-gray-500">Инструменты и услуги</p>
      </div>

      {/* Services Grid */}
      <div className="flex-1 px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                className={cn(
                  'flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 transition-all hover:scale-105 active:scale-100 shadow-sm',
                  service.bgColor
                )}
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-3',
                    'bg-white shadow-md'
                  )}
                >
                  <Icon className={cn('w-8 h-8', service.color)} strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 text-center">
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <h3 className="text-sm font-bold text-blue-900 mb-2">
            💡 Совет дня
          </h3>
          <p className="text-sm text-blue-800">
            Проверяйте запреты в базе МВД каждые 30 дней, чтобы избежать проблем при выезде из России.
          </p>
        </div>

        {/* Popular Services */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Популярные услуги
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📞</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Консультация юриста</div>
                  <div className="text-xs text-gray-500">От 500 ₽</div>
                </div>
              </div>
              <div className="text-blue-600 font-semibold">→</div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Помощь с документами</div>
                  <div className="text-xs text-gray-500">От 1000 ₽</div>
                </div>
              </div>
              <div className="text-blue-600 font-semibold">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
