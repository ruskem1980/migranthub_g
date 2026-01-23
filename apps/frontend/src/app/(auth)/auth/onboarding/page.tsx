'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flag, ArrowRight, Volume2, AlertTriangle } from 'lucide-react';
import { useAppStore, useProfileStore } from '@/lib/stores';
import { useTranslation } from '@/lib/i18n';
import { profileApi } from '@/lib/api/client';

export default function OnboardingPage() {
  const router = useRouter();
  const { language, t } = useTranslation();
  const [selectedCitizenship, setSelectedCitizenship] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState<'work' | 'study' | 'tourist' | 'private' | 'business' | 'transit' | ''>('');
  const [showOtherCitizenship, setShowOtherCitizenship] = useState(false);
  const [showOtherRegion, setShowOtherRegion] = useState(false);
  const [otherCitizenshipValue, setOtherCitizenshipValue] = useState('');
  const [otherRegionValue, setOtherRegionValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setOnboardingCompleted } = useAppStore();
  const { updateProfile } = useProfileStore();

  // Main citizenships
  const MAIN_CITIZENSHIPS = [
    { code: 'UZ', name: t('countries.UZ'), flag: '🇺🇿' },
    { code: 'TJ', name: t('countries.TJ'), flag: '🇹🇯' },
    { code: 'KG', name: t('countries.KG'), flag: '🇰🇬' },
  ];

  // Other citizenships for dropdown
  const OTHER_CITIZENSHIPS = [
    { code: 'AM', name: t('countries.AM'), flag: '🇦🇲', note: '(ЕАЭС)' },
    { code: 'AZ', name: t('countries.AZ'), flag: '🇦🇿' },
    { code: 'BY', name: t('countries.BY'), flag: '🇧🇾', note: '(ЕАЭС)' },
    { code: 'GE', name: t('countries.GE'), flag: '🇬🇪' },
    { code: 'KZ', name: t('countries.KZ'), flag: '🇰🇿', note: '(ЕАЭС)' },
    { code: 'MD', name: t('countries.MD'), flag: '🇲🇩' },
    { code: 'UA', name: t('countries.UA'), flag: '🇺🇦' },
    { code: 'CN', name: t('countries.CN'), flag: '🇨🇳' },
    { code: 'IN', name: t('countries.IN'), flag: '🇮🇳' },
    { code: 'VN', name: t('countries.VN'), flag: '🇻🇳' },
  ];

  // Regions
  const MAIN_REGIONS = [
    { code: 'moscow', name: t('cities.moscow'), icon: '🏙️' },
    { code: 'spb', name: t('cities.saintPetersburg'), icon: '🏛️' },
    { code: 'nsk', name: t('cities.novosibirsk'), icon: '❄️' },
  ];

  const OTHER_REGIONS = [
    { code: 'ekb', name: t('cities.yekaterinburg') },
    { code: 'kazan', name: t('cities.kazan') },
    { code: 'nn', name: t('cities.nizhnyNovgorod') },
    { code: 'samara', name: t('cities.samara') },
    { code: 'omsk', name: t('cities.omsk') },
    { code: 'chelyabinsk', name: t('cities.chelyabinsk') },
    { code: 'rostov', name: t('cities.rostovOnDon') },
    { code: 'ufa', name: t('cities.ufa') },
    { code: 'krasnoyarsk', name: t('cities.krasnoyarsk') },
    { code: 'voronezh', name: t('cities.voronezh') },
    { code: 'perm', name: t('cities.perm') },
    { code: 'volgograd', name: t('cities.volgograd') },
  ];

  // Purposes
  type PurposeType = 'work' | 'study' | 'tourist' | 'private' | 'business' | 'transit';
  const PURPOSES: { value: PurposeType; label: string; subtitle: string }[] = [
    { value: 'work', label: `💼 ${t('profile.purposes.work')}`, subtitle: t('profile.purposes.workSubtitle') },
    { value: 'study', label: `📚 ${t('profile.purposes.study')}`, subtitle: t('profile.purposes.studySubtitle') },
    { value: 'tourist', label: `✈️ ${t('profile.purposes.tourist')}`, subtitle: t('profile.purposes.touristSubtitle') },
    { value: 'private', label: `🏠 ${t('profile.purposes.private')}`, subtitle: t('profile.purposes.privateSubtitle') },
    { value: 'business', label: `💼 ${t('profile.purposes.business')}`, subtitle: '' },
    { value: 'transit', label: `🚗 ${t('profile.purposes.transit')}`, subtitle: '' },
  ];

  // Validation
  const isCitizenshipValid = selectedCitizenship && (selectedCitizenship !== 'OTHER' || otherCitizenshipValue);
  const isRegionValid = region && (region !== 'other' || otherRegionValue);
  const isValid = isCitizenshipValid && entryDate && isRegionValid && purpose;

  // Get departure country display
  const getDepartureCountryDisplay = () => {
    if (selectedCitizenship && selectedCitizenship !== 'OTHER') {
      const country = MAIN_CITIZENSHIPS.find(c => c.code === selectedCitizenship);
      return country ? `${country.flag} ${country.name}` : t('onboarding.profiling.notSelected');
    }
    if (otherCitizenshipValue) {
      return otherCitizenshipValue;
    }
    return t('onboarding.profiling.notSelected');
  };

  const handleContinue = async () => {
    if (!isValid) return;

    setIsLoading(true);

    try {
      const finalCitizenship = selectedCitizenship === 'OTHER' ? otherCitizenshipValue : selectedCitizenship;
      const finalRegion = region === 'other' ? otherRegionValue : region;

      const profileData = {
        citizenship: finalCitizenship,
        language: language,
        entryDate: entryDate,
        region: finalRegion,
        purpose: purpose || undefined,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      // Save locally
      updateProfile(profileData);
      setOnboardingCompleted(true);

      // Sync with server
      try {
        await profileApi.updateProfile(profileData);
      } catch (syncError) {
        // On error - still proceed (offline mode)
        console.error('Failed to sync profile:', syncError);
      }

      router.push('/prototype');
    } catch (error) {
      console.error('Error saving preferences:', error);
      router.push('/prototype');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Flag className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding.profiling.title')}
        </h2>
        <p className="text-gray-500">
          {t('onboarding.profiling.subtitle')}
        </p>
      </div>

      <div className="space-y-5">
        {/* Citizenship */}
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>{t('onboarding.profiling.citizenship')}</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {MAIN_CITIZENSHIPS.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCitizenship(country.code);
                  setOtherCitizenshipValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  selectedCitizenship === country.code
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="font-semibold text-sm">{country.name}</span>
              </button>
            ))}

            <button
              onClick={() => setShowOtherCitizenship(true)}
              className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                selectedCitizenship === 'OTHER' || otherCitizenshipValue
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🌍</span>
              <span className="font-semibold text-sm">
                {otherCitizenshipValue || t('onboarding.profiling.other')}
              </span>
            </button>
          </div>

          {showOtherCitizenship && (
            <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('onboarding.profiling.selectCountry')}
              </label>
              <select
                value={otherCitizenshipValue}
                onChange={(e) => {
                  setOtherCitizenshipValue(e.target.value);
                  setSelectedCitizenship('OTHER');
                  setShowOtherCitizenship(false);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('onboarding.profiling.selectCountry')}</option>
                {OTHER_CITIZENSHIPS.map((c) => (
                  <option key={c.code} value={`${c.flag} ${c.name}`}>
                    {c.flag} {c.name} {c.note || ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowOtherCitizenship(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}
        </div>

        {/* Departure Country - Auto-fill */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">{t('onboarding.profiling.departureCountry')}</p>
              <p className="text-xs text-blue-800">
                {t('onboarding.profiling.autoFill')}: {getDepartureCountryDisplay()}
              </p>
            </div>
          </div>
        </div>

        {/* Entry Date */}
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>{t('onboarding.profiling.entryDate')}</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
            </button>
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setEntryDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              {t('onboarding.profiling.today')}
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setEntryDate(yesterday.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {t('onboarding.profiling.yesterday')}
            </button>
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>{t('onboarding.profiling.region')}</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {MAIN_REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => {
                  setRegion(r.code);
                  setOtherRegionValue('');
                }}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all ${
                  region === r.code
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="font-semibold text-sm">{r.name}</span>
              </button>
            ))}

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
                {otherRegionValue || t('onboarding.profiling.other')}
              </span>
            </button>
          </div>

          {showOtherRegion && (
            <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('onboarding.profiling.selectRegion')}
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
                <option value="">{t('onboarding.profiling.selectRegion')}</option>
                {OTHER_REGIONS.map((r) => (
                  <option key={r.code} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowOtherRegion(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>{t('onboarding.profiling.purpose')}</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {PURPOSES.map((option) => (
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
                {option.subtitle && (
                  <span className="text-xs text-gray-500 ml-6">{option.subtitle}</span>
                )}
              </button>
            ))}
          </div>

          {/* Legal Warning */}
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ {t('onboarding.profiling.important')}</p>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  {t('onboarding.profiling.purposeWarning')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!isValid || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-6"
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
