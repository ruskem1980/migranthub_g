// Patent payment amounts by region (2024 data)
export interface RegionPaymentInfo {
  region: string;
  code: string;
  monthlyAmount: number;
  coefficient: number;
}

export const PATENT_REGIONS: RegionPaymentInfo[] = [
  { region: 'Москва', code: '77', monthlyAmount: 7500, coefficient: 2.4272 },
  { region: 'Московская область', code: '50', monthlyAmount: 6600, coefficient: 2.1358 },
  { region: 'Санкт-Петербург', code: '78', monthlyAmount: 4400, coefficient: 1.4239 },
  { region: 'Ленинградская область', code: '47', monthlyAmount: 4100, coefficient: 1.3268 },
  { region: 'Краснодарский край', code: '23', monthlyAmount: 4500, coefficient: 1.4562 },
  { region: 'Свердловская область', code: '66', monthlyAmount: 5700, coefficient: 1.8446 },
  { region: 'Новосибирская область', code: '54', monthlyAmount: 4600, coefficient: 1.4885 },
  { region: 'Республика Татарстан', code: '16', monthlyAmount: 4800, coefficient: 1.5532 },
  { region: 'Нижегородская область', code: '52', monthlyAmount: 4200, coefficient: 1.3592 },
  { region: 'Самарская область', code: '63', monthlyAmount: 4700, coefficient: 1.5209 },
];

export const BASE_PATENT_RATE = 1200; // Base rate in rubles
export const NDFL_COEFFICIENT = 1.257; // Tax coefficient for 2024

export function calculateMonthlyPayment(regionCode: string): number {
  const region = PATENT_REGIONS.find(r => r.code === regionCode);
  return region ? region.monthlyAmount : 4000; // Default fallback
}

export function calculateTotalPayment(regionCode: string, months: number): number {
  const monthlyAmount = calculateMonthlyPayment(regionCode);
  return monthlyAmount * months;
}

export function getRegionByCode(code: string): RegionPaymentInfo | undefined {
  return PATENT_REGIONS.find(r => r.code === code);
}

// Generate SBP (Fast Payment System) payment link
export function generateSBPLink(amount: number, purpose: string, merchantId?: string): string {
  // This is a simplified example - in production, you would use actual SBP API
  const encodedPurpose = encodeURIComponent(purpose);
  return `https://qr.nspk.ru/pay?amount=${amount}&purpose=${encodedPurpose}`;
}

// Generate YooKassa payment URL
export function generateYooKassaUrl(options: {
  amount: number;
  description: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}): string {
  // In production, this would be a server-side call to YooKassa API
  // For demo, we return a placeholder
  const params = new URLSearchParams({
    amount: options.amount.toString(),
    description: options.description,
    return_url: options.returnUrl,
  });
  return `https://yookassa.ru/checkout?${params.toString()}`;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  region: string;
  months: number;
  paymentMethod: 'sbp' | 'yookassa' | 'card';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}
