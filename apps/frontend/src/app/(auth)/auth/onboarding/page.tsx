'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flag, ArrowRight } from 'lucide-react';
import { useAppStore, useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [selectedCitizenship, setSelectedCitizenship] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setLanguage, setOnboardingCompleted } = useAppStore();
  const { updateProfile } = useProfileStore();

  // Get citizenships from translations
  const CITIZENSHIPS = [
    { code: 'UZ', name: t('countries.UZ'), flag: '🇺🇿' },
    { code: 'TJ', name: t('countries.TJ'), flag: '🇹🇯' },
    { code: 'KG', name: t('countries.KG'), flag: '🇰🇬' },
    { code: 'AZ', name: t('countries.AZ'), flag: '🇦🇿' },
    { code: 'AM', name: t('countries.AM'), flag: '🇦🇲' },
    { code: 'MD', name: t('countries.MD'), flag: '🇲🇩' },
    { code: 'UA', name: t('countries.UA'), flag: '🇺🇦' },
    { code: 'OTHER', name: t('countries.OTHER'), flag: '🌍' },
  ];

  const handleCitizenshipSelect = (code: string) => {
    setSelectedCitizenship(code);
  };

  const handleContinue = async () => {
    if (selectedCitizenship) {
      setIsLoading(true);

      try {
        // Save preferences (language was already set in welcome screen)
        setLanguage(language as any);
        updateProfile({
          citizenship: selectedCitizenship,
          language: language as any,
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

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Flag className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.citizenship.title')}
        </h2>
        <p className="text-gray-500">
          {t('onboarding.citizenship.subtitle')}
        </p>
      </div>

      {/* Citizenship Grid */}
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

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selectedCitizenship || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="animate-pulse">{t('common.saving')}</span>
        ) : (
          <>
            {t('common.start')}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
