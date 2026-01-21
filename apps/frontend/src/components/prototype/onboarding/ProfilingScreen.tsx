'use client';

import { Volume2 } from 'lucide-react';
import { useState } from 'react';

interface ProfilingScreenProps {
  onNext: () => void;
}

export function ProfilingScreen({ onNext }: ProfilingScreenProps) {
  const [citizenship, setCitizenship] = useState('');
  const [departureCountry, setDepartureCountry] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState('');

  const isValid = citizenship && departureCountry && entryDate && region && purpose;

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Профилирование
        </h2>
        <p className="text-gray-600">
          Расскажите о себе для персонализации
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5">
          {/* Citizenship */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Гражданство</span>
              <button className="text-blue-600 hover:text-blue-700">
                <Volume2 className="w-4 h-4" />
              </button>
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
              <option value="other">Другая</option>
            </select>
          </div>

          {/* Departure Country */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Страна выезда</span>
              <button className="text-blue-600 hover:text-blue-700">
                <Volume2 className="w-4 h-4" />
              </button>
            </label>
            <select
              value={departureCountry}
              onChange={(e) => setDepartureCountry(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Откуда приехали</option>
              <option value="uz">🇺🇿 Узбекистан</option>
              <option value="tj">🇹🇯 Таджикистан</option>
              <option value="kg">🇰🇬 Киргизия</option>
              <option value="other">Другая</option>
            </select>
          </div>

          {/* Entry Date */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Дата въезда</span>
              <button className="text-blue-600 hover:text-blue-700">
                <Volume2 className="w-4 h-4" />
              </button>
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Region */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Регион</span>
              <button className="text-blue-600 hover:text-blue-700">
                <Volume2 className="w-4 h-4" />
              </button>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Где находитесь</option>
              <option value="moscow">Москва</option>
              <option value="spb">Санкт-Петербург</option>
              <option value="ekb">Екатеринбург</option>
              <option value="nsk">Новосибирск</option>
              <option value="other">Другой регион</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Цель визита</span>
              <button className="text-blue-600 hover:text-blue-700">
                <Volume2 className="w-4 h-4" />
              </button>
            </label>
            <div className="space-y-3">
              {[
                { value: 'work', label: '💼 Работа' },
                { value: 'study', label: '📚 Учеба' },
                { value: 'tourism', label: '✈️ Туризм' },
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
        Далее
      </button>
    </div>
  );
}
