'use client';

import { useToastContext } from '@/components/ui/ToastProvider';

export interface UseToastReturn {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export function useToast(): UseToastReturn {
  const { success, error, warning, info } = useToastContext();

  return {
    success,
    error,
    warning,
    info,
  };
}

export default useToast;
