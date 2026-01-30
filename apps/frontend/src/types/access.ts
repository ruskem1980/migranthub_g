/**
 * Access control types for Lazy Auth system
 * Defines user access modes, subscription tiers, and feature permissions
 */

export type AccessMode = 'anonymous' | 'registered' | 'subscribed';
export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface AccessState {
  mode: AccessMode;
  tier: SubscriptionTier;
  isAnonymous: boolean;
  canAccess: (feature: Feature) => boolean;
}

export type Feature =
  | 'calculator'
  | 'exam_basic'
  | 'exam_full'
  | 'documents_read'
  | 'documents_save'
  | 'documents_unlimited'
  | 'ai_basic'
  | 'ai_full'
  | 'reminders'
  | 'smart_reminders'
  | 'backup'
  | 'checks_basic'
  | 'checks_premium';

/**
 * Feature access matrix
 * Defines minimum access mode and subscription tier required for each feature
 */
export const featureAccess: Record<Feature, { minMode: AccessMode; minTier: SubscriptionTier }> = {
  calculator: { minMode: 'anonymous', minTier: 'free' },
  exam_basic: { minMode: 'anonymous', minTier: 'free' },
  exam_full: { minMode: 'registered', minTier: 'free' },
  documents_read: { minMode: 'anonymous', minTier: 'free' },
  documents_save: { minMode: 'registered', minTier: 'free' },
  documents_unlimited: { minMode: 'registered', minTier: 'plus' },
  ai_basic: { minMode: 'anonymous', minTier: 'free' },
  ai_full: { minMode: 'registered', minTier: 'plus' },
  reminders: { minMode: 'registered', minTier: 'free' },
  smart_reminders: { minMode: 'registered', minTier: 'plus' },
  backup: { minMode: 'registered', minTier: 'plus' },
  checks_basic: { minMode: 'anonymous', minTier: 'free' },
  checks_premium: { minMode: 'registered', minTier: 'plus' },
};

/**
 * Access mode hierarchy for comparison
 */
const accessModeOrder: Record<AccessMode, number> = {
  anonymous: 0,
  registered: 1,
  subscribed: 2,
};

/**
 * Subscription tier hierarchy for comparison
 */
const subscriptionTierOrder: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

/**
 * Check if user has access to a specific feature
 */
export function canAccessFeature(
  userMode: AccessMode,
  userTier: SubscriptionTier,
  feature: Feature
): boolean {
  const required = featureAccess[feature];
  const hasMinMode = accessModeOrder[userMode] >= accessModeOrder[required.minMode];
  const hasMinTier = subscriptionTierOrder[userTier] >= subscriptionTierOrder[required.minTier];
  return hasMinMode && hasMinTier;
}

/**
 * Get the reason why a feature is locked
 */
export function getFeatureLockReason(
  userMode: AccessMode,
  userTier: SubscriptionTier,
  feature: Feature
): 'registration_required' | 'subscription_required' | null {
  const required = featureAccess[feature];
  const hasMinMode = accessModeOrder[userMode] >= accessModeOrder[required.minMode];
  const hasMinTier = subscriptionTierOrder[userTier] >= subscriptionTierOrder[required.minTier];

  if (!hasMinMode) {
    return 'registration_required';
  }
  if (!hasMinTier) {
    return 'subscription_required';
  }
  return null;
}

/**
 * Quick profile for fast registration (3 fields only)
 */
export interface QuickProfile {
  phone: string;
  citizenship: string;
  entryDate: string;
}
