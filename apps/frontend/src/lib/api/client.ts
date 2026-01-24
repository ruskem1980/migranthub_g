'use client';

import { tokenStorage } from './storage';
import type {
  ApiError,
  AuthResponse,
  DeviceAuthRequest,
  RefreshTokenRequest,
  ApiUser,
  UpdateUserRequest,
  BanCheckRequest,
  BanCheckResponse,
  PatentRegionsResponse,
  HealthResponse,
  AuthTokens,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAccessToken(): Promise<string | null> {
    return tokenStorage.getAccessToken();
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { timeout = 30000, skipAuth = false, ...fetchConfig } = config;

    // Get token if needed
    let token: string | null = null;
    if (!skipAuth) {
      // Check if token is expired and refresh if needed
      const isExpired = await tokenStorage.isTokenExpired();
      if (isExpired) {
        try {
          await this.refreshTokens();
        } catch {
          // Token refresh failed, continue without token
        }
      }
      token = await this.getAccessToken();
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchConfig.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 - try to refresh token once
      if (response.status === 401 && !skipAuth) {
        try {
          await this.refreshTokens();
          // Retry request with new token
          return this.request<T>(endpoint, { ...config, skipAuth: true });
        } catch {
          // Refresh failed, throw original error
          await tokenStorage.clearTokens();
          throw {
            message: 'Сессия истекла',
            statusCode: 401,
          } as ApiError;
        }
      }

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: 'Ошибка сервера',
          statusCode: response.status,
        }));
        throw error;
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          message: 'Превышено время ожидания',
          statusCode: 408,
        } as ApiError;
      }

      throw error;
    }
  }

  private async refreshTokens(): Promise<AuthTokens> {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshTokens();

    try {
      const tokens = await this.refreshPromise;
      return tokens;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshTokens(): Promise<AuthTokens> {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data: AuthResponse = await response.json();
    await tokenStorage.setTokens(
      data.tokens.accessToken,
      data.tokens.refreshToken,
      data.tokens.expiresIn
    );

    return data.tokens;
  }

  // HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  deviceAuth: (deviceId: string) =>
    apiClient.post<AuthResponse>('/auth/device', { deviceId } as DeviceAuthRequest, {
      skipAuth: true,
    }),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>(
      '/auth/refresh',
      { refreshToken } as RefreshTokenRequest,
      { skipAuth: true }
    ),
};

// Users API
export const usersApi = {
  getMe: () => apiClient.get<ApiUser>('/users/me'),

  updateMe: (data: UpdateUserRequest) => apiClient.patch<ApiUser>('/users/me', data),
};

// Utilities API
export const utilitiesApi = {
  checkBan: (params: BanCheckRequest) => {
    const query = new URLSearchParams({
      lastName: params.lastName,
      firstName: params.firstName,
      birthDate: params.birthDate,
    });
    return apiClient.get<BanCheckResponse>(`/utilities/ban-check?${query}`);
  },

  getPatentRegions: () =>
    apiClient.get<PatentRegionsResponse>('/utilities/patent/regions', { skipAuth: true }),
};

// Health API
export const healthApi = {
  check: () => apiClient.get<HealthResponse>('/health', { skipAuth: true }),
};

export { API_BASE_URL };
