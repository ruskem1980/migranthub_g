'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  ArrowLeft,
  Edit3,
  RefreshCw,
  Clock,
  MapPin,
} from 'lucide-react';
import { useStayPeriods } from '@/features/services/hooks/useStayPeriods';
import { DeportationModeWarning } from '@/features/services/components/DeportationModeWarning';
import { formatDateShort } from '@/features/services/calculator/stay-calculator';
import {
  RegionType,
  getPenaltyInfo,
  getSavedRegion,
  saveRegion,
} from '@/features/services/calculator/penalty-calculator';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Все регионы России с категориями штрафов
const REGIONS = {
  moscow: [
    { value: 'moscow_city', label: 'Москва' },
    { value: 'moscow_oblast', label: 'Московская область' },
  ],
  spb: [
    { value: 'spb_city', label: 'Санкт-Петербург' },
    { value: 'leningrad_oblast', label: 'Ленинградская область' },
  ],
  other: [
    { value: 'adygea', label: 'Республика Адыгея' },
    { value: 'altai_rep', label: 'Республика Алтай' },
    { value: 'altai_krai', label: 'Алтайский край' },
    { value: 'amur', label: 'Амурская область' },
    { value: 'arkhangelsk', label: 'Архангельская область' },
    { value: 'astrakhan', label: 'Астраханская область' },
    { value: 'bashkortostan', label: 'Республика Башкортостан' },
    { value: 'belgorod', label: 'Белгородская область' },
    { value: 'bryansk', label: 'Брянская область' },
    { value: 'buryatia', label: 'Республика Бурятия' },
    { value: 'chechen', label: 'Чеченская Республика' },
    { value: 'chelyabinsk', label: 'Челябинская область' },
    { value: 'chukotka', label: 'Чукотский АО' },
    { value: 'chuvash', label: 'Чувашская Республика' },
    { value: 'dagestan', label: 'Республика Дагестан' },
    { value: 'ingushetia', label: 'Республика Ингушетия' },
    { value: 'irkutsk', label: 'Иркутская область' },
    { value: 'ivanovo', label: 'Ивановская область' },
    { value: 'kabardino', label: 'Кабардино-Балкарская Республика' },
    { value: 'kaliningrad', label: 'Калининградская область' },
    { value: 'kalmykia', label: 'Республика Калмыкия' },
    { value: 'kaluga', label: 'Калужская область' },
    { value: 'kamchatka', label: 'Камчатский край' },
    { value: 'karachaevo', label: 'Карачаево-Черкесская Республика' },
    { value: 'karelia', label: 'Республика Карелия' },
    { value: 'kemerovo', label: 'Кемеровская область' },
    { value: 'khabarovsk', label: 'Хабаровский край' },
    { value: 'khakassia', label: 'Республика Хакасия' },
    { value: 'khanty', label: 'Ханты-Мансийский АО' },
    { value: 'kirov', label: 'Кировская область' },
    { value: 'komi', label: 'Республика Коми' },
    { value: 'kostroma', label: 'Костромская область' },
    { value: 'krasnodar', label: 'Краснодарский край' },
    { value: 'krasnoyarsk', label: 'Красноярский край' },
    { value: 'kurgan', label: 'Курганская область' },
    { value: 'kursk', label: 'Курская область' },
    { value: 'lipetsk', label: 'Липецкая область' },
    { value: 'magadan', label: 'Магаданская область' },
    { value: 'mari_el', label: 'Республика Марий Эл' },
    { value: 'mordovia', label: 'Республика Мордовия' },
    { value: 'murmansk', label: 'Мурманская область' },
    { value: 'nenets', label: 'Ненецкий АО' },
    { value: 'nizhny', label: 'Нижегородская область' },
    { value: 'north_ossetia', label: 'Республика Северная Осетия' },
    { value: 'novgorod', label: 'Новгородская область' },
    { value: 'novosibirsk', label: 'Новосибирская область' },
    { value: 'omsk', label: 'Омская область' },
    { value: 'orenburg', label: 'Оренбургская область' },
    { value: 'oryol', label: 'Орловская область' },
    { value: 'penza', label: 'Пензенская область' },
    { value: 'perm', label: 'Пермский край' },
    { value: 'primorsky', label: 'Приморский край' },
    { value: 'pskov', label: 'Псковская область' },
    { value: 'rostov', label: 'Ростовская область' },
    { value: 'ryazan', label: 'Рязанская область' },
    { value: 'sakha', label: 'Республика Саха (Якутия)' },
    { value: 'sakhalin', label: 'Сахалинская область' },
    { value: 'samara', label: 'Самарская область' },
    { value: 'saratov', label: 'Саратовская область' },
    { value: 'smolensk', label: 'Смоленская область' },
    { value: 'stavropol', label: 'Ставропольский край' },
    { value: 'sverdlovsk', label: 'Свердловская область' },
    { value: 'tambov', label: 'Тамбовская область' },
    { value: 'tatarstan', label: 'Республика Татарстан' },
    { value: 'tomsk', label: 'Томская область' },
    { value: 'tula', label: 'Тульская область' },
    { value: 'tuva', label: 'Республика Тыва' },
    { value: 'tver', label: 'Тверская область' },
    { value: 'tyumen', label: 'Тюменская область' },
    { value: 'udmurt', label: 'Удмуртская Республика' },
    { value: 'ulyanovsk', label: 'Ульяновская область' },
    { value: 'vladimir', label: 'Владимирская область' },
    { value: 'volgograd', label: 'Волгоградская область' },
    { value: 'vologda', label: 'Вологодская область' },
    { value: 'voronezh', label: 'Воронежская область' },
    { value: 'yamalo', label: 'Ямало-Ненецкий АО' },
    { value: 'yaroslavl', label: 'Ярославская область' },
    { value: 'jewish', label: 'Еврейская АО' },
    { value: 'zabaykalsky', label: 'Забайкальский край' },
  ],
};

