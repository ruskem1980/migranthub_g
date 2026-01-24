'use client';

import { deviceStorage } from './storage';

function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId(): Promise<string> {
  // Try to get existing device ID
  const existingId = await deviceStorage.getDeviceId();

  if (existingId) {
    return existingId;
  }

  // Generate new device ID
  const newDeviceId = generateUUID();
  await deviceStorage.setDeviceId(newDeviceId);

  return newDeviceId;
}

export async function getDeviceId(): Promise<string | null> {
  return deviceStorage.getDeviceId();
}

export async function hasDeviceId(): Promise<boolean> {
  return deviceStorage.hasDeviceId();
}
