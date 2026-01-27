import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const successHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Success });
  }
};

export const errorHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Error });
  }
};

export const selectionHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
};
