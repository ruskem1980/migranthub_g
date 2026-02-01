'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  X,
  Edit3,
  RefreshCw,
  Clock,
  MapPin,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useStayPeriods } from '../hooks/useStayPeriods';
import { DeportationModeWarning } from './DeportationModeWarning';
import { formatDateShort } from '../calculator/stay-calculator';
import {
  RegionCode,
  getPenaltyInfo,
  getSavedRegion,
  saveRegion,
  isHighPenaltyRegion,
} from '../calculator/penalty-calculator';
import { usePatentRegions } from '../hooks/usePatentRegions';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { PatentRegionData } from '@/lib/db';

interface StayCalculatorProps {
  onClose: () => void;
}

/**
 * Region selector component with full list of Russian regions
 */
function RegionSelector({
  value,
  onChange,
  regions,
  isLoading,
  searchRegions,
  t,
}: {
  value: RegionCode | null;
  onChange: (regionCode: RegionCode) => void;
  regions: PatentRegionData[];
  isLoading: boolean;
  searchRegions: (query: string) => PatentRegionData[];
  t: (key: string) => string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRegion = useMemo(() => {
    if (!value) return null;
    return regions.find(r => r.code === value) || null;
  }, [value, regions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return regions;
    return searchRegions(searchQuery);
  }, [searchQuery, regions, searchRegions]);

  const getMatchingCity = (region: PatentRegionData, query: string): string | null => {
    if (!query.trim()) return null;
    const searchLower = query.toLowerCase().trim();
    const matchingCity = region.cities.find(city =>
      city.toLowerCase().includes(searchLower)
    );
    return matchingCity || null;
  };

  const handleSelect = (region: PatentRegionData) => {
    onChange(region.code);
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <MapPin className="w-4 h-4" />
        {t('services.calculator.region')} <span className="text-red-500">*</span>
      </label>
      {!value && (
        <p className="text-sm text-orange-600 mb-2">Выберите ваш регион пребывания</p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl transition-colors ${
            value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <span className={selectedRegion ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {isLoading ? 'Загрузка...' : selectedRegion ? selectedRegion.name : 'Выберите регион'}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Выберите регион или город"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Ничего не найдено
                </div>
              ) : (
                searchResults.map((region) => {
                  const matchingCity = getMatchingCity(region, searchQuery);
                  const isHighPenalty = isHighPenaltyRegion(region.code);
                  return (
                    <button
                      key={region.code}
                      type="button"
                      onClick={() => handleSelect(region)}
                      className={`w-full flex flex-col items-start px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        value === region.code ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-gray-900 font-medium">{region.name}</span>
                        {isHighPenalty && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            Повышенные штрафы
                          </span>
                        )}
                      </div>
                      {matchingCity && matchingCity.toLowerCase() !== region.name.toLowerCase() && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>г. {matchingCity}</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
              {searchQuery
                ? `Найдено: ${searchResults.length}`
                : `Всего регионов: ${regions.length}`}
            </div>
          </div>
        )}
      </div>

      {selectedRegion && (
        <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
          isHighPenaltyRegion(selectedRegion.code)
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {isHighPenaltyRegion(selectedRegion.code)
            ? '⚠️ В этом регионе повышенные штрафы за нарушение правила 90 дней'
            : '✓ Стандартные штрафы за нарушение правила 90 дней'}
        </div>
      )}
    </div>
  );
}

/**
 * Penalty warning component shown when status is danger or overstay
 */
function PenaltyWarning({
  regionCode,
  t,
}: {
  regionCode: RegionCode;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const penaltyInfo = getPenaltyInfo(regionCode);

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
 * Круговой прогресс-индикатор
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
        return '#ef4444'; // red-500
      case 'warning':
        return '#eab308'; // yellow-500
      case 'safe':
      default:
        return '#22c55e'; // green-500
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'overstay':
      case 'danger':
        return '#fecaca'; // red-200
      case 'warning':
        return '#fef08a'; // yellow-200
      case 'safe':
      default:
        return '#bbf7d0'; // green-200
    }
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getBgColor()}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
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
 * Форма добавления/редактирования периода
 */
function PeriodForm({
  initialEntry = '',
  initialExit = '',
  onSave,
  onCancel,
}: {
  initialEntry?: string;
  initialExit?: string;
  onSave: (entry: string, exit?: string) => void;
  onCancel: () => void;
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
          <label className="block text-xs text-gray-600 mb-1">
            Дата въезда *
          </label>
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
          <label className="block text-xs text-gray-600 mb-1">
            Дата выезда
          </label>
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
      <p className="text-xs text-gray-500">
        Оставьте дату выезда пустой, если вы ещё в России
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!entryDate}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export function StayCalculator({ onClose }: StayCalculatorProps) {
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

  const {
    regions,
    isLoading: regionsLoading,
    searchRegions,
  } = usePatentRegions();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);

  // Load saved region from localStorage on mount
  useEffect(() => {
    const saved = getSavedRegion();
    if (saved) {
      setSelectedRegion(saved);
    }
  }, []);

  // Save region to localStorage when changed
  const handleRegionChange = useCallback((regionCode: RegionCode) => {
    setSelectedRegion(regionCode);
    saveRegion(regionCode);
  }, []);

  const showPenaltyWarning = calculation.status === 'danger' || calculation.status === 'overstay';

  const handleAddPeriod = useCallback(async (entry: string, exit?: string) => {
    await addPeriod(entry, exit);
    setShowAddForm(false);
  }, [addPeriod]);

  const handleUpdatePeriod = useCallback(async (id: string, entry: string, exit?: string) => {
    await updatePeriod(id, { entryDate: entry, exitDate: exit });
    setEditingPeriodId(null);
  }, [updatePeriod]);

  const handleDeletePeriod = useCallback(async (id: string) => {
    await deletePeriod(id);
  }, [deletePeriod]);

  const getStatusColors = () => {
    switch (calculation.status) {
      case 'overstay':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
        };
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Калькулятор 90 дней</h2>
              <p className="text-sm text-gray-500">Расчёт дней пребывания в {calculation.currentYear} году</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Обновить"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Region selector */}
          <RegionSelector
            value={selectedRegion}
            onChange={handleRegionChange}
            regions={regions}
            isLoading={regionsLoading}
            searchRegions={searchRegions}
            t={t}
          />

          {/* Penalty warning - shown when status is danger or overstay */}
          {showPenaltyWarning && selectedRegion && (
            <PenaltyWarning regionCode={selectedRegion} t={t} />
          )}

          {/* Circular progress card */}
          <div className={`p-6 rounded-xl mb-6 ${colors.bg} border-2 ${colors.border}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <CircularProgress
                  percent={calculation.usagePercent}
                  status={calculation.status}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${colors.text}`}>
                    {calculation.isOverstay ? '+' : ''}{calculation.isOverstay ? calculation.overstayDays : calculation.daysRemaining}
                  </span>
                  <span className={`text-sm ${colors.subtext}`}>
                    {calculation.isOverstay ? 'дн. сверх' : 'дн. осталось'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              {calculation.isOverstay ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className={`w-5 h-5 ${
                  calculation.status === 'safe' ? 'text-green-600' :
                  calculation.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              )}
              <span className={`font-semibold ${colors.text}`}>
                Использовано {calculation.totalDays} из 90 дней в {calculation.currentYear} году
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  calculation.status === 'overstay' || calculation.status === 'danger'
                    ? 'bg-red-500' :
                  calculation.status === 'warning'
                    ? 'bg-yellow-500' :
                    'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, calculation.usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Next reset date - January 1st of next year */}
          {calculation.nextResetDate && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl mb-6">
              <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800">
                <strong>Сброс лимита:</strong> 1 января {calculation.currentYear + 1} года
                <br />
                <span className="text-purple-600">
                  Через {calculation.daysUntilReset} дн. лимит обнулится
                </span>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
            recommendation.type === 'error' ? 'bg-red-50' :
            recommendation.type === 'warning' ? 'bg-yellow-50' :
            recommendation.type === 'success' ? 'bg-green-50' :
            'bg-blue-50'
          }`}>
            {recommendation.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : recommendation.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : recommendation.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className={`text-sm ${
              recommendation.type === 'error' ? 'text-red-800' :
              recommendation.type === 'warning' ? 'text-yellow-800' :
              recommendation.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>
              <strong>{recommendation.title}</strong>
              <br />
              {recommendation.message}
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <strong>Правило 90 дней:</strong> С 05.02.2025 иностранные граждане могут находиться в России
              не более 90 дней в течение календарного года (с 1 января по 31 декабря).
            </div>
          </div>

          {/* Periods header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Периоды пребывания</h3>
            <span className="text-sm text-gray-500">{periods.length} записей</span>
          </div>

          {/* Add period form */}
          {showAddForm ? (
            <div className="mb-4">
              <PeriodForm
                onSave={handleAddPeriod}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              Добавить въезд
            </button>
          )}

          {/* Periods list */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Нет записей о пребывании</p>
              <p className="text-sm">Добавьте даты въезда и выезда</p>
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
                                Сейчас в РФ
                              </span>
                            )}
                          </div>
                          {period.migrationCardId && (
                            <span className="text-xs text-gray-500">
                              Связано с миграционной картой
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPeriodId(period.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Редактировать"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Удалить"
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

          {/* Deportation mode warning - shown only for danger/overstay */}
          <DeportationModeWarning status={calculation.status} />
        </div>
      </div>
    </div>
  );
}
