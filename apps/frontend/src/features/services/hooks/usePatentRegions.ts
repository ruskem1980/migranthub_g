'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPatentRegions,
  savePatentRegions,
  isPatentCacheValid,
  type PatentRegionData,
} from '@/lib/db';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fallback data for 2026 (used when API unavailable and no cache)
const BASE_NDFL = 1200;
const DEFLATOR_2026 = 2.842;

const FALLBACK_REGIONS: PatentRegionData[] = [
  { code: '77', name: 'Москва', coefficient: 2.932, monthlyCost: 10000 },
  { code: '50', name: 'Московская область', coefficient: 2.932, monthlyCost: 10000 },
  { code: '78', name: 'Санкт-Петербург', coefficient: 2.346, monthlyCost: 8000 },
  { code: '47', name: 'Ленинградская область', coefficient: 2.346, monthlyCost: 8000 },
  { code: '23', name: 'Краснодарский край', coefficient: 7.919, monthlyCost: 27000 },
  { code: '16', name: 'Республика Татарстан', coefficient: 2.328, monthlyCost: 7937 },
  { code: '61', name: 'Ростовская область', coefficient: 3.000, monthlyCost: 10230 },
  { code: '54', name: 'Новосибирская область', coefficient: 3.185, monthlyCost: 10860 },
  { code: '66', name: 'Свердловская область', coefficient: 2.786, monthlyCost: 9500 },
  { code: '63', name: 'Самарская область', coefficient: 3.271, monthlyCost: 11157 },
  { code: '52', name: 'Нижегородская область', coefficient: 3.461, monthlyCost: 11800 },
  { code: '74', name: 'Челябинская область', coefficient: 4.938, monthlyCost: 16840 },
  { code: '02', name: 'Республика Башкортостан', coefficient: 2.493, monthlyCost: 8500 },
  { code: '59', name: 'Пермский край', coefficient: 2.386, monthlyCost: 8137 },
  { code: '38', name: 'Иркутская область', coefficient: 3.519, monthlyCost: 12000 },
];

interface UsePatentRegionsResult {
  regions: PatentRegionData[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  refresh: () => Promise<void>;
  calculateCost: (regionCode: string, months: number) => PatentCalculateResult | null;
}

export interface PatentCalculateResult {
  regionCode: string;
  regionName: string;
  baseRate: number;
  coefficient: number;
  months: number;
  totalPrice: number;
  breakdown: Array<{ month: number; price: number }>;
}

export function usePatentRegions(): UsePatentRegionsResult {
  const [regions, setRegions] = useState<PatentRegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const loadFromCache = useCallback(async (): Promise<PatentRegionData[] | null> => {
    try {
      const cachedRegions = await getPatentRegions();
      if (cachedRegions.length > 0) {
        return cachedRegions;
      }
    } catch (e) {
      console.error('Failed to load from cache:', e);
    }
    return null;
  }, []);

  const fetchFromApi = useCallback(async (): Promise<PatentRegionData[] | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/legal/calculators/patent/regions`);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const data: PatentRegionData[] = await response.json();
      // Save to cache
      await savePatentRegions(data);
      return data;
    } catch (e) {
      console.error('Failed to fetch from API:', e);
      return null;
    }
  }, []);

  const loadRegions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check if cache is valid
    const cacheValid = await isPatentCacheValid();

    if (cacheValid) {
      // Try to load from cache first
      const cached = await loadFromCache();
      if (cached) {
        setRegions(cached);
        setIsFromCache(true);
        setIsLoading(false);

        // Fetch from API in background to update cache
        fetchFromApi().then((fresh) => {
          if (fresh) {
            setRegions(fresh);
            setIsFromCache(false);
          }
        });
        return;
      }
    }

    // Try to fetch from API
    const apiData = await fetchFromApi();
    if (apiData) {
      setRegions(apiData);
      setIsFromCache(false);
      setIsLoading(false);
      return;
    }

    // Try cache (even if expired)
    const cached = await loadFromCache();
    if (cached) {
      setRegions(cached);
      setIsFromCache(true);
      setIsLoading(false);
      return;
    }

    // Use fallback data
    setRegions(FALLBACK_REGIONS);
    setIsFromCache(false);
    setIsLoading(false);
  }, [loadFromCache, fetchFromApi]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const apiData = await fetchFromApi();
    if (apiData) {
      setRegions(apiData);
      setIsFromCache(false);
    }
    setIsLoading(false);
  }, [fetchFromApi]);

  const calculateCost = useCallback(
    (regionCode: string, months: number): PatentCalculateResult | null => {
      const region = regions.find((r) => r.code === regionCode);
      if (!region) return null;

      const monthlyPrice = region.monthlyCost;
      const totalPrice = monthlyPrice * months;
      const breakdown = Array.from({ length: months }, (_, i) => ({
        month: i + 1,
        price: monthlyPrice,
      }));

      return {
        regionCode: region.code,
        regionName: region.name,
        baseRate: BASE_NDFL,
        coefficient: region.coefficient,
        months,
        totalPrice,
        breakdown,
      };
    },
    [regions]
  );

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  return {
    regions,
    isLoading,
    error,
    isFromCache,
    refresh,
    calculateCost,
  };
}
