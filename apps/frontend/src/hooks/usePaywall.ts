'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useConversionStore } from '@/lib/stores/conversionStore';
import type { Feature } from '@/types';

/**
 * Default titles for paywall based on feature
 */
const defaultTitles: Partial<Record<Feature, string>> = {
  documents_unlimited: 'Нужно больше документов?',
  ai_full: 'Достигнут лимит AI вопросов',
  checks_premium: 'Премиум проверка',
  reminders: 'Напоминания о дедлайнах',
  smart_reminders: 'Умные напоминания',
  backup: 'Облачное хранилище',
  exam_full: 'Полный доступ к экзамену',
};

/**
 * Default descriptions for paywall based on feature
 */
const defaultDescriptions: Partial<Record<Feature, string>> = {
  documents_unlimited: 'Перейдите на Plus для неограниченного хранения документов',
  ai_full: 'Обновите план для большего количества вопросов AI',
  checks_premium: 'Получите доступ к проверке ФССП и другим премиум проверкам',
  reminders: 'Получайте уведомления о важных сроках',
  smart_reminders: 'Умные напоминания с учетом вашего профиля',
  backup: 'Безопасное хранение данных в облаке',
  exam_full: 'Полный доступ ко всем вопросам экзамена',
};

/**
 * Get default title for a feature
 */
function getDefaultTitle(feature: Feature): string {
  return defaultTitles[feature] || 'Улучшите свой план';
}

/**
 * Get default description for a feature
 */
function getDefaultDescription(feature: Feature): string {
  return defaultDescriptions[feature] || 'Получите доступ к дополнительным возможностям';
}

export interface UsePaywallReturn {
  /** Whether the paywall sheet is open */
  isOpen: boolean;
  /** The feature that triggered the paywall */
  feature: Feature | null;
  /** Title for the paywall sheet */
  title: string | null;
  /** Description for the paywall sheet */
  description: string | null;
  /** Check if user has access to a feature */
  checkAccess: (feature: Feature) => boolean;
  /** Show the paywall for a specific feature */
  showPaywall: (feature: Feature, title?: string, description?: string) => void;
  /** Check access and show paywall if needed, returns true if access granted */
  checkAndShowPaywall: (feature: Feature, title?: string, description?: string) => boolean;
  /** Close the paywall */
  close: () => void;
}

/**
 * usePaywall - Hook for managing paywall display and feature access
 *
 * Provides utilities to:
 * - Check if user has access to a feature
 * - Show paywall when access is denied
 * - Track conversion triggers
 *
 * @example
 * ```tsx
 * const { checkAccess, showPaywall, isOpen, close } = usePaywall();
 *
 * const handlePremiumAction = () => {
 *   if (!checkAccess('documents_unlimited')) {
 *     showPaywall('documents_unlimited');
 *     return;
 *   }
 *   // Continue with premium action
 * };
 *
 * return (
 *   <>
 *     <button onClick={handlePremiumAction}>Upload Document</button>
 *     <PaywallSheet isOpen={isOpen} onClose={close} feature={feature} />
 *   </>
 * );
 * ```
 */
export function usePaywall(): UsePaywallReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const canAccess = useAuthStore((state) => state.canAccess);
  const { shouldShowPaywall, markPaywallShown, addTrigger } = useConversionStore();

  /**
   * Check if user has access to a feature
   */
  const checkAccess = useCallback(
    (feature: Feature): boolean => {
      return canAccess(feature);
    },
    [canAccess]
  );

  /**
   * Show the paywall for a specific feature
   */
  const showPaywall = useCallback(
    (feature: Feature, customTitle?: string, customDescription?: string) => {
      // Check cooldown - don't show too frequently
      if (!shouldShowPaywall(feature)) {
        return;
      }

      // Track the trigger
      addTrigger(feature);

      // Set paywall state
      setCurrentFeature(feature);
      setTitle(customTitle || getDefaultTitle(feature));
      setDescription(customDescription || getDefaultDescription(feature));
      setIsOpen(true);

      // Mark as shown
      markPaywallShown(feature);
    },
    [shouldShowPaywall, markPaywallShown, addTrigger]
  );

  /**
   * Check access and show paywall if needed
   * Returns true if user has access, false if paywall was shown
   */
  const checkAndShowPaywall = useCallback(
    (feature: Feature, customTitle?: string, customDescription?: string): boolean => {
      const hasAccess = checkAccess(feature);

      if (!hasAccess) {
        showPaywall(feature, customTitle, customDescription);
      }

      return hasAccess;
    },
    [checkAccess, showPaywall]
  );

  /**
   * Close the paywall
   */
  const close = useCallback(() => {
    setIsOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setCurrentFeature(null);
      setTitle(null);
      setDescription(null);
    }, 300);
  }, []);

  return {
    isOpen,
    feature: currentFeature,
    title,
    description,
    checkAccess,
    showPaywall,
    checkAndShowPaywall,
    close,
  };
}

export default usePaywall;
