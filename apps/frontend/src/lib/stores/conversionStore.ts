'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Feature } from '@/types';

/**
 * Conversion trigger event
 * Tracks when a user hits a feature limit or paywall
 */
export interface ConversionTrigger {
  feature: Feature;
  triggeredAt: string; // ISO date string
  context?: Record<string, unknown>;
}

/**
 * Paywall cooldown configuration (in milliseconds)
 */
const PAYWALL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ConversionState {
  // Trigger history
  triggers: ConversionTrigger[];

  // Paywall display tracking
  shownPaywalls: string[]; // feature names
  lastPaywallShown: string | null; // ISO date string

  // Actions
  addTrigger: (feature: Feature, context?: Record<string, unknown>) => void;
  shouldShowPaywall: (feature: Feature) => boolean;
  markPaywallShown: (feature: Feature) => void;
  getTriggersForFeature: (feature: Feature) => ConversionTrigger[];
  getTriggerCount: (feature: Feature) => number;
  clearTriggers: () => void;
  reset: () => void;
}

const initialState = {
  triggers: [] as ConversionTrigger[],
  shownPaywalls: [] as string[],
  lastPaywallShown: null as string | null,
};

export const useConversionStore = create<ConversionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addTrigger: (feature, context) =>
        set((state) => ({
          triggers: [
            ...state.triggers,
            {
              feature,
              triggeredAt: new Date().toISOString(),
              context,
            },
          ].slice(-100), // Keep only last 100 triggers to limit storage
        })),

      shouldShowPaywall: (feature) => {
        const state = get();
        const lastShown = state.lastPaywallShown;

        // No paywall shown yet - show it
        if (!lastShown) {
          return true;
        }

        // Check cooldown period
        const timeSinceLastPaywall = Date.now() - new Date(lastShown).getTime();
        if (timeSinceLastPaywall < PAYWALL_COOLDOWN_MS) {
          return false;
        }

        // Check if this specific feature paywall was shown today
        const today = new Date().toISOString().split('T')[0];
        const lastShownDate = lastShown.split('T')[0];

        // If last shown was today and for same feature, don't show again
        if (lastShownDate === today && state.shownPaywalls.includes(feature)) {
          return false;
        }

        return true;
      },

      markPaywallShown: (feature) =>
        set((state) => ({
          shownPaywalls: state.shownPaywalls.includes(feature)
            ? state.shownPaywalls
            : [...state.shownPaywalls, feature],
          lastPaywallShown: new Date().toISOString(),
        })),

      getTriggersForFeature: (feature) => {
        return get().triggers.filter((t) => t.feature === feature);
      },

      getTriggerCount: (feature) => {
        return get().triggers.filter((t) => t.feature === feature).length;
      },

      clearTriggers: () => set({ triggers: [] }),

      reset: () => set(initialState),
    }),
    {
      name: 'migranthub-conversion',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        triggers: state.triggers,
        shownPaywalls: state.shownPaywalls,
        lastPaywallShown: state.lastPaywallShown,
      }),
    }
  )
);
