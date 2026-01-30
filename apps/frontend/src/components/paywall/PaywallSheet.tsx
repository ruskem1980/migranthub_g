'use client';

import { useState, useCallback } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { PlanCard, type BillingPeriod } from './PlanCard';
import { subscriptionPlans, getYearlySavingsPercent } from '@/config/subscription-plans';
import { useAuthStore } from '@/lib/stores/authStore';
import type { SubscriptionTier } from '@/types';

export interface PaywallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which feature triggered the paywall (for analytics) */
  feature?: string;
  /** Custom title for the paywall */
  title?: string;
  /** Custom description explaining why upgrade is needed */
  description?: string;
  /** Callback when a plan is selected */
  onSelectPlan?: (planId: SubscriptionTier) => void;
}

/**
 * PaywallSheet - Bottom sheet displaying subscription plans
 * Shows when user tries to access a premium feature
 */
export function PaywallSheet({
  isOpen,
  onClose,
  feature,
  title = 'Выберите план',
  description,
  onSelectPlan,
}: PaywallSheetProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
  const subscriptionTier = useAuthStore((state) => state.subscriptionTier);

  // Calculate savings for the highlighted plan (Plus)
  const plusPlan = subscriptionPlans.find((p) => p.id === 'plus');
  const yearlySavings = plusPlan ? getYearlySavingsPercent(plusPlan) : 17;

  const handleSelectPlan = useCallback(
    (planId: SubscriptionTier) => {
      // Log the feature that triggered the paywall for analytics
      if (feature) {
        console.log('[Paywall] Plan selected:', {
          planId,
          triggeredByFeature: feature,
          billingPeriod,
        });
      }

      if (onSelectPlan) {
        onSelectPlan(planId);
      }

      // Close the sheet after selection
      onClose();
    },
    [feature, billingPeriod, onSelectPlan, onClose]
  );

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title} snapPoint="full">
      <div className="space-y-6">
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}

        {/* Billing period toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                billingPeriod === 'monthly'
                  ? 'bg-card shadow-sm text-card-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              aria-pressed={billingPeriod === 'monthly'}
            >
              Месяц
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                billingPeriod === 'yearly'
                  ? 'bg-card shadow-sm text-card-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              aria-pressed={billingPeriod === 'yearly'}
            >
              Год{' '}
              <span className="text-green-500 font-semibold ml-1">
                -{yearlySavings}%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="space-y-4 pb-4">
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscriptionTier === plan.id}
              billingPeriod={billingPeriod}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          Подписку можно отменить в любое время
        </p>
      </div>
    </Sheet>
  );
}

export default PaywallSheet;
