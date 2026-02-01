'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPatentRegions,
  savePatentRegions,
  isPatentCacheValid,
  invalidateCacheForKey,
  type PatentRegionData,
} from '@/lib/db';
import { onLegalDataUpdated } from '@/lib/events/legalDataEvents';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Base rates for calculation display
const BASE_NDFL = 1200;

// Fallback data for 2026 (top 20 regions with major cities)
const FALLBACK_REGIONS: PatentRegionData[] = [
  { code: '77', name: 'Москва', coefficient: 2.932, monthlyCost: 10000, cities: ['Москва', 'Зеленоград', 'Троицк'] },
  { code: '78', name: 'Санкт-Петербург', coefficient: 2.346, monthlyCost: 8000, cities: ['Санкт-Петербург', 'Петербург', 'Питер', 'СПб', 'Колпино', 'Пушкин'] },
  { code: '50', name: 'Московская область', coefficient: 2.932, monthlyCost: 10000, cities: ['Балашиха', 'Химки', 'Подольск', 'Мытищи', 'Королёв', 'Люберцы', 'Электросталь', 'Коломна', 'Красногорск', 'Одинцово', 'Серпухов', 'Щёлково', 'Домодедово', 'Раменское', 'Жуковский'] },
  { code: '47', name: 'Ленинградская область', coefficient: 2.346, monthlyCost: 8000, cities: ['Гатчина', 'Выборг', 'Сосновый Бор', 'Всеволожск', 'Тихвин', 'Кириши', 'Сертолово', 'Кингисепп'] },
  { code: '23', name: 'Краснодарский край', coefficient: 7.919, monthlyCost: 27000, cities: ['Краснодар', 'Сочи', 'Новороссийск', 'Армавир', 'Ейск', 'Анапа', 'Туапсе', 'Геленджик'] },
  { code: '16', name: 'Республика Татарстан', coefficient: 2.328, monthlyCost: 7937, cities: ['Казань', 'Набережные Челны', 'Нижнекамск', 'Альметьевск', 'Зеленодольск', 'Бугульма', 'Елабуга'] },
  { code: '61', name: 'Ростовская область', coefficient: 3.000, monthlyCost: 10230, cities: ['Ростов-на-Дону', 'Таганрог', 'Шахты', 'Волгодонск', 'Новочеркасск', 'Батайск'] },
  { code: '54', name: 'Новосибирская область', coefficient: 3.185, monthlyCost: 10860, cities: ['Новосибирск', 'Бердск', 'Искитим', 'Куйбышев', 'Барабинск', 'Обь'] },
  { code: '66', name: 'Свердловская область', coefficient: 2.786, monthlyCost: 9500, cities: ['Екатеринбург', 'Нижний Тагил', 'Каменск-Уральский', 'Первоуральск', 'Серов', 'Асбест'] },
  { code: '63', name: 'Самарская область', coefficient: 3.271, monthlyCost: 11157, cities: ['Самара', 'Тольятти', 'Сызрань', 'Новокуйбышевск', 'Чапаевск', 'Жигулёвск'] },
  { code: '52', name: 'Нижегородская область', coefficient: 3.461, monthlyCost: 11800, cities: ['Нижний Новгород', 'Дзержинск', 'Арзамас', 'Саров', 'Бор', 'Кстово', 'Павлово', 'Выкса'] },
  { code: '74', name: 'Челябинская область', coefficient: 4.938, monthlyCost: 16840, cities: ['Челябинск', 'Магнитогорск', 'Златоуст', 'Миасс', 'Копейск', 'Озёрск', 'Троицк'] },
  { code: '02', name: 'Республика Башкортостан', coefficient: 2.493, monthlyCost: 8500, cities: ['Уфа', 'Стерлитамак', 'Салават', 'Нефтекамск', 'Октябрьский', 'Белорецк', 'Туймазы'] },
  { code: '59', name: 'Пермский край', coefficient: 2.386, monthlyCost: 8137, cities: ['Пермь', 'Березники', 'Соликамск', 'Чайковский', 'Лысьва', 'Кунгур', 'Краснокамск'] },
  { code: '38', name: 'Иркутская область', coefficient: 3.519, monthlyCost: 12000, cities: ['Иркутск', 'Братск', 'Ангарск', 'Усть-Илимск', 'Усолье-Сибирское', 'Черемхово'] },
  { code: '91', name: 'Республика Крым', coefficient: 3.501, monthlyCost: 11940, cities: ['Симферополь', 'Керчь', 'Евпатория', 'Ялта', 'Феодосия', 'Джанкой', 'Алушта'] },
  { code: '92', name: 'Севастополь', coefficient: 3.619, monthlyCost: 12340, cities: ['Севастополь', 'Балаклава', 'Инкерман'] },
  { code: '20', name: 'Чеченская Республика', coefficient: 1.000, monthlyCost: 3410, cities: ['Грозный', 'Урус-Мартан', 'Шали', 'Гудермес', 'Аргун'] },
  { code: '08', name: 'Республика Калмыкия', coefficient: 1.100, monthlyCost: 3750, cities: ['Элиста', 'Лагань', 'Городовиковск'] },
  { code: '71', name: 'Тульская область', coefficient: 7.332, monthlyCost: 25000, cities: ['Тула', 'Новомосковск', 'Донской', 'Алексин', 'Щёкино', 'Узловая', 'Ефремов'] },
];

