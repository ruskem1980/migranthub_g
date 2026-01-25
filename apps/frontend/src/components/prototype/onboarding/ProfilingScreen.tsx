'use client';

import { Volume2, AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useProfileStore } from '@/lib/stores';

interface ProfilingScreenProps {
  onNext: () => void;
}

export function ProfilingScreen({ onNext }: ProfilingScreenProps) {
  const { t } = useTranslation();
  const { updateProfile } = useProfileStore();
  const [citizenship, setCitizenship] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [region, setRegion] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showOtherCitizenship, setShowOtherCitizenship] = useState(false);
  const [showOtherRegion, setShowOtherRegion] = useState(false);
  const [otherCitizenshipValue, setOtherCitizenshipValue] = useState('');
  const [otherRegionValue, setOtherRegionValue] = useState('');

  // Validation: all fields must be filled
  // For "other" options, check if the specific value is selected
  const isCitizenshipValid = citizenship && (citizenship !== 'other' || otherCitizenshipValue);
  const isRegionValid = region && (region !== 'other' || otherRegionValue);
  const isValid = isCitizenshipValid && entryDate && isRegionValid && purpose;

  // Map citizenship code to ISO 3-letter code
  const getCitizenshipCode = (): string => {
    const codeMap: Record<string, string> = {
      uz: 'UZB',
      tj: 'TJK',
      kg: 'KGZ',
    };
    if (citizenship === 'other') {
      return otherCitizenshipValue;
    }
    return codeMap[citizenship] || citizenship.toUpperCase();
  };

  // Map purpose to profileStore format
  const getPurposeValue = (): 'work' | 'study' | 'tourist' | 'private' | undefined => {
    const purposeMap: Record<string, 'work' | 'study' | 'tourist' | 'private'> = {
      work: 'work',
      study: 'study',
      tourism: 'tourist',
      private: 'private',
    };
    return purposeMap[purpose];
  };

  // Get region display value
  const getRegionValue = (): string => {
    const regionMap: Record<string, string> = {
      moscow: 'Москва',
      spb: 'Санкт-Петербург',
      nsk: 'Новосибирск',
    };
    if (region === 'other') {
      return otherRegionValue;
    }
    return regionMap[region] || region;
  };

  // Save profile data and proceed
  const handleSubmit = () => {
    updateProfile({
      citizenship: getCitizenshipCode(),
      entryDate,
      purpose: getPurposeValue(),
      patentRegion: getRegionValue(),
    });
    onNext();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header with Language Switcher */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">MigrantHub</h1>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('onboarding.profiling.title')}
          </h2>
          <p className="text-gray-600">
            {t('onboarding.profiling.subtitle')}
          </p>
        </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-5">
          {/* Citizenship */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>{t('onboarding.profiling.citizenship')}</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
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
                <span className="font-semibold text-sm">{t('countries.UZ')}</span>
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
                <span className="font-semibold text-sm">{t('countries.TJ')}</span>
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
                <span className="font-semibold text-sm">{t('countries.KG')}</span>
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
                  {otherCitizenshipValue || t('onboarding.profiling.other')}
                </span>
              </button>
            </div>

            {/* Other Citizenship Dropdown */}
            {showOtherCitizenship && (
              <div className="mt-3 p-4 bg-white border-2 border-blue-200 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('onboarding.profiling.selectCountry')}
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
                  <option value="">{t('onboarding.profiling.selectCountry')}</option>
                  <option value="🇦🇲 Армения">🇦🇲 {t('countries.AM')} (ЕАЭС)</option>
                  <option value="🇦🇿 Азербайджан">🇦🇿 {t('countries.AZ')}</option>
                  <option value="🇧🇾 Беларусь">🇧🇾 {t('countries.BY')} (ЕАЭС)</option>
                  <option value="🇬🇪 Грузия">🇬🇪 {t('countries.GE')}</option>
                  <option value="🇰🇿 Казахстан">🇰🇿 {t('countries.KZ')} (ЕАЭС)</option>
                  <option value="🇲🇩 Молдова">🇲🇩 {t('countries.MD')}</option>
                  <option value="🇺🇦 Украина">🇺🇦 {t('countries.UA')}</option>
                  <option value="🇨🇳 Китай">🇨🇳 {t('countries.CN')}</option>
                  <option value="🇮🇳 Индия">🇮🇳 {t('countries.IN')}</option>
                  <option value="🇻🇳 Вьетнам">🇻🇳 {t('countries.VN')}</option>
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

          {/* Departure Country - Auto-fill from Citizenship */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">{t('onboarding.profiling.departureCountry')}</p>
                <p className="text-xs text-blue-800">
                  {t('onboarding.profiling.autoFill')}: {
                    citizenship === 'uz' ? `🇺🇿 ${t('countries.UZ')}` :
                    citizenship === 'tj' ? `🇹🇯 ${t('countries.TJ')}` :
                    citizenship === 'kg' ? `🇰🇬 ${t('countries.KG')}` :
                    citizenship === 'other' && otherCitizenshipValue ? otherCitizenshipValue :
                    t('onboarding.profiling.notSelected')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Entry Date */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>{t('onboarding.profiling.entryDate')}</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
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
            {/* Quick Action Chips */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setEntryDate(today);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors active:scale-95 border border-blue-200"
              >
                {t('onboarding.profiling.today')}
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setEntryDate(yesterday.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors active:scale-95 border border-gray-200"
              >
                {t('onboarding.profiling.yesterday')}
              </button>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>{t('onboarding.profiling.region')}</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
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
                <span className="font-semibold text-sm">{t('onboarding.profiling.regions.moscow')}</span>
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
                <span className="font-semibold text-sm">{t('onboarding.profiling.regions.spb')}</span>
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
                <span className="font-semibold text-sm">{t('onboarding.profiling.regions.novosibirsk')}</span>
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
                  {otherRegionValue || t('onboarding.profiling.other')}
                </span>
              </button>
            </div>

            {/* Other Region Dropdown */}
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
                  <option value="Екатеринбург">{t('onboarding.profiling.regions.ekaterinburg')}</option>
                  <option value="Казань">{t('onboarding.profiling.regions.kazan')}</option>
                  <option value="Нижний Новгород">{t('onboarding.profiling.regions.nizhny')}</option>
                  <option value="Самара">{t('onboarding.profiling.regions.samara')}</option>
                  <option value="Омск">{t('onboarding.profiling.regions.omsk')}</option>
                  <option value="Челябинск">{t('onboarding.profiling.regions.chelyabinsk')}</option>
                  <option value="Ростов-на-Дону">{t('onboarding.profiling.regions.rostov')}</option>
                  <option value="Уфа">{t('onboarding.profiling.regions.ufa')}</option>
                  <option value="Красноярск">{t('onboarding.profiling.regions.krasnoyarsk')}</option>
                  <option value="Воронеж">{t('onboarding.profiling.regions.voronezh')}</option>
                  <option value="Пермь">{t('onboarding.profiling.regions.perm')}</option>
                  <option value="Волгоград">{t('onboarding.profiling.regions.volgograd')}</option>
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
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">{t('onboarding.profiling.voiceOver')}</span>
              </button>
            </label>

            {/* 2-Column Grid for 7 Options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'work', label: `💼 ${t('onboarding.profiling.purposes.work')}`, subtitle: t('onboarding.profiling.purposes.workDesc') },
                { value: 'study', label: `📚 ${t('onboarding.profiling.purposes.study')}`, subtitle: t('onboarding.profiling.purposes.studyDesc') },
                { value: 'tourism', label: `✈️ ${t('onboarding.profiling.purposes.tourism')}`, subtitle: t('onboarding.profiling.purposes.tourismDesc') },
                { value: 'private', label: `🏠 ${t('onboarding.profiling.purposes.private')}`, subtitle: t('onboarding.profiling.purposes.privateDesc') },
                { value: 'business', label: `💼 ${t('onboarding.profiling.purposes.business')}`, subtitle: t('onboarding.profiling.purposes.businessDesc') },
                { value: 'official', label: `🏛️ ${t('onboarding.profiling.purposes.official')}`, subtitle: t('onboarding.profiling.purposes.officialDesc') },
                { value: 'transit', label: `🚗 ${t('onboarding.profiling.purposes.transit')}`, subtitle: t('onboarding.profiling.purposes.transitDesc') },
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
                  <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ {t('onboarding.profiling.important')}</p>
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    {t('onboarding.profiling.purposeWarning')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full font-bold py-4 px-6 rounded-2xl transition-all mt-6 ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
