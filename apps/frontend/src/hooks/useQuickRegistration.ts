'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores';
import type { RegistrationTrigger } from '@/components/registration/QuickRegistrationSheet';

/**
 * Prefill data for the registration form
 */
export interface RegistrationPrefillData {
  entryDate?: string;
  region?: string;
  citizenship?: string;
}

/**
 * Return type for useQuickRegistration hook
 */
export interface UseQuickRegistrationReturn {
  /** Whether the registration sheet is open */
  isOpen: boolean;
  /** The trigger that caused the sheet to open */
  trigger: RegistrationTrigger | null;
  /** Prefilled data for the form */
  prefillData: RegistrationPrefillData | null;
  /**
   * Check if registration is required and open sheet if so.
   * Returns true if user is already registered (action can proceed).
   * Returns false if user is anonymous (sheet will open).
   */
  requireRegistration: (
    triggerName: RegistrationTrigger,
    prefill?: RegistrationPrefillData
  ) => boolean;
  /** Open the registration sheet directly */
  open: (trigger?: RegistrationTrigger, prefill?: RegistrationPrefillData) => void;
  /** Close the registration sheet */
  close: () => void;
}

/**
 * Hook for managing quick registration flow
 *
 * @example
 * ```tsx
 * const { requireRegistration, isOpen, close, trigger, prefillData } = useQuickRegistration();
 *
 * const handleSaveResult = () => {
 *   if (!requireRegistration('save_result', { entryDate: calculatedDate })) {
 *     // User is anonymous, sheet will open
 *     return;
 *   }
 *   // User is registered, proceed with save
 *   saveResult();
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSaveResult}>Save Result</button>
 *     <QuickRegistrationSheet
 *       isOpen={isOpen}
 *       onClose={close}
 *       onComplete={handleRegistrationComplete}
 *       trigger={trigger}
 *       prefillData={prefillData}
 *     />
 *   </>
 * );
 * ```
 */
export function useQuickRegistration(): UseQuickRegistrationReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<RegistrationTrigger | null>(null);
  const [prefillData, setPrefillData] = useState<RegistrationPrefillData | null>(null);

  const isAnonymous = useAuthStore((state) => state.isAnonymous);

  /**
   * Check if user is anonymous and open registration sheet if so.
   * Returns true if user is registered (can proceed with action).
   * Returns false if user is anonymous (sheet will open).
   */
  const requireRegistration = useCallback(
    (triggerName: RegistrationTrigger, prefill?: RegistrationPrefillData): boolean => {
      if (isAnonymous) {
        setTrigger(triggerName);
        setPrefillData(prefill || null);
        setIsOpen(true);
        return false; // Not registered, sheet is opening
      }
      return true; // Already registered, can proceed
    },
    [isAnonymous]
  );

  /**
   * Open the registration sheet directly
   */
  const open = useCallback(
    (triggerName: RegistrationTrigger = 'general', prefill?: RegistrationPrefillData) => {
      setTrigger(triggerName);
      setPrefillData(prefill || null);
      setIsOpen(true);
    },
    []
  );

  /**
   * Close the registration sheet and reset state
   */
  const close = useCallback(() => {
    setIsOpen(false);
    // Delay resetting trigger and prefillData to allow for exit animation
    setTimeout(() => {
      setTrigger(null);
      setPrefillData(null);
    }, 300);
  }, []);

  return {
    isOpen,
    trigger,
    prefillData,
    requireRegistration,
    open,
    close,
  };
}

export default useQuickRegistration;
