'use client';

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'migranthub_access_token',
  REFRESH_TOKEN: 'migranthub_refresh_token',
  DEVICE_ID: 'migranthub_device_id',
  TOKEN_EXPIRES_AT: 'migranthub_token_expires_at',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

class SecureStorage {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async set(key: StorageKey, value: string): Promise<void> {
    if (this.isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async get(key: StorageKey): Promise<string | null> {
    if (this.isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  }

  async remove(key: StorageKey): Promise<void> {
    if (this.isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isNative) {
      await Preferences.clear();
    } else {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  }
}

const storage = new SecureStorage();

// Token storage helpers
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return storage.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;
    await Promise.all([
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      storage.set(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString()),
    ]);
  },

  async getTokenExpiresAt(): Promise<number | null> {
    const value = await storage.get(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    return value ? parseInt(value, 10) : null;
  },

  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await this.getTokenExpiresAt();
    if (!expiresAt) return true;
    // Consider token expired 1 minute before actual expiry
    return Date.now() >= expiresAt - 60000;
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      storage.remove(STORAGE_KEYS.TOKEN_EXPIRES_AT),
    ]);
  },
};

// Device ID storage helpers
export const deviceStorage = {
  async getDeviceId(): Promise<string | null> {
    return storage.get(STORAGE_KEYS.DEVICE_ID);
  },

  async setDeviceId(deviceId: string): Promise<void> {
    await storage.set(STORAGE_KEYS.DEVICE_ID, deviceId);
  },

  async hasDeviceId(): Promise<boolean> {
    const deviceId = await this.getDeviceId();
    return deviceId !== null && deviceId.length > 0;
  },
};

export { storage, STORAGE_KEYS };
