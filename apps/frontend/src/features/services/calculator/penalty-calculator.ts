/**
 * Penalty calculator for migration law violations in Russia.
 * Fines differ by region:
 * - Moscow, Moscow Oblast, St. Petersburg, Leningrad Oblast: 5000-7000₽ + possible deportation
 * - Other regions: 2000-5000₽, deportation unlikely for first offense
 */

// Region code (e.g. '77' for Moscow, '78' for St. Petersburg)
export type RegionCode = string;

// Legacy type for backwards compatibility
export type RegionType = 'moscow' | 'spb' | 'other';

// Regions with higher penalties (Moscow, Moscow Oblast, St. Petersburg, Leningrad Oblast)
const HIGH_PENALTY_REGIONS = ['77', '50', '78', '47'];

export interface PenaltyInfo {
  minFine: number;
  maxFine: number;
  canBeDeported: boolean;
  description: string;
}

/**
 * Check if a region code belongs to high-penalty regions
 * (Moscow, Moscow Oblast, St. Petersburg, Leningrad Oblast)
 */
export function isHighPenaltyRegion(regionCode: RegionCode): boolean {
  return HIGH_PENALTY_REGIONS.includes(regionCode);
}

/**
 * Get penalty information based on region code.
 * According to Russian migration law, penalties in Moscow, Moscow Oblast,
 * St. Petersburg, and Leningrad Oblast are higher than in other regions.
 */
export function getPenaltyInfo(regionCode: RegionCode): PenaltyInfo {
  if (isHighPenaltyRegion(regionCode)) {
    return {
      minFine: 5000,
      maxFine: 7000,
      canBeDeported: true,
      description: 'penalty.deportation',
    };
  }

  return {
    minFine: 2000,
    maxFine: 5000,
    canBeDeported: false,
    description: 'penalty.noDeportation',
  };
}

/**
 * Storage key for persisting selected region
 */
export const REGION_STORAGE_KEY = 'selectedRegion';

/**
 * Get saved region code from localStorage
 */
export function getSavedRegion(): RegionCode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const saved = localStorage.getItem(REGION_STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
}

/**
 * Save region code to localStorage
 */
export function saveRegion(regionCode: RegionCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REGION_STORAGE_KEY, regionCode);
  }
}
