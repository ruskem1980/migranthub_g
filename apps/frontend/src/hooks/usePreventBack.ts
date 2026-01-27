'use client';

import { useBackButtonHandler } from './useBackButton';

/**
 * Hook to prevent back navigation when form has unsaved changes
 * Shows confirmation dialog before allowing navigation
 *
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Custom confirmation message
 */
export function usePreventBack(
  isDirty: boolean,
  message = 'Отменить изменения?'
) {
  useBackButtonHandler(
    () => {
      if (isDirty) {
        return !confirm(message);
      }
      return false;
    },
    [isDirty, message]
  );
}