interface UsePatentRegionsResult {
  regions: PatentRegionData[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  calculateCost: (regionCode: string, months: number) => PatentCalculateResult | null;
  searchRegions: (query: string) => PatentRegionData[];
  findRegionByCity: (cityName: string) => PatentRegionData | undefined;
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFromCache = useCallback(async (): Promise<PatentRegionData[] | null> => {
    try {
      // Check if IndexedDB is available
      if (typeof window === 'undefined' || !window.indexedDB) {
        return null;
      }
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
      const json = await response.json();
      // API returns { data: [...], meta: {...} }
      const data: PatentRegionData[] = json.data || json;
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

    // Check if cache is valid (with fallback for SSR/no IndexedDB)
    let cacheValid = false;
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        cacheValid = await isPatentCacheValid();
      }
    } catch (e) {
      console.error('Failed to check cache validity:', e);
    }

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
    setIsRefreshing(true);
    const apiData = await fetchFromApi();
    if (apiData) {
      setRegions(apiData);
      setIsFromCache(false);
    }
    setIsRefreshing(false);
  }, [fetchFromApi]);

  /**
   * Force refresh triggered by legal data update event
   * Invalidates cache first, then fetches fresh data
   */
  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate cache for patent-regions
      await invalidateCacheForKey('patent-regions');
      // Fetch fresh data from API
      const apiData = await fetchFromApi();
      if (apiData) {
        setRegions(apiData);
        setIsFromCache(false);
      }
    } catch (e) {
      console.error('Failed to force refresh patent regions:', e);
    } finally {
      setIsRefreshing(false);
    }
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

  const searchRegionsFunc = useCallback(
    (query: string): PatentRegionData[] => {
      if (!query.trim()) return regions;

      const searchQuery = query.toLowerCase().trim();

      return regions.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery) ||
          r.code.includes(searchQuery) ||
          r.cities.some((city) => city.toLowerCase().includes(searchQuery))
      );
    },
    [regions]
  );

  const findRegionByCity = useCallback(
    (cityName: string): PatentRegionData | undefined => {
      const searchName = cityName.toLowerCase().trim();
      return regions.find((r) =>
        r.cities.some((city) => city.toLowerCase() === searchName)
      );
    },
    [regions]
  );

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  // Subscribe to legal data update events
  useEffect(() => {
    const unsubscribe = onLegalDataUpdated(() => {
      // When legal data is updated on the server, force refresh patent regions
      forceRefresh();
    });

    return unsubscribe;
  }, [forceRefresh]);

  return {
    regions,
    isLoading,
    error,
    isFromCache,
    isRefreshing,
    refresh,
    calculateCost,
    searchRegions: searchRegionsFunc,
    findRegionByCity,
  };
}
