const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.migranthub.ru/api/v1';

interface RequestConfig extends RequestInit {
  timeout?: number;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout = 30000, ...fetchConfig } = config;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
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

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: 'Ошибка сервера',
          code: 'UNKNOWN_ERROR',
          status: response.status,
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
          code: 'TIMEOUT',
          status: 408,
        } as ApiError;
      }

      throw error;
    }
  }

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

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
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

  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Note: For progress tracking, we'd need XMLHttpRequest or a library
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Ошибка загрузки',
        code: 'UPLOAD_ERROR',
        status: response.status,
      }));
      throw error;
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<{ success: boolean; expiresIn: number }>('/auth/otp/send', { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post<{ token: string; user: { id: string; phone: string } }>('/auth/otp/verify', { phone, code }),

  refreshToken: () =>
    apiClient.post<{ token: string }>('/auth/refresh'),

  telegramAuth: (data: { id: number; first_name: string; auth_date: number; hash: string }) =>
    apiClient.post<{ token: string; user: { id: string; telegramId: string } }>('/auth/telegram', data),

  logout: () =>
    apiClient.post('/auth/logout'),
};

// Profile API
export const profileApi = {
  get: () =>
    apiClient.get<{ profile: unknown }>('/profile'),

  update: (data: Record<string, unknown>) =>
    apiClient.patch<{ profile: unknown }>('/profile', data),

  uploadDocument: (file: File) =>
    apiClient.upload<{ document: unknown }>('/profile/documents', file),
};

// Documents API
export const documentsApi = {
  list: () =>
    apiClient.get<{ documents: unknown[] }>('/documents'),

  get: (id: string) =>
    apiClient.get<{ document: unknown }>(`/documents/${id}`),

  generatePdf: (formType: string, data: Record<string, unknown>) =>
    apiClient.post<{ pdfUrl: string }>('/documents/generate', { formType, data }),
};
