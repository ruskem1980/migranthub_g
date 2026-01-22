'use client';

import { Volume2, AlertTriangle, Check } from 'lucide-react';
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
  const [showOtherCitizenship, setShowOtherCitizenship] = useState(false);
  const [showOtherRegion, setShowOtherRegion] = useState(false);
  const [otherCitizenshipValue, setOtherCitizenshipValue] = useState('');
  const [otherRegionValue, setOtherRegionValue] = useState('');

  // Auto-fill departure country from citizenship
  const effectiveDepartureCountry = citizenship;

  // Validation: all fields must be filled
  // For "other" options, check if the specific value is selected
  const isCitizenshipValid = citizenship && (citizenship !== 'other' || otherCitizenshipValue);
  const isRegionValid = region && (region !== 'other' || otherRegionValue);
  const isValid = isCitizenshipValid && entryDate && isRegionValid && purpose;

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
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Гражданство</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Озвучить</span>
              </button>
            </label>
            
            {/* Button Group (3+1) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCitizenship('uz')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  citizenship === 'uz'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🇺🇿</span>
                <span className="font-semibold text-sm">Узбекистан</span>
              </button>

              <button
                onClick={() => setCitizenship('tj')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  citizenship === 'tj'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🇹🇯</span>
                <span className="font-semibold text-sm">Таджикистан</span>
              </button>

              <button
                onClick={() => setCitizenship('kg')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  citizenship === 'kg'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🇰🇬</span>
                <span className="font-semibold text-sm">Кыргызстан</span>
              </button>

              <button
                onClick={() => setShowOtherCitizenship(true)}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  citizenship === 'other' || otherCitizenshipValue
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🌍</span>
                <span className="font-semibold text-sm">
                  {otherCitizenshipValue || 'Другое'}
                </span>
              </button>
            </div>

            {/* Other Citizenship Dropdown */}
            {showOtherCitizenship && (
              <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Выберите страну
                </label>
                <select
                  value={otherCitizenshipValue}
                  onChange={(e) => {
                    setOtherCitizenshipValue(e.target.value);
                    setCitizenship('other');
                    setShowOtherCitizenship(false);
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите страну</option>
                  <option value="🇦🇲 Армения">🇦🇲 Армения (ЕАЭС)</option>
                  <option value="🇦🇿 Азербайджан">🇦🇿 Азербайджан</option>
                  <option value="🇧🇾 Беларусь">🇧🇾 Беларусь (ЕАЭС)</option>
                  <option value="🇬🇪 Грузия">🇬🇪 Грузия</option>
                  <option value="🇰🇿 Казахстан">🇰🇿 Казахстан (ЕАЭС)</option>
                  <option value="🇲🇩 Молдова">🇲🇩 Молдова</option>
                  <option value="🇺🇦 Украина">🇺🇦 Украина</option>
                  <option value="🇨🇳 Китай">🇨🇳 Китай</option>
                  <option value="🇮🇳 Индия">🇮🇳 Индия</option>
                  <option value="🇻🇳 Вьетнам">🇻🇳 Вьетнам</option>
                </select>
                <button
                  onClick={() => setShowOtherCitizenship(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          {/* Departure Country - Auto-fill from Citizenship */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Страна выезда</p>
                <p className="text-xs text-blue-800">
                  Автоматически: {
                    citizenship === 'uz' ? '🇺🇿 Узбекистан' : 
                    citizenship === 'tj' ? '🇹🇯 Таджикистан' : 
                    citizenship === 'kg' ? '🇰🇬 Кыргызстан' : 
                    citizenship === 'other' && otherCitizenshipValue ? otherCitizenshipValue :
                    'Не выбрано'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Entry Date */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>Дата въезда</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Озвучить</span>
              </button>
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* Quick Action Chips */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setEntryDate(today);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors active:scale-95 border border-blue-200"
              >
                Сегодня
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setEntryDate(yesterday.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors active:scale-95 border border-gray-200"
              >
                Вчера
              </button>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Регион пребывания</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Озвучить</span>
              </button>
            </label>
            
            {/* Button Group (3+1) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRegion('moscow')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  region === 'moscow'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🏙️</span>
                <span className="font-semibold text-sm">Москва</span>
              </button>

              <button
                onClick={() => setRegion('spb')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  region === 'spb'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">🏛️</span>
                <span className="font-semibold text-sm">С-Петербург</span>
              </button>

              <button
                onClick={() => setRegion('nsk')}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  region === 'nsk'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">❄️</span>
                <span className="font-semibold text-sm">Новосибирск</span>
              </button>

              <button
                onClick={() => setShowOtherRegion(true)}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  region === 'other' || otherRegionValue
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">📍</span>
                <span className="font-semibold text-sm">
                  {otherRegionValue || 'Другое'}
                </span>
              </button>
            </div>

            {/* Other Region Dropdown */}
            {showOtherRegion && (
              <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Выберите регион
                </label>
                <select
                  value={otherRegionValue}
                  onChange={(e) => {
                    setOtherRegionValue(e.target.value);
                    setRegion('other');
                    setShowOtherRegion(false);
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите регион</option>
                  <option value="Екатеринбург">Екатеринбург</option>
                  <option value="Казань">Казань</option>
                  <option value="Нижний Новгород">Нижний Новгород</option>
                  <option value="Самара">Самара</option>
                  <option value="Омск">Омск</option>
                  <option value="Челябинск">Челябинск</option>
                  <option value="Ростов-на-Дону">Ростов-на-Дону</option>
                  <option value="Уфа">Уфа</option>
                  <option value="Красноярск">Красноярск</option>
                  <option value="Воронеж">Воронеж</option>
                  <option value="Пермь">Пермь</option>
                  <option value="Волгоград">Волгоград</option>
                </select>
                <button
                  onClick={() => setShowOtherRegion(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Цель визита</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Озвучить</span>
              </button>
            </label>
            
            {/* 2-Column Grid for 7 Options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'work', label: '💼 Работа', subtitle: 'Трудовая деятельность' },
                { value: 'study', label: '📚 Учеба', subtitle: 'Вузы/колледжи' },
                { value: 'tourism', label: '✈️ Туризм', subtitle: 'Отдых, путешествия' },
                { value: 'private', label: '🏠 Частный', subtitle: 'Гости, лечение' },
                { value: 'business', label: '💼 Коммерческий', subtitle: 'Переговоры, бизнес' },
                { value: 'official', label: '🏛️ Служебный', subtitle: 'Делегации' },
                { value: 'transit', label: '🚗 Транзит', subtitle: 'Проезд через РФ' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPurpose(option.value)}
                  className={`flex flex-col items-start gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                    purpose === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      purpose === option.value
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {purpose === option.value && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <span className="font-semibold text-sm">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-6">{option.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Legal Warning */}
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ Важно</p>
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    Для получения патента выбирайте «Работа». Изменить цель визита без выезда из РФ нельзя (кроме граждан ЕАЭС).
                  </p>
                </div>
              </div>
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
