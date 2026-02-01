/**
 * Event system for synchronizing legal data updates across hooks
 *
 * When legal metadata changes (lastUpdatedAt from API), this event system
 * notifies all subscribed hooks to invalidate their caches and refetch data.
 */

export const LEGAL_DATA_UPDATED = 'legal-data-updated';

interface LegalDataEventDetail {
  newDate: string;
  previousDate: string | null;
}

/**
 * Emit a legal data updated event
 * Called by useLegalMetadata when it detects a new lastUpdatedAt from the server
 */
export function emitLegalDataUpdated(newDate: string, previousDate: string | null): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent<LegalDataEventDetail>(LEGAL_DATA_UPDATED, {
    detail: { newDate, previousDate },
  });

  window.dispatchEvent(event);
}

/**
 * Subscribe to legal data updated events
 * Returns an unsubscribe function
 *
 * @param callback Called when legal data is updated with the new date
 * @returns Cleanup function to unsubscribe
 */
export function onLegalDataUpdated(
  callback: (newDate: string, previousDate: string | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<LegalDataEventDetail>;
    callback(customEvent.detail.newDate, customEvent.detail.previousDate);
  };

  window.addEventListener(LEGAL_DATA_UPDATED, handler);

  return () => {
    window.removeEventListener(LEGAL_DATA_UPDATED, handler);
  };
}

/**
 * Check if there are new updates available
 * Compares two ISO date strings
 */
export function hasNewerData(currentDate: string | null, newDate: string | null): boolean {
  if (!newDate) return false;
  if (!currentDate) return true;

  const current = new Date(currentDate).getTime();
  const updated = new Date(newDate).getTime();

  return updated > current;
}
