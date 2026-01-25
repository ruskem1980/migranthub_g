'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { db, type DBStayPeriod } from '@/lib/db';
import { getOrCreateDeviceId } from '@/lib/api/device';
import type { StayPeriod } from '../calculator/types';
import { calculateStay, getRecommendation } from '../calculator/stay-calculator';

/**
 * Конвертация DBStayPeriod в StayPeriod
 */
function dbToStayPeriod(dbPeriod: DBStayPeriod): StayPeriod {
  return {
    id: dbPeriod.id,
    entryDate: dbPeriod.entryDate,
    exitDate: dbPeriod.exitDate,
    migrationCardId: dbPeriod.migrationCardId,
  };
}

/**
 * Хук для работы с периодами пребывания
 */
export function useStayPeriods() {
  const [periods, setPeriods] = useState<StayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загрузка периодов
   */
  const loadPeriods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = await getOrCreateDeviceId();
      const dbPeriods = await db.stayPeriods
        .where('oderId')
        .equals(userId)
        .toArray();

      // Сортируем по дате въезда (новые сверху)
      const sortedPeriods = dbPeriods
        .map(dbToStayPeriod)
        .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

      setPeriods(sortedPeriods);
    } catch (e) {
      console.error('Failed to load stay periods:', e);
      setError('Не удалось загрузить периоды пребывания');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Добавить период
   */
  const addPeriod = useCallback(async (
    entryDate: string,
    exitDate?: string,
    migrationCardId?: string
  ): Promise<StayPeriod | null> => {
    try {
      const userId = await getOrCreateDeviceId();
      const now = new Date().toISOString();
      const id = crypto.randomUUID();

      const dbPeriod: DBStayPeriod = {
        id,
        oderId: userId,
        entryDate,
        exitDate,
        migrationCardId,
        createdAt: now,
        updatedAt: now,
      };

      await db.stayPeriods.put(dbPeriod);

      const newPeriod = dbToStayPeriod(dbPeriod);
      setPeriods(prev => [newPeriod, ...prev].sort(
        (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      ));

      return newPeriod;
    } catch (e) {
      console.error('Failed to add stay period:', e);
      setError('Не удалось добавить период');
      return null;
    }
  }, []);

  /**
   * Обновить период
   */
  const updatePeriod = useCallback(async (
    id: string,
    updates: Partial<Pick<StayPeriod, 'entryDate' | 'exitDate'>>
  ): Promise<boolean> => {
    try {
      const existing = await db.stayPeriods.get(id);
      if (!existing) {
        setError('Период не найден');
        return false;
      }

      const updatedPeriod: DBStayPeriod = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await db.stayPeriods.put(updatedPeriod);

      setPeriods(prev => prev.map(p =>
        p.id === id ? dbToStayPeriod(updatedPeriod) : p
      ).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()));

      return true;
    } catch (e) {
      console.error('Failed to update stay period:', e);
      setError('Не удалось обновить период');
      return false;
    }
  }, []);

  /**
   * Удалить период
   */
  const deletePeriod = useCallback(async (id: string): Promise<boolean> => {
    try {
      await db.stayPeriods.delete(id);
      setPeriods(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (e) {
      console.error('Failed to delete stay period:', e);
      setError('Не удалось удалить период');
      return false;
    }
  }, []);

  /**
   * Синхронизация с миграционной картой
   * Проверяет, есть ли период с этой миграционной картой, если нет — создаёт
   */
  const syncWithMigrationCard = useCallback(async (
    migrationCardId: string,
    entryDate: string
  ): Promise<void> => {
    try {
      const userId = await getOrCreateDeviceId();

      // Проверяем, есть ли уже период с этой миграционной картой
      const existing = await db.stayPeriods
        .where('migrationCardId')
        .equals(migrationCardId)
        .first();

      if (existing) {
        // Обновляем дату въезда, если изменилась
        if (existing.entryDate !== entryDate) {
          await updatePeriod(existing.id, { entryDate });
        }
      } else {
        // Создаём новый период
        await addPeriod(entryDate, undefined, migrationCardId);
      }
    } catch (e) {
      console.error('Failed to sync with migration card:', e);
    }
  }, [addPeriod, updatePeriod]);

  /**
   * Расчёт пребывания
   */
  const calculation = useMemo(() => calculateStay(periods), [periods]);

  /**
   * Рекомендации
   */
  const recommendation = useMemo(() => getRecommendation(calculation), [calculation]);

  // Загружаем периоды при монтировании
  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  return {
    periods,
    isLoading,
    error,
    calculation,
    recommendation,
    addPeriod,
    updatePeriod,
    deletePeriod,
    syncWithMigrationCard,
    refresh: loadPeriods,
  };
}

export type UseStayPeriodsReturn = ReturnType<typeof useStayPeriods>;
