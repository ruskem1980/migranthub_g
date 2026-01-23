'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../stores';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const setOnlineInStore = useAppStore((state) => state.setOnline);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setOnlineInStore(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setOnlineInStore(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOnlineInStore(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineInStore]);

  return isOnline;
}
