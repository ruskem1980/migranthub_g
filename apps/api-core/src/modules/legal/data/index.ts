export * from './categories.data';
export * from './laws.data';
export * from './forms.data';
export * from './faq.data';
export * from './patent-regions.data';

// Re-export with aliases for backward compatibility
import { categories, Category } from './categories.data';
import { laws, Law } from './laws.data';
import { forms, Form } from './forms.data';
import { faqItems, FaqItem } from './faq.data';
import { patentRegions, PatentRegion, BASE_NDFL } from './patent-regions.data';

export const LEGAL_CATEGORIES = categories;
export const LEGAL_LAWS = laws;
export const LEGAL_FORMS = forms;
export const LEGAL_FAQ = faqItems;
export const PATENT_REGIONS = patentRegions;

export interface RegionData {
  code: string;
  name: string;
  coefficient: number;
  monthlyPrice: number;
  baseRate: number;
}

export function getRegionByCode(code: string): RegionData | undefined {
  const region = patentRegions.find((r) => r.code === code);
  if (!region) {
    return undefined;
  }
  return {
    code: region.code,
    name: region.name,
    coefficient: region.coefficient,
    monthlyPrice: region.monthlyCost,
    baseRate: BASE_NDFL,
  };
}