// Топ-5 регионов по количеству мигрантов
const TOP_REGIONS = [
  { value: 'moscow', label: 'Москва', category: 'moscow' as RegionType },
  { value: 'moscow_oblast', label: 'Московская обл.', category: 'moscow' as RegionType },
  { value: 'spb', label: 'Санкт-Петербург', category: 'spb' as RegionType },
  { value: 'krasnodar', label: 'Краснодарский край', category: 'other' as RegionType },
  { value: 'tatarstan', label: 'Татарстан', category: 'other' as RegionType },
];

/**
 * Region selector component
 */
function RegionSelector({
  value,
  onChange,
  t,
}: {
  value: RegionType | null;
  onChange: (region: RegionType, regionName: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Синхронизируем локальное состояние с внешним
  useEffect(() => {
    if (!value) {
      setSelectedValue('');
    }
  }, [value]);

  const handleButtonClick = (region: typeof TOP_REGIONS[0]) => {
    setSelectedValue(region.value);
    setShowDropdown(false);
    onChange(region.category, region.label);
  };

  const handleRegionSelect = (regionValue: string, category: RegionType, label: string) => {
    setSelectedValue(regionValue);
    setShowDropdown(false);
    onChange(category, label);
  };

  // Получаем название выбранного региона из полного списка
  const getSelectedRegionLabel = () => {
    if (!selectedValue || TOP_REGIONS.some(r => r.value === selectedValue)) {
      return null;
    }
    const allRegions = [...REGIONS.moscow, ...REGIONS.spb, ...REGIONS.other];
    const region = allRegions.find(r => r.value === selectedValue);
    return region?.label || null;
  };

  const selectedOtherLabel = getSelectedRegionLabel();

  const getLocalPenaltyInfo = () => {
    if (!value) return null;
    if (value === 'moscow' || value === 'spb') {
      return {
        text: t('services.calculator.penalty.fineWithDeportation', { min: '5000', max: '7000' }),
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    }
    return {
      text: t('services.calculator.penalty.fineOnly', { min: '2000', max: '5000' }),
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    };
  };

  const penaltyInfo = getLocalPenaltyInfo();

  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <MapPin className="w-4 h-4" />
        {t('services.calculator.region')} <span className="text-red-500">*</span>
      </label>

      {/* Топ-5 кнопок */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {TOP_REGIONS.map((region) => (
          <button
            key={region.value}
            type="button"
            onClick={() => handleButtonClick(region)}
            className={`p-3 rounded-xl text-sm font-medium transition-all ${
              selectedValue === region.value
                ? 'bg-blue-600 text-white border-2 border-blue-600'
                : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            {region.label}
          </button>
        ))}

        {/* Кнопка "Другой регион" */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-3 rounded-xl text-sm font-medium transition-all ${
            showDropdown || selectedOtherLabel
              ? 'bg-blue-600 text-white border-2 border-blue-600'
              : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300'
          }`}
        >
          {selectedOtherLabel || t('services.calculator.regionOther')} {showDropdown ? '▲' : '▼'}
        </button>
      </div>

      {/* Полный список регионов */}
      {showDropdown && (
        <div className="mt-2 border-2 border-blue-300 rounded-xl bg-white overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {/* Повышенные штрафы */}
            <div className="sticky top-0 bg-red-50 px-3 py-2 border-b border-red-200">
              <span className="text-xs font-semibold text-red-700">{t('services.calculator.increasedFines')} (5000-7000)</span>
            </div>
            <div className="p-2 space-y-1">
              {[...REGIONS.moscow, ...REGIONS.spb].map(r => {
                const category: RegionType = REGIONS.moscow.some(m => m.value === r.value) ? 'moscow' : 'spb';
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRegionSelect(r.value, category, r.label)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedValue === r.value
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-red-50 text-gray-700'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Остальные регионы */}
            <div className="sticky top-0 bg-gray-100 px-3 py-2 border-y border-gray-200">
              <span className="text-xs font-semibold text-gray-600">{t('services.calculator.standardFines')} (2000-5000)</span>
            </div>
            <div className="p-2 space-y-1">
              {REGIONS.other.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRegionSelect(r.value, 'other', r.label)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedValue === r.value
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Подсказка по штрафу */}
      {penaltyInfo && (
        <div className={`mt-3 p-3 rounded-lg ${penaltyInfo.bg} border ${penaltyInfo.border}`}>
          <p className={`text-sm font-medium ${penaltyInfo.color}`}>
            {penaltyInfo.text}
          </p>
        </div>
      )}

      {!selectedValue && (
        <p className="text-sm text-orange-600 mt-2">{t('services.calculator.regionRequired')}</p>
      )}
    </div>
  );
}

/**
 * Penalty warning component shown when status is danger or overstay
 */
function PenaltyWarning({
  region,
  t,
}: {
  region: RegionType;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const penaltyInfo = getPenaltyInfo(region);

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-2">
            {t('services.calculator.penalty.title')}
          </h4>
          <div className="text-sm text-red-800 space-y-1">
            <p>
              {t('services.calculator.penalty.fine', {
                min: penaltyInfo.minFine.toLocaleString(),
                max: penaltyInfo.maxFine.toLocaleString(),
              })}
            </p>
            <p className={penaltyInfo.canBeDeported ? 'font-semibold' : ''}>
              {penaltyInfo.canBeDeported
                ? t('services.calculator.penalty.deportation')
                : t('services.calculator.penalty.noDeportation')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Circular progress indicator
 */
function CircularProgress({
  percent,
  status,
  size = 160,
  strokeWidth = 12,
}: {
  percent: number;
  status: 'safe' | 'warning' | 'danger' | 'overstay';
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  const getColor = () => {
    switch (status) {
      case 'overstay':
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#eab308';
      case 'safe':
      default:
        return '#22c55e';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'overstay':
      case 'danger':
        return '#fecaca';
      case 'warning':
        return '#fef08a';
      case 'safe':
      default:
        return '#bbf7d0';
    }
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getBgColor()}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

/**
 * Period add/edit form
 */
function PeriodForm({
  initialEntry = '',
  initialExit = '',
  onSave,
  onCancel,
  t,
}: {
  initialEntry?: string;
  initialExit?: string;
  onSave: (entry: string, exit?: string) => void;
  onCancel: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const [entryDate, setEntryDate] = useState(initialEntry);
  const [exitDate, setExitDate] = useState(initialExit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryDate) {
      onSave(entryDate, exitDate || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-blue-50 rounded-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">{t('services.calculator.entryDate')} *</label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">{t('services.calculator.exitDate')}</label>
          <input
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            min={entryDate}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">{t('services.calculator.exitDateHint')}</p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!entryDate}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}

export default function CalculatorPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    periods,
    isLoading,
    calculation,
    recommendation,
    addPeriod,
    updatePeriod,
    deletePeriod,
    refresh,
  } = useStayPeriods();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);

  useEffect(() => {
    const saved = getSavedRegion();
    if (saved) {
      setSelectedRegion(saved);
    }
  }, []);

  const handleRegionChange = useCallback((region: RegionType) => {
    setSelectedRegion(region);
    saveRegion(region);
  }, []);

  const showPenaltyWarning = calculation.status === 'danger' || calculation.status === 'overstay';

  const handleAddPeriod = useCallback(
    async (entry: string, exit?: string) => {
      await addPeriod(entry, exit);
      setShowAddForm(false);
    },
    [addPeriod]
  );

  const handleUpdatePeriod = useCallback(
    async (id: string, entry: string, exit?: string) => {
      await updatePeriod(id, { entryDate: entry, exitDate: exit });
      setEditingPeriodId(null);
    },
    [updatePeriod]
  );

  const handleDeletePeriod = useCallback(
    async (id: string) => {
      await deletePeriod(id);
    },
    [deletePeriod]
  );

  const getStatusColors = () => {
    switch (calculation.status) {
      case 'overstay':
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          subtext: 'text-yellow-700',
        };
      case 'safe':
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          subtext: 'text-green-700',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('services.calculator.title')}</h1>
              <p className="text-sm text-gray-500">
                {t('services.calculator.pageSubtitle', { year: calculation.currentYear })}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-gray-100 rounded-full"
          title={t('services.calculator.refresh')}
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-6">
        {/* Region selector */}
        <RegionSelector value={selectedRegion} onChange={handleRegionChange} t={t} />

        {/* Penalty warning */}
        {showPenaltyWarning && selectedRegion && <PenaltyWarning region={selectedRegion} t={t} />}

        {/* Circular progress card */}
        <div className={`p-6 rounded-xl mb-6 ${colors.bg} border-2 ${colors.border}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CircularProgress percent={calculation.usagePercent} status={calculation.status} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${colors.text}`}>
                  {calculation.isOverstay ? '+' : ''}
                  {calculation.isOverstay ? calculation.overstayDays : calculation.daysRemaining}
                </span>
                <span className={`text-sm ${colors.subtext}`}>
                  {calculation.isOverstay ? t('services.calculator.daysOver') : t('services.calculator.daysLeft')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            {calculation.isOverstay ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle
                className={`w-5 h-5 ${
                  calculation.status === 'safe'
                    ? 'text-green-600'
                    : calculation.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              />
            )}
            <span className={`font-semibold ${colors.text}`}>
              {t('services.calculator.usedDays', { used: calculation.totalDays, total: 90, year: calculation.currentYear })}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                calculation.status === 'overstay' || calculation.status === 'danger'
                  ? 'bg-red-500'
                  : calculation.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, calculation.usagePercent)}%` }}
            />
          </div>
        </div>

        {/* Next reset date */}
        {calculation.nextResetDate && (
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl mb-6">
            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-800">
              <strong>{t('services.calculator.resetLimit.title')}:</strong> {t('services.calculator.resetLimit.date', { year: calculation.currentYear + 1 })}
              <br />
              <span className="text-purple-600">
                {t('services.calculator.resetLimit.daysUntil', { days: calculation.daysUntilReset })}
              </span>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div
          className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
            recommendation.type === 'error'
              ? 'bg-red-50'
              : recommendation.type === 'warning'
                ? 'bg-yellow-50'
                : recommendation.type === 'success'
                  ? 'bg-green-50'
                  : 'bg-blue-50'
          }`}
        >
          {recommendation.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : recommendation.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          ) : recommendation.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div
            className={`text-sm ${
              recommendation.type === 'error'
                ? 'text-red-800'
                : recommendation.type === 'warning'
                  ? 'text-yellow-800'
                  : recommendation.type === 'success'
                    ? 'text-green-800'
                    : 'text-blue-800'
            }`}
          >
            <strong>{recommendation.title}</strong>
            <br />
            {recommendation.message}
          </div>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            {t('services.calculator.rule')}
          </div>
        </div>

        {/* Periods header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{t('services.calculator.periods.title')}</h3>
          <span className="text-sm text-gray-500">{t('services.calculator.periods.count', { count: periods.length })}</span>
        </div>

        {/* Add period form */}
        {showAddForm ? (
          <div className="mb-4">
            <PeriodForm onSave={handleAddPeriod} onCancel={() => setShowAddForm(false)} t={t} />
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors mb-4"
          >
            <Plus className="w-5 h-5" />
            {t('services.calculator.periods.addEntry')}
          </button>
        )}

        {/* Periods list */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : periods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>{t('services.calculator.periods.noPeriods')}</p>
            <p className="text-sm">{t('services.calculator.periods.addDatesHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {periods.map((period) => (
              <div key={period.id}>
                {editingPeriodId === period.id ? (
                  <PeriodForm
                    initialEntry={period.entryDate}
                    initialExit={period.exitDate || ''}
                    onSave={(entry, exit) => handleUpdatePeriod(period.id, entry, exit)}
                    onCancel={() => setEditingPeriodId(null)}
                    t={t}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {formatDateShort(new Date(period.entryDate))}
                          </span>
                          <span className="text-gray-400">→</span>
                          {period.exitDate ? (
                            <span className="font-medium text-gray-900">
                              {formatDateShort(new Date(period.exitDate))}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {t('services.calculator.periods.currentlyInRussia')}
                            </span>
                          )}
                        </div>
                        {period.migrationCardId && (
                          <span className="text-xs text-gray-500">
                            {t('services.calculator.periods.linkedToMigrationCard')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingPeriodId(period.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title={t('common.edit')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Deportation mode warning */}
        <DeportationModeWarning status={calculation.status} />
      </div>

      {/* Fixed bottom close button */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => router.push('/services')}
          className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          {t('services.calculator.close')}
        </button>
      </div>
    </div>
  );
}
