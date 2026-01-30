/**
 * Subscription plans configuration
 * Defines all subscription tiers, pricing, and features
 */

import type { SubscriptionTier } from '@/types';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number; // in rubles per month
  yearlyPrice: number; // in rubles per year
  features: string[];
  highlighted?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Калькуляторы',
      'Базовые проверки',
      '3 документа',
      'SOS экран',
      '3 AI вопроса в день',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 199,
    yearlyPrice: 1990,
    features: [
      'Все из Free',
      'Безлимитные документы',
      'Напоминания о дедлайнах',
      'Проверка ФССП',
      '10 AI вопросов в день',
      'Приоритетная поддержка',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    yearlyPrice: 4990,
    features: [
      'Все из Plus',
      'Безлимитные AI вопросы',
      'Облачное хранилище',
      'Семейный аккаунт (до 3)',
      'Юридическая консультация',
    ],
  },
];

/**
 * Limits for Free plan
 * Used to track and enforce usage quotas
 */
export const FREE_LIMITS = {
  documents: 3,
  aiQuestionsPerDay: 3,
  examQuestionsPerSession: 10,
} as const;

/**
 * Get plan by ID
 */
export function getPlanById(id: SubscriptionTier): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.id === id);
}

/**
 * Calculate savings percentage for yearly billing
 */
export function getYearlySavingsPercent(plan: SubscriptionPlan): number {
  if (plan.price === 0) return 0;
  const monthlyTotal = plan.price * 12;
  const savings = monthlyTotal - plan.yearlyPrice;
  return Math.round((savings / monthlyTotal) * 100);
}
