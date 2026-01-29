'use client';

import { tokenStorage } from './storage';
import { offlineQueue } from '../sync/offlineQueue';
import type { QueueableMethod } from '../sync/types';
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
  CategoryDto,
  LawDto,
  FormDto,
  FaqItemDto,
  LegalMetadataDto,
  CheckPatentRequest,
  PatentCheckResponse,
  GetInnRequest,
  InnCheckResponse,
  CheckPermitRequest,
  PermitStatusResponse,
  ChatHistoryMessage,
  AssistantChatResponse,
  AssistantSearchResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentHistoryResponse,
  OcrProcessResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  /** Название операции для отображения в очереди */
  offlineAction?: string;
  /** Пропустить сохранение в offline queue */
  skipOfflineQueue?: boolean;
}

/** Методы, которые сохраняются в offline queue */
const QUEUEABLE_METHODS: QueueableMethod[] = ['POST', 'PATCH', 'PUT', 'DELETE'];

/** Результат offline запроса */
interface OfflineQueuedResult {
  queued: true;
  queueId: string;
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

  private isQueueableMethod(method?: string): method is QueueableMethod {
    return QUEUEABLE_METHODS.includes(method as QueueableMethod);
  }

  private isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { timeout = 30000, skipAuth = false, offlineAction, skipOfflineQueue = false, ...fetchConfig } = config;

    // Проверка offline режима для queueable методов
    const method = fetchConfig.method || 'GET';
    if (!this.isOnline() && this.isQueueableMethod(method) && !skipOfflineQueue) {
      const queueId = await offlineQueue.enqueue({
        action: offlineAction || `${method} ${endpoint}`,
        endpoint,
        method,
        body: fetchConfig.body ? JSON.parse(fetchConfig.body as string) : undefined,
      });

      return { queued: true, queueId } as unknown as T;
    }

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
      if (!text) return {} as T;

      const json = JSON.parse(text);
      // Backend wraps responses in {data: ..., meta: ...}, extract data
      if (json && typeof json === 'object' && 'data' in json && 'meta' in json) {
        return json.data as T;
      }
      return json as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          message: 'Превышено время ожидания',
          statusCode: 408,
        } as ApiError;
      }

      // При сетевой ошибке для queueable методов сохраняем в очередь
      if (
        error instanceof TypeError &&
        error.message === 'Failed to fetch' &&
        this.isQueueableMethod(method) &&
        !skipOfflineQueue
      ) {
        const queueId = await offlineQueue.enqueue({
          action: offlineAction || `${method} ${endpoint}`,
          endpoint,
          method,
          body: fetchConfig.body ? JSON.parse(fetchConfig.body as string) : undefined,
        });

        return { queued: true, queueId } as unknown as T;
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

  verifyRecovery: (deviceId: string, recoveryCode: string) =>
    apiClient.post<AuthResponse>(
      '/auth/recovery/verify',
      { deviceId, recoveryCode },
      { skipAuth: true }
    ),
};

// Users API
export const usersApi = {
  getMe: () => apiClient.get<ApiUser>('/users/me'),

  updateMe: (data: UpdateUserRequest) =>
    apiClient.patch<ApiUser | OfflineQueuedResult>('/users/me', data, {
      offlineAction: 'Обновление профиля',
    }),
};

// Utilities API
export const utilitiesApi = {
  checkBan: (params: BanCheckRequest) => {
    const queryParams: Record<string, string> = {
      lastName: params.lastName,
      firstName: params.firstName,
      birthDate: params.birthDate,
    };
    if (params.middleName) queryParams.middleName = params.middleName;
    if (params.citizenship) queryParams.citizenship = params.citizenship;
    if (params.source) queryParams.source = params.source;

    const query = new URLSearchParams(queryParams);
    return apiClient.get<BanCheckResponse>(`/utilities/ban-check?${query}`);
  },

  getPatentRegions: () =>
    apiClient.get<PatentRegionsResponse>('/utilities/patent/regions', { skipAuth: true }),

  checkPatent: (data: CheckPatentRequest) =>
    apiClient.post<PatentCheckResponse>('/utilities/patent/check', data, { skipAuth: true }),

  checkInn: (data: GetInnRequest) =>
    apiClient.post<InnCheckResponse>('/utilities/inn-check', data),

  checkPermitStatus: (data: CheckPermitRequest) =>
    apiClient.post<PermitStatusResponse>('/utilities/permit-status', data),
};

// Health API
export const healthApi = {
  check: () => apiClient.get<HealthResponse>('/health', { skipAuth: true }),
};

// Legal API
export const legalApi = {
  getMetadata: () =>
    apiClient.get<LegalMetadataDto>('/legal/metadata', { skipAuth: true }),

  getCategories: () =>
    apiClient.get<CategoryDto[]>('/legal/categories', { skipAuth: true }),

  getLaws: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const query = params.toString();
    return apiClient.get<LawDto[]>(`/legal/laws${query ? `?${query}` : ''}`, { skipAuth: true });
  },

  getForms: (categoryId?: string) => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return apiClient.get<FormDto[]>(`/legal/forms${query}`, { skipAuth: true });
  },

  getFaq: (categoryId?: string) => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return apiClient.get<FaqItemDto[]>(`/legal/faq${query}`, { skipAuth: true });
  },
};

// Assistant API
export const assistantApi = {
  chat: (message: string, history?: ChatHistoryMessage[]) =>
    apiClient.post<AssistantChatResponse>('/assistant/chat', { message, history }, { skipAuth: true }),

  search: (query: string, limit?: number) =>
    apiClient.post<AssistantSearchResponse>('/assistant/search', { query, limit }, { skipAuth: true }),
};

// Payments API
export const paymentsApi = {
  create: (data: CreatePaymentRequest) =>
    apiClient.post<CreatePaymentResponse>('/payments/create', data, {
      offlineAction: 'Создание платежа',
    }),

  getStatus: (paymentId: string) =>
    apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}/status`),

  getPayment: (paymentId: string) =>
    apiClient.get<PaymentResponse>(`/payments/${paymentId}`),

  getHistory: (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString();
    return apiClient.get<PaymentHistoryResponse>(`/payments${query ? `?${query}` : ''}`);
  },
};

// OCR API
export const ocrApi = {
  /**
   * Process document image with OCR
   * Uses multipart/form-data for file upload
   */
  processDocument: async (file: File, documentType?: string): Promise<OcrProcessResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (documentType) {
      formData.append('documentType', documentType);
    }

    const token = await tokenStorage.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/ocr/process`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'OCR processing failed',
        statusCode: response.status,
      }));
      throw error;
    }

    const json = await response.json();
    // Handle wrapped response
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as OcrProcessResponse;
    }
    return json as OcrProcessResponse;
  },
};

export { API_BASE_URL };
export type { OfflineQueuedResult };
