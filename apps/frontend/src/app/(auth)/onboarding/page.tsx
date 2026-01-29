'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Globe, Calendar, Target, CheckCircle } from 'lucide-react';
import { useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { COUNTRIES, PRIORITY_COUNTRIES, isEAEUCountry } from '@/data';

type Step = 'citizenship' | 'entry' | 'purpose' | 'complete';

const CITIZENSHIPS = COUNTRIES
  .filter(c => PRIORITY_COUNTRIES.includes(c.iso))
  .map(c => ({
    code: c.iso,
    name: c.name.ru,
    flag: c.flag,
    isEAEU: isEAEUCountry(c.iso),
  }));

const PURPOSES = [
  { id: 'work', label: 'Работа', icon: '💼', description: 'Трудовая деятельность по патенту или разрешению' },
  { id: 'study', label: 'Учёба', icon: '📚', description: 'Обучение в вузе или колледже' },
  { id: 'tourist', label: 'Туризм', icon: '🏖️', description: 'Туристическая поездка до 90 дней' },
  { id: 'private', label: 'Частный визит', icon: '👨‍👩‍👧', description: 'Посещение родственников или друзей' },
  { id: 'business', label: 'Бизнес', icon: '💰', description: 'Деловая поездка или переговоры' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setProfile } = useProfileStore();

  const [step, setStep] = useState<Step>('citizenship');
  const [citizenship, setCitizenship] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleNext = () => {
    if (step === 'citizenship' && citizenship) {
      setStep('entry');
    } else if (step === 'entry' && entryDate) {
      setStep('purpose');
    } else if (step === 'purpose' && purpose) {
      setStep('complete');
      // Save profile
      const newProfile = {
        id: crypto.randomUUID(),
        userId: crypto.randomUUID(),
        citizenship,
        entryDate,
        purpose,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(newProfile as any);
      // Navigate to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step === 'entry') setStep('citizenship');
    if (step === 'purpose') setStep('entry');
  };

  const getStepNumber = () => {
    switch (step) {
      case 'citizenship': return 1;
      case 'entry': return 2;
      case 'purpose': return 3;
      case 'complete': return 4;
    }
  };

  const selectedCountry = CITIZENSHIPS.find(c => c.code === citizenship);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Progress header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900">Профилирование</h1>
          <span className="text-sm text-gray-500">{getStepNumber()} / 3</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(getStepNumber() / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {/* Step 1: Citizenship */}
        {step === 'citizenship' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Откуда вы?
              </h2>
              <p className="text-gray-500">
                Выберите страну вашего гражданства
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CITIZENSHIPS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCitizenship(c.code)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    citizenship === c.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl mb-2">{c.flag}</span>
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  {c.isEAEU && (
                    <span className="text-xs text-green-600 mt-1">ЕАЭС</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Entry Date */}
        {step === 'entry' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Когда вы въехали?
              </h2>
              <p className="text-gray-500">
                Укажите дату въезда в Россию
              </p>
            </div>

            {selectedCountry && (
              <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white rounded-xl">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span className="font-medium">{selectedCountry.name}</span>
              </div>
            )}

            <div className="bg-white rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата въезда в РФ
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Важно:</strong> Дата въезда определяет сроки оформления документов и расчёт 90/180 дней.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Purpose */}
        {step === 'purpose' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Цель визита?
              </h2>
              <p className="text-gray-500">
                Выберите основную цель пребывания
              </p>
            </div>

            <div className="space-y-3">
              {PURPOSES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    purpose === p.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{p.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{p.label}</div>
                    <div className="text-sm text-gray-500">{p.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Готово!
            </h2>
            <p className="text-gray-500 mb-4">
              Ваш профиль настроен. Переходим к главному экрану...
            </p>
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      {step !== 'complete' && (
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            {step !== 'citizenship' && (
              <button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 'citizenship' && !citizenship) ||
                (step === 'entry' && !entryDate) ||
                (step === 'purpose' && !purpose)
              }
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Далее
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
