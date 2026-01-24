'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Calculator, MapPin, GraduationCap, Languages, FileText, Briefcase, Home, CreditCard, Map } from 'lucide-react';
import {
  MapScreen,
  StayCalculator,
  BanChecker,
  ExamTrainer,
} from '@/features/services';

type ServiceModal = 'map' | 'calculator' | 'ban-check' | 'exam' | null;

interface Service {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  modal?: ServiceModal;
  external?: string;
}

const services: Service[] = [
  {
    id: 'ban-check',
    title: 'Проверка запретов',
    description: 'МВД / ФССП',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    modal: 'ban-check',
  },
  {
    id: 'calculator',
    title: 'Калькулятор 90/180',
    description: 'Дни пребывания',
    icon: Calculator,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    modal: 'calculator',
  },
  {
    id: 'map',
    title: 'Карта мигранта',
    description: 'МВД, ММЦ, Медцентры',
    icon: MapPin,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    modal: 'map',
  },
  {
    id: 'exam',
    title: 'Экзамен по русскому',
    description: 'Тренажёр',
    icon: GraduationCap,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    modal: 'exam',
  },
  {
    id: 'translator',
    title: 'Переводчик',
    description: 'Яндекс.Переводчик',
    icon: Languages,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    external: 'https://translate.yandex.ru/',
  },
  {
    id: 'mosques',
    title: 'Карта мечетей',
    description: 'Найти мечеть',
    icon: Map,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    modal: 'map',
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ServiceModal>(null);
  const [mapInitialFilter, setMapInitialFilter] = useState<'mosque' | undefined>();

  const handleServiceClick = (service: Service) => {
    if (service.external) {
      window.open(service.external, '_blank');
      return;
    }

    if (service.id === 'mosques') {
      setMapInitialFilter('mosque');
      setActiveModal('map');
      return;
    }

    if (service.modal) {
      setMapInitialFilter(undefined);
      setActiveModal(service.modal);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setMapInitialFilter(undefined);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Сервисы</h1>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 transition-all hover:scale-105 active:scale-100 shadow-sm ${service.bgColor}`}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-white shadow-md">
                  <Icon className={`w-8 h-8 ${service.color}`} strokeWidth={2} />
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

        {/* Info card */}
        <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
          <h3 className="text-sm font-bold text-blue-900 mb-2">
            Совет дня
          </h3>
          <p className="text-sm text-blue-800">
            Проверяйте запреты в базе МВД каждые 30 дней, чтобы избежать проблем при выезде из России.
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Полезные ссылки
          </h3>
          <div className="space-y-3">
            <a
              href="https://www.gosuslugi.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏛️</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Госуслуги</div>
                  <div className="text-xs text-gray-500">Портал госуслуг</div>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </a>

            <a
              href="https://мвд.рф/mvd/structure1/Glavnie_upravlenija/guvm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👮</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">ГУВМ МВД</div>
                  <div className="text-xs text-gray-500">Миграционная служба</div>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </a>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'map' && (
        <MapScreen onClose={closeModal} initialFilter={mapInitialFilter} />
      )}
      {activeModal === 'calculator' && (
        <StayCalculator onClose={closeModal} />
      )}
      {activeModal === 'ban-check' && (
        <BanChecker onClose={closeModal} />
      )}
      {activeModal === 'exam' && (
        <ExamTrainer onClose={closeModal} />
      )}
    </div>
  );
}
