'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SubscriptionPlan } from '@/config/subscription-plans';

export type BillingPeriod = 'monthly' | 'yearly';

export interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: () => void;
  billingPeriod: BillingPeriod;
}

/**
 * PlanCard - Displays a subscription plan with features and pricing
 * Shows monthly or yearly price based on billing period
 */
export function PlanCard({
  plan,
  isCurrentPlan = false,
  onSelect,
  billingPeriod,
}: PlanCardProps) {
  // Calculate displayed price based on billing period
  const displayPrice =
    billingPeriod === 'yearly' && plan.yearlyPrice > 0
      ? Math.round(plan.yearlyPrice / 12)
      : plan.price;

  return (
    <div
      className={[
        'p-4 rounded-xl border-2 transition-all duration-200',
        plan.highlighted
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card',
        isCurrentPlan ? 'opacity-75' : '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-card-foreground">{plan.name}</h3>
          {plan.highlighted && (
            <span className="inline-block text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
              Популярный
            </span>
          )}
        </div>
        <div className="text-right">
          {plan.price === 0 ? (
            <span className="text-2xl font-bold text-card-foreground">
              Бесплатно
            </span>
          ) : (
            <>
              <span className="text-2xl font-bold text-card-foreground">
                {displayPrice}
              </span>
              <span className="text-sm text-muted-foreground">₽/мес</span>
            </>
          )}
        </div>
      </div>

      {/* Features list */}
      <ul className="space-y-2.5 mb-5">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5 text-sm">
            <Check
              className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-card-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action button */}
      <Button
        variant={plan.highlighted ? 'primary' : 'outline'}
        fullWidth
        onClick={onSelect}
        disabled={isCurrentPlan}
        aria-label={
          isCurrentPlan
            ? `${plan.name} - текущий план`
            : `Выбрать план ${plan.name}`
        }
      >
        {isCurrentPlan ? 'Текущий план' : 'Выбрать'}
      </Button>
    </div>
  );
}

export default PlanCard;
