/**
 * Penalty calculator for migration law violations in Russia.
 * Fines differ by region:
 * - Moscow, Moscow Oblast, St. Petersburg, Leningrad Oblast: 5000-7000₽ + possible deportation
 * - Other regions: 2000-5000₽, deportation unlikely for first offense
 */

export type RegionType = 'moscow' | 'spb' | 'other';

export interface PenaltyInfo {
  minFine: number;
  maxFine: number;
  canBeDeported: boolean;
  description: string;
}

/**
 * Get penalty information based on region.
 * According to Russian migration law, penalties in Moscow, Moscow Oblast,
 * St. Petersburg, and Leningrad Oblast are higher than in other regions.
 */
export function getPenaltyInfo(region: RegionType): PenaltyInfo {
  switch (region) {
    case 'moscow':
    case 'spb':
      return {
        minFine: 5000,
        maxFine: 7000,
        canBeDeported: true,
        description: 'penalty.deportation',
      };
    case 'other':
    default:
      return {
        minFine: 2000,
        maxFine: 5000,
        canBeDeported: false,
        description: 'penalty.noDeportation',
      };
  }
}

/**
 * Storage key for persisting selected region
 */
export const REGION_STORAGE_KEY = 'selectedRegion';

/**
 * Get saved region from localStorage
 */
export function getSavedRegion(): RegionType | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const saved = localStorage.getItem(REGION_STORAGE_KEY);
  if (saved === 'moscow' || saved === 'spb' || saved === 'other') {
    return saved;
  }
  return null;
}

/**
 * Save region to localStorage
 */
export function saveRegion(region: RegionType): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REGION_STORAGE_KEY, region);
  }
}
