'use client';

import { QrCode, ChevronRight, Volume2, History, Lock, Edit2, Globe, Trash2, X, Rocket } from 'lucide-react';
import { useState } from 'react';
import { LegalizationWizard } from '../wizard/LegalizationWizard';

export function HomeScreen() {
  const [showHistory, setShowHistory] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editEntryDate, setEditEntryDate] = useState('2024-01-01');
  const [editPurpose, setEditPurpose] = useState('work');

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
            onClick={() => setShowProfileEdit(true)}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Edit2 className="w-6 h-6" />
          </button>
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

      {/* Identity Card with Status Badge */}
      <div className="px-4 py-4">
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-lg">Алишер Усманов</h3>
                {/* Compact Status Badge */}
                <button 
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 hover:bg-green-500 rounded-full transition-colors active:scale-95"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Legal</span>
                </button>
              </div>
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

      {/* Days Counter Card */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Осталось дней пребывания</p>
              <p className="text-3xl font-bold text-gray-900">88</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Патент оплачен до</p>
              <p className="text-lg font-semibold text-gray-900">15 апреля 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA - Legalization Wizard */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowWizard(true)}
          className="w-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all active:scale-98 relative overflow-hidden group"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">🚀 Оформить документы</h3>
                  <p className="text-sm text-green-100">Старт легализации</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-left">
              <p className="text-xs text-white/90 leading-relaxed">
                На основе вашего первичного аудита мы сгенерируем все заявления и покажем точный план действий
              </p>
            </div>
          </div>
        </button>
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

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Редактировать профиль</h3>
              </div>
              <button onClick={() => setShowProfileEdit(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Entry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Дата въезда
                </label>
                <input
                  type="date"
                  value={editEntryDate}
                  onChange={(e) => setEditEntryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Quick Action Chips */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setEditEntryDate(today);
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors active:scale-95 border border-blue-200"
                  >
                    Сегодня
                  </button>
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setEditEntryDate(yesterday.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors active:scale-95 border border-gray-200"
                  >
                    Вчера
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Изменение даты въезда пересчитает счетчик 90/180 дней
                </p>
              </div>

              {/* Purpose of Visit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Цель визита
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'work', label: '💼 Работа', subtitle: 'Трудовая деятельность' },
                    { value: 'study', label: '📚 Учеба', subtitle: 'Вузы/колледжи' },
                    { value: 'tourism', label: '✈️ Туризм', subtitle: 'Отдых' },
                    { value: 'private', label: '🏠 Частный', subtitle: 'Гости' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditPurpose(option.value)}
                      className={`flex flex-col items-start gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                        editPurpose === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          editPurpose === option.value
                            ? 'border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {editPurpose === option.value && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <span className="font-semibold text-sm">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">{option.subtitle}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Изменение цели визита может повлиять на право получения патента
                  </p>
                </div>
              </div>

              {/* Settings Section */}
              <div className="pt-4 border-t-2 border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Настройки</h4>
                
                {/* Language Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Язык интерфейса
                  </label>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">🇷🇺 Русский</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Delete Data */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-600">Удалить все данные</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Это действие необратимо. Все документы и история будут удалены.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Сохранить изменения
              </button>
              
              <button
                onClick={() => setShowProfileEdit(false)}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legalization Wizard */}
      {showWizard && (
        <LegalizationWizard
          onClose={() => setShowWizard(false)}
          profileData={{
            citizenship: 'Узбекистан',
            entryDate: '2024-01-01',
            purpose: 'Работа',
            checkedDocs: ['passport', 'mig_card'], // Mock data
          }}
        />
      )}
    </div>
  );
}
