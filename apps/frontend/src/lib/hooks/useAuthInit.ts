'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

export function useAuthInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const validateSession = useAuthStore((state) => state.validateSession);

  useEffect(() => {
    const init = async () => {
      await validateSession();
      setIsInitialized(true);
    };
    init();
  }, [validateSession]);

  return { isInitialized };
}
