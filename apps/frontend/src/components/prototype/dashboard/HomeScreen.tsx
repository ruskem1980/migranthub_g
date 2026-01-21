'use client';

import { QrCode, ChevronRight, Volume2 } from 'lucide-react';

export function HomeScreen() {
  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Главная</h1>
          <p className="text-sm text-gray-500">Статус миграционного учета</p>
        </div>
        <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95">
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      {/* Status Indicator */}
      <div className="px-4 py-6">
        <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg">
          <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-xl animate-pulse">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">
            🟢 ЛЕГАЛЬНО
          </h2>
          <p className="text-center text-green-800 font-medium text-lg mb-3">
            Осталось дней: <span className="text-2xl font-bold">88</span>
          </p>
          <p className="text-center text-green-700 text-sm">
            Патент оплачен до 15 апреля 2024
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            АУ
          </div>
          
          {/* Name */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Алишер У.</h3>
            <p className="text-xs text-gray-500">ID: #MH-2024-001</p>
          </div>
          
          {/* QR Code Icon */}
          <button className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
            <QrCode className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Task Carousel */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Требуется внимание
        </h3>
        
        <div className="space-y-3">
          {/* Urgent Card - Patent */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 shadow-xl">
            <div className="inline-block px-2 py-1 bg-white/20 rounded-md text-xs font-semibold text-white mb-2">
              СРОЧНО
            </div>
            <h4 className="text-white font-bold text-lg mb-1">
              Патент
            </h4>
            <p className="text-white/90 text-sm mb-4">
              Истекает через 3 дня!
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors active:scale-98 flex items-center justify-center shadow-lg">
                Оплатить
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Secondary Card - Registration */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg">
            <h4 className="text-white font-bold text-lg mb-1">
              Регистрация
            </h4>
            <p className="text-white/90 text-sm mb-4">
              Нужно продлить
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors active:scale-98 flex items-center justify-center shadow-lg">
                Продлить
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
              <button className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
