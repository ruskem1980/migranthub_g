'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Loader2, AlertCircle, ChevronDown, Plus, Minus, Search } from 'lucide-react';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { useTranslation } from '@/lib/i18n';

interface PatentRegion {
  code: string;
  name: string;
  monthlyCost: number;
  coefficient: number;
}

interface PatentCalculateResponse {
  regionCode: string;
  regionName: string;
  baseRate: number;
  coefficient: number;
  months: number;
  totalPrice: number;
  breakdown: Array<{ month: number; price: number }>;
}

interface PatentCalculatorModalProps {
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Local fallback data for offline mode (2024 rates)
const BASE_NDFL = 1200;
const LOCAL_PATENT_REGIONS: PatentRegion[] = [
  { code: '77', name: 'Москва', coefficient: 2.2591, monthlyCost: 6502 },
  { code: '50', name: 'Московская область', coefficient: 2.1831, monthlyCost: 6287 },
  { code: '78', name: 'Санкт-Петербург', coefficient: 1.8315, monthlyCost: 5275 },
  { code: '47', name: 'Ленинградская область', coefficient: 1.8315, monthlyCost: 5275 },
  { code: '23', name: 'Краснодарский край', coefficient: 1.8581, monthlyCost: 5351 },
  { code: '61', name: 'Ростовская область', coefficient: 1.678, monthlyCost: 4832 },
  { code: '16', name: 'Республика Татарстан', coefficient: 1.8321, monthlyCost: 5277 },
  { code: '54', name: 'Новосибирская область', coefficient: 1.815, monthlyCost: 5228 },
  { code: '66', name: 'Свердловская область', coefficient: 1.8791, monthlyCost: 5412 },
  { code: '63', name: 'Самарская область', coefficient: 1.7098, monthlyCost: 4924 },
  { code: '52', name: 'Нижегородская область', coefficient: 1.82, monthlyCost: 5242 },
  { code: '74', name: 'Челябинская область', coefficient: 1.7653, monthlyCost: 5084 },
  { code: '02', name: 'Республика Башкортостан', coefficient: 1.725, monthlyCost: 4968 },
  { code: '59', name: 'Пермский край', coefficient: 1.71, monthlyCost: 4925 },
  { code: '38', name: 'Иркутская область', coefficient: 1.9527, monthlyCost: 5624 },
];

export function PatentCalculatorModal({ onClose }: PatentCalculatorModalProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation();

  const [regions, setRegions] = useState<PatentRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<PatentRegion | null>(null);
  const [months, setMonths] = useState(1);
  const [result, setResult] = useState<PatentCalculateResponse | null>(null);

  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchRegions() {
      setIsLoadingRegions(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/legal/calculators/patent/regions`);

        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }

        const data: PatentRegion[] = await response.json();
        setRegions(data);

        const moscow = data.find(r => r.code === '77');
        if (moscow) {
          setSelectedRegion(moscow);
        }
      } catch (err) {
        console.error('Error fetching regions, using local data:', err);
        // Use local fallback data when API is unavailable
        setRegions(LOCAL_PATENT_REGIONS);
        const moscow = LOCAL_PATENT_REGIONS.find(r => r.code === '77');
        if (moscow) {
          setSelectedRegion(moscow);
        }
      } finally {
        setIsLoadingRegions(false);
      }
    }

    fetchRegions();
  }, [language]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return regions;

    const query = searchQuery.toLowerCase();
    return regions.filter(region =>
      region.name.toLowerCase().includes(query) ||
      region.code.includes(query)
    );
  }, [regions, searchQuery]);

  function calculateLocally(region: PatentRegion, numMonths: number): PatentCalculateResponse {
    const monthlyPrice = region.monthlyCost;
    const totalPrice = monthlyPrice * numMonths;
    const breakdown = Array.from({ length: numMonths }, (_, i) => ({
      month: i + 1,
      price: monthlyPrice,
    }));

    return {
      regionCode: region.code,
      regionName: region.name,
      baseRate: BASE_NDFL,
      coefficient: region.coefficient,
      months: numMonths,
      totalPrice,
      breakdown,
    };
  }

  async function handleCalculate() {
    if (!selectedRegion) return;

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/legal/calculators/patent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionCode: selectedRegion.code,
          months: months,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate');
      }

      const data: PatentCalculateResponse = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error calculating via API, using local calculation:', err);
      // Calculate locally when API is unavailable
      const localResult = calculateLocally(selectedRegion, months);
      setResult(localResult);
    } finally {
      setIsCalculating(false);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  function selectRegion(region: PatentRegion) {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
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
          {isLoadingRegions && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          )}

          {error && !isLoadingRegions && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 text-center mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {!isLoadingRegions && !error && (
            <div className="space-y-6">
              {/* Region Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('services.patentCalculator.selectRegion')}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <span className={selectedRegion ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedRegion ? selectedRegion.name : t('services.patentCalculator.chooseRegion')}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRegionDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('common.search')}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {filteredRegions.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            {t('common.noResults')}
                          </div>
                        ) : (
                          filteredRegions.map((region) => (
                            <button
                              key={region.code}
                              type="button"
                              onClick={() => selectRegion(region)}
                              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors ${
                                selectedRegion?.code === region.code ? 'bg-green-50' : ''
                              }`}
                            >
                              <span className="text-gray-900">{region.name}</span>
                              <span className="text-sm text-gray-500 font-mono">
                                {formatPrice(region.monthlyCost)}/{t('common.monthShort')}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedRegion && (
                  <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      {t('services.patentCalculator.monthlyRate')}: <strong>{formatPrice(selectedRegion.monthlyCost)}</strong>
                    </p>
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
                disabled={!selectedRegion || isCalculating}
                className={`w-full font-bold py-4 rounded-xl transition-all ${
                  !selectedRegion || isCalculating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-98'
                }`}
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('services.patentCalculator.calculating')}
                  </span>
                ) : (
                  t('services.patentCalculator.calculate')
                )}
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
                      <span className="font-semibold text-gray-900">{result.regionName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.baseRate')}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(result.baseRate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('services.patentCalculator.coefficient')}</span>
                      <span className="font-semibold text-gray-900">{result.coefficient.toFixed(4)}</span>
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
          )}
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
