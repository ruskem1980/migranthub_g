'use client';

import { useState } from 'react';

interface FormScreenProps {
  onNext: () => void;
}

export function FormScreen({ onNext }: FormScreenProps) {
  const [citizenship, setCitizenship] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [purpose, setPurpose] = useState('');

  const isValid = citizenship && entryDate && purpose;

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Анкета мигранта
        </h2>
        <p className="text-gray-600">
          Заполните данные для расчета плана легализации
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Citizenship */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Гражданство
            </label>
            <select
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите страну</option>
              <option value="uz">🇺🇿 Узбекистан</option>
              <option value="tj">🇹🇯 Таджикистан</option>
              <option value="kg">🇰🇬 Киргизия</option>
            </select>
          </div>

          {/* Entry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Дата въезда
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Цель визита
            </label>
            <div className="space-y-3">
              {[
                { value: 'work', label: '💼 Работа' },
                { value: 'study', label: '📚 Учеба' },
                { value: 'private', label: '🏠 Частное' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPurpose(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    purpose === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    purpose === option.value
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {purpose === option.value && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className={`w-full font-bold py-4 px-6 rounded-2xl transition-all mt-6 ${
          isValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Рассчитать план легализации
      </button>
    </div>
  );
}
