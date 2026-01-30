'use client';

import { type ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import type { Feature } from '@/types';

/**
 * Simplified feature categories for FeatureGate
 * Maps to actual Feature types from access.ts
 */
export type FeatureCategory =
  | 'documents'
  | 'reminders'
  | 'ai'
  | 'backup'
  | 'calculator'
  | 'checks'
  | 'exam';

/**
 * Maps feature categories to their primary Feature type
 */
const featureCategoryMap: Record<FeatureCategory, Feature> = {
  documents: 'documents_save',
  reminders: 'reminders',
  ai: 'ai_basic',
  backup: 'backup',
  calculator: 'calculator',
  checks: 'checks_basic',
  exam: 'exam_basic',
};

export interface FeatureGateProps {
  /**
   * The feature category to check access for
   */
  feature: FeatureCategory;
  /**
   * Content to render when the user has access
   */
  children: ReactNode;
  /**
   * Optional content to render when access is denied
   * If not provided, nothing is rendered when access is denied
   */
  fallback?: ReactNode;
}

/**
 * FeatureGate - Conditionally renders content based on feature access
 *
 * Uses the authStore to check if the current user has access to a feature.
 * Shows children when access is granted, fallback (or nothing) when denied.
 *
 * @example
 * ```tsx
 * <FeatureGate feature="documents" fallback={<UpgradePrompt />}>
 *   <DocumentManager />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const canAccess = useAuthStore((state) => state.canAccess);

  const featureType = featureCategoryMap[feature];
  const hasAccess = canAccess(featureType);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default FeatureGate;
