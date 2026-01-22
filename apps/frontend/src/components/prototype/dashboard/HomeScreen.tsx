'use client';

import { QrCode, ChevronRight, Volume2, History, Lock } from 'lucide-react';
import { useState } from 'react';

export function HomeScreen() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Главная</h1>
          <p className="text-sm text-gray-500">Статус миграционного учета</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors active:scale-95"
          >
            <History className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95">
            <QrCode className="w-6 h-6" />
          </button>
        </div>
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
        <div className="relative p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl border-2 border-blue-800 shadow-lg overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative flex items-center gap-3">
            {/* Avatar with Photo Placeholder */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-md flex-shrink-0 border-2 border-blue-300">
              АУ
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Алишер Усманов</h3>
              <div className="flex items-center gap-2 text-blue-100 text-xs mt-0.5">
                <span>🇺🇿 Узбекистан</span>
                <span>•</span>
                <span>Патент до 15.04.24</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Lock className="w-3 h-3 text-blue-200" />
                <span className="text-xs text-blue-200">ID: #MH-2024-001</span>
              </div>
            </div>
            
            {/* QR Code */}
            <button className="w-16 h-16 bg-white rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors shadow-md flex-shrink-0">
              <QrCode className="w-8 h-8 text-blue-600" />
            </button>
          </div>
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

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">📜 История</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Журнал операций и платежей</p>

            <div className="space-y-3">
              {/* History Items */}
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">Оплата патента</h4>
                  <span className="text-xs text-gray-500">15.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">Сумма: 5,000₽</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Зашифровано</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">Продление регистрации</h4>
                  <span className="text-xs text-gray-500">10.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">Документы поданы в МВД</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Зашифровано</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">Медицинская справка</h4>
                  <span className="text-xs text-gray-500">05.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">Получена в ММЦ №3</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Зашифровано</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900">Въезд в РФ</h4>
                  <span className="text-xs text-gray-500">01.01.2024</span>
                </div>
                <p className="text-sm text-gray-600">Граница: Домодедово</p>
                <div className="flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">Зашифровано</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full mt-6 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
