'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, AlertCircle, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAppStore } from '@/lib/stores/appStore';

export function NotificationSettings() {
  const { t } = useTranslation();
  const {
    isSupported,
    isPermissionGranted,
    isRegistered,
    isInitializing,
    error,
    requestPermission,
    updatePreferences,
    preferences,
  } = usePushNotifications();

  const {
    pushNotificationsEnabled,
    pushPreferences,
    setPushNotificationsEnabled,
    updatePushPreference,
  } = useAppStore();

  const [isRequesting, setIsRequesting] = useState(false);

  // Sync local state with hook preferences
  useEffect(() => {
    if (preferences) {
      // Update store with backend preferences
      Object.entries(preferences).forEach(([key, value]) => {
        updatePushPreference(key as keyof typeof preferences, value);
      });
    }
  }, [preferences, updatePushPreference]);

  // Sync enabled state
  useEffect(() => {
    setPushNotificationsEnabled(isRegistered && isPermissionGranted);
  }, [isRegistered, isPermissionGranted, setPushNotificationsEnabled]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTogglePreference = async (key: keyof typeof pushPreferences) => {
    const newValue = !pushPreferences[key];
    // Optimistic update
    updatePushPreference(key, newValue);
    // Sync with backend
    const success = await updatePreferences({ [key]: newValue });
    if (!success) {
      // Revert on failure
      updatePushPreference(key, !newValue);
    }
  };

  // Not supported on web
  if (!isSupported) {
    return (
      <div className="pt-4 border-t-2 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <h4 className="text-sm font-bold text-gray-900">{t('pushNotifications.title')}</h4>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">{t('pushNotifications.notSupported')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isInitializing) {
    return (
      <div className="pt-4 border-t-2 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-gray-900">{t('pushNotifications.title')}</h4>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-gray-900">{t('pushNotifications.title')}</h4>
        </div>
        {pushNotificationsEnabled && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {t('pushNotifications.enabled')}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4">{t('pushNotifications.subtitle')}</p>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Permission not granted - show request button */}
      {!isPermissionGranted && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-2">
                {t('pushNotifications.permissionRequired')}
              </p>
              <p className="text-xs text-blue-700 mb-3">
                {t('pushNotifications.permissionDescription')}
              </p>
              <button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {t('pushNotifications.enableButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences toggles (only show when permission granted) */}
      {isPermissionGranted && (
        <div className="space-y-3">
          {/* Document Expiry */}
          <label className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {t('pushNotifications.types.documentExpiry')}
              </p>
              <p className="text-xs text-gray-500">
                {t('pushNotifications.types.documentExpiryDesc')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushPreferences.document_expiry}
              onChange={() => handleTogglePreference('document_expiry')}
              className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </label>

          {/* Patent Payment */}
          <label className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {t('pushNotifications.types.patentPayment')}
              </p>
              <p className="text-xs text-gray-500">
                {t('pushNotifications.types.patentPaymentDesc')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushPreferences.patent_payment}
              onChange={() => handleTogglePreference('patent_payment')}
              className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </label>

          {/* News */}
          <label className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {t('pushNotifications.types.news')}
              </p>
              <p className="text-xs text-gray-500">
                {t('pushNotifications.types.newsDesc')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushPreferences.news}
              onChange={() => handleTogglePreference('news')}
              className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </label>
        </div>
      )}

      {/* Status info */}
      {isPermissionGranted && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2">
            {isRegistered ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{t('pushNotifications.status.connected')}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">{t('pushNotifications.status.pending')}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
