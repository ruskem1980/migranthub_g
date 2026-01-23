'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Globe, Flag, ArrowRight } from 'lucide-react';
import { useAppStore, useProfileStore } from '@/lib/stores';

const LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz-Latn', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
];

const CITIZENSHIPS = [
  { code: 'UZ', name: 'Узбекистан', flag: '🇺🇿' },
  { code: 'TJ', name: 'Таджикистан', flag: '🇹🇯' },
  { code: 'KG', name: 'Кыргызстан', flag: '🇰🇬' },
  { code: 'AZ', name: 'Азербайджан', flag: '🇦🇿' },
  { code: 'AM', name: 'Армения', flag: '🇦🇲' },
  { code: 'MD', name: 'Молдова', flag: '🇲🇩' },
  { code: 'UA', name: 'Украина', flag: '🇺🇦' },
  { code: 'OTHER', name: 'Другая страна', flag: '🌍' },
];

type Step = 'language' | 'citizenship';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('language');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCitizenship, setSelectedCitizenship] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setLanguage, setOnboardingCompleted } = useAppStore();
  const { updateProfile } = useProfileStore();

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleCitizenshipSelect = (code: string) => {
    setSelectedCitizenship(code);
  };

  const handleContinue = async () => {
    if (step === 'language' && selectedLanguage) {
      setStep('citizenship');
      return;
    }

    if (step === 'citizenship' && selectedCitizenship) {
      setIsLoading(true);

      try {
        // Save preferences
        setLanguage(selectedLanguage as any);
        updateProfile({
          citizenship: selectedCitizenship,
          language: selectedLanguage.split('-')[0] as any,
          onboardingCompleted: true,
          updatedAt: new Date().toISOString(),
        });
        setOnboardingCompleted(true);

        // Navigate to main app
        router.push('/prototype');
      } catch (error) {
        console.error('Error saving preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canContinue = step === 'language' ? !!selectedLanguage : !!selectedCitizenship;

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className={`flex-1 h-1 rounded-full ${step === 'language' || step === 'citizenship' ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step === 'citizenship' ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      {step === 'language' && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Выберите язык
            </h2>
            <p className="text-gray-500">
              На каком языке вам удобнее?
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="flex-1 text-left font-semibold text-gray-900">
                  {lang.name}
                </span>
                {selectedLanguage === lang.code && (
                  <Check className="w-6 h-6 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'citizenship' && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ваше гражданство
            </h2>
            <p className="text-gray-500">
              Это поможет нам подобрать нужную информацию
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {CITIZENSHIPS.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCitizenshipSelect(country.code)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedCitizenship === country.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl">{country.flag}</span>
                <span className="text-sm font-semibold text-gray-900 text-center">
                  {country.name}
                </span>
                {selectedCitizenship === country.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="animate-pulse">Сохранение...</span>
        ) : (
          <>
            {step === 'citizenship' ? 'Начать' : 'Продолжить'}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Back button for citizenship step */}
      {step === 'citizenship' && (
        <button
          onClick={() => setStep('language')}
          className="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 font-medium"
        >
          Назад
        </button>
      )}
    </div>
  );
}
