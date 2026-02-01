'use client';

import { useState, useMemo } from 'react';
import { X, Calculator, Loader2, Plus, Minus, Search, RefreshCw, MapPin, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePatentRegions, type PatentCalculateResult } from '@/features/services/hooks/usePatentRegions';
import type { PatentRegionData } from '@/lib/db';

interface PatentCalculatorModalProps {
  onClose: () => void;
}

export function PatentCalculatorModal({ onClose }: PatentCalculatorModalProps) {
  const { t } = useTranslation();
  const { regions, isLoading, isFromCache, refresh, calculateCost, searchRegions } = usePatentRegions();

  const [selectedRegion, setSelectedRegion] = useState<PatentRegionData | null>(null);
  const [months, setMonths] = useState(1);
  const [result, setResult] = useState<PatentCalculateResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search results - show all regions or filtered
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return regions;
    return searchRegions(searchQuery);
  }, [searchQuery, regions, searchRegions]);

  // Get matching city for display
  const getMatchingCity = (region: PatentRegionData, query: string): string | null => {
    if (!query.trim()) return null;
    const searchLower = query.toLowerCase().trim();
    const matchingCity = region.cities.find(city =>
      city.toLowerCase().includes(searchLower)
    );
    return matchingCity || null;
  };

  function formatPriceShort(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  function handleCalculate() {
    if (!selectedRegion) return;
    const calcResult = calculateCost(selectedRegion.code, months);
    setResult(calcResult);
  }

  function decreaseMonths() {
    if (months > 1) {
      setMonths(months - 1);
      setResult(null);
    }
  }

  function increaseMonths() {
    if (months < 12) {
      setMonths(months + 1);
      setResult(null);
    }
  }

  function handleSelectRegion(region: PatentRegionData) {
    setSelectedRegion(region);
    setShowDropdown(false);
    setSearchQuery('');
    setResult(null);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('services.patentCalculator.title')}
              </h2>
              <p className="text-xs text-green-100">
                {t('services.patentCalculator.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {isLoading && regions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          )}

          {!isLoading || regions.length > 0 ? (
            <div className="space-y-6">
              {/* Cache indicator */}
              {isFromCache && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
                  <span className="text-yellow-800">
                    {t('services.patentCalculator.usingCachedData')}
                  </span>
                  <button
                    onClick={refresh}
                    className="flex items-center gap-1 text-yellow-700 hover:text-yellow-900"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('common.refresh')}
                  </button>
                </div>
              )}

              {/* Region Selector - Dropdown style like StayCalculator */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  {t('services.patentCalculator.searchCityOrRegion')}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl transition-colors ${
                      selectedRegion ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span className={selectedRegion ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      {isLoading ? t('common.loading') : selectedRegion ? selectedRegion.name : t('services.patentCalculator.typeToSearch')}
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
                            placeholder={t('services.patentCalculator.typeToSearch')}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto">
                        {searchResults.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            {t('common.noResults')}
                          </div>
                        ) : (
                          searchResults.map((region) => {
                            const matchingCity = getMatchingCity(region, searchQuery);
                            return (
                              <button
                                key={region.code}
                                type="button"
                                onClick={() => handleSelectRegion(region)}
                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                  selectedRegion?.code === region.code ? 'bg-green-50' : ''
                                }`}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="text-gray-900 font-medium">{region.name}</span>
                                  {matchingCity && matchingCity.toLowerCase() !== region.name.toLowerCase() && (
                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                                      <MapPin className="w-3 h-3" />
                                      <span>г. {matchingCity}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-green-600 font-semibold whitespace-nowrap ml-3">
                                  {formatPriceShort(region.monthlyCost)}/мес
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
                        {searchQuery
                          ? `${t('services.patentCalculator.found')}: ${searchResults.length}`
                          : `${t('services.patentCalculator.totalRegions')}: ${regions.length}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected region card */}
                {selectedRegion && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedRegion.name}
                          </p>
                          <p className="text-lg font-bold text-green-700 mt-1">
                            {formatPrice(selectedRegion.monthlyCost)}/мес
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRegion(null);
                          setResult(null);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('common.clear')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Months Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('services.patentCalculator.numberOfMonths')}
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={decreaseMonths}
                    disabled={months <= 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      months <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-green-100 text-green-600 hover:bg-green-200 active:scale-95'
                    }`}
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <div className="w-24 text-center">
                    <span className="text-4xl font-bold text-gray-900">{months}</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {months === 1 ? t('common.month') : t('common.months')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={increaseMonths}
                    disabled={months >= 12}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      months >= 12
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-green-100 text-green-600 hover:bg-green-200 active:scale-95'
                    }`}
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex justify-center gap-1 mt-3">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < months ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="button"
                onClick={handleCalculate}
                disabled={!selectedRegion}
                className={`w-full font-bold py-4 rounded-xl transition-all ${
                  !selectedRegion
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-98'
                }`}
              >
                {t('services.patentCalculator.calculate')}
              </button>

              {/* Result */}
              {result && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-in slide-in-from-bottom-4 duration-300">
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-1">{t('services.patentCalculator.totalAmount')}</p>
                    <p className="text-4xl font-bold text-green-700">
                      {formatPrice(result.totalPrice)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.region')}</span>
                      <span className="font-semibold text-gray-900">
                        {result.regionName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.baseRate')}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(result.baseRate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.coefficient')}</span>
                      <span className="font-semibold text-gray-900">{result.coefficient.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.monthlyPayment')}</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(result.breakdown[0]?.price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.period')}</span>
                      <span className="font-semibold text-gray-900">
                        {result.months} {result.months === 1 ? t('common.month') : t('common.months')}
                      </span>
                    </div>

                    <div className="border-t border-green-300 my-3" />

                    <div className="text-xs text-gray-500 text-center">
                      {formatPrice(result.breakdown[0]?.price || 0)} x {result.months} = {formatPrice(result.totalPrice)}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/70 rounded-xl border border-green-200">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t('services.patentCalculator.infoNote')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
