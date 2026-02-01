/**
 * Tests for API Client
 */
import {
  mockFetch,
  mockFetchError,
  mockFetchNetworkError,
  mockFetchEmpty,
  mockFetchSequence,
  getLastFetchCall,
} from '../../mocks/server';
import type { ApiUser, AuthResponse, BanCheckResponse, PatentRegionsResponse, HealthResponse } from '@/lib/api/types';

// Create a shared mock state object that can be accessed by the mock factory
// Using globalThis to make it accessible during jest.mock hoisting
declare global {
  var __mockTokenState: {
    accessToken: string | null;
    refreshToken: string | null;
    isExpired: boolean;
  };
  var __mockTokenStorage: {
    setTokens: jest.Mock;
    clearTokens: jest.Mock;
  };
}

globalThis.__mockTokenState = {
  accessToken: null,
  refreshToken: null,
  isExpired: true,
};

globalThis.__mockTokenStorage = {
  setTokens: jest.fn(() => Promise.resolve()),
  clearTokens: jest.fn(() => {
    globalThis.__mockTokenState.accessToken = null;
    globalThis.__mockTokenState.refreshToken = null;
    return Promise.resolve();
  }),
};

// Must be before import - uses globalThis which is available during hoisting
jest.mock('@/lib/api/storage', () => ({
  tokenStorage: {
    getAccessToken: () => Promise.resolve(globalThis.__mockTokenState.accessToken),
    getRefreshToken: () => Promise.resolve(globalThis.__mockTokenState.refreshToken),
    isTokenExpired: () => Promise.resolve(globalThis.__mockTokenState.isExpired),
    setTokens: (...args: unknown[]) => globalThis.__mockTokenStorage.setTokens(...args),
    clearTokens: () => globalThis.__mockTokenStorage.clearTokens(),
  },
}));

// Import after mocking
import { apiClient, authApi, usersApi, utilitiesApi, healthApi, API_BASE_URL } from '@/lib/api/client';
import { tokenStorage } from '@/lib/api/storage';

// Helper to set mock token state
const setMockTokenState = (state: {
  accessToken?: string | null;
  refreshToken?: string | null;
  isExpired?: boolean;
}) => {
  if (state.accessToken !== undefined) globalThis.__mockTokenState.accessToken = state.accessToken;
  if (state.refreshToken !== undefined) globalThis.__mockTokenState.refreshToken = state.refreshToken;
  if (state.isExpired !== undefined) globalThis.__mockTokenState.isExpired = state.isExpired;
};

const resetMockTokenState = () => {
  globalThis.__mockTokenState.accessToken = null;
  globalThis.__mockTokenState.refreshToken = null;
  globalThis.__mockTokenState.isExpired = true;
  globalThis.__mockTokenStorage.setTokens.mockClear();
  globalThis.__mockTokenStorage.clearTokens.mockClear();
};

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTokenState();
    // By default, token is not expired
    setMockTokenState({ isExpired: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HTTP Methods', () => {
    describe('GET requests', () => {
      it('makes GET request to correct URL', async () => {
        mockFetch({ data: 'test' });

        await apiClient.get('/test-endpoint');

        const [url, config] = getLastFetchCall()!;
        expect(url).toBe(`${API_BASE_URL}/test-endpoint`);
        expect(config.method).toBe('GET');
      });

      it('returns parsed JSON data', async () => {
        const responseData = { id: 1, name: 'Test' };
        mockFetch(responseData);

        const result = await apiClient.get('/test');

        expect(result).toEqual(responseData);
      });

      it('handles empty response', async () => {
        mockFetchEmpty();

        const result = await apiClient.get('/test');

        expect(result).toEqual({});
      });
    });

    describe('POST requests', () => {
      it('makes POST request with body', async () => {
        mockFetch({ success: true });
        const payload = { foo: 'bar', num: 123 };

        await apiClient.post('/test', payload);

        const [, config] = getLastFetchCall()!;
        expect(config.method).toBe('POST');
        expect(config.body).toBe(JSON.stringify(payload));
      });

      it('makes POST request without body', async () => {
        mockFetch({ success: true });

        await apiClient.post('/test');

        const [, config] = getLastFetchCall()!;
        expect(config.method).toBe('POST');
        expect(config.body).toBeUndefined();
      });

      it('sets Content-Type header to application/json', async () => {
        mockFetch({});

        await apiClient.post('/test', { data: 'value' });

        const [, config] = getLastFetchCall()!;
        expect(config.headers).toMatchObject({
          'Content-Type': 'application/json',
        });
      });
    });

    describe('PATCH requests', () => {
      it('makes PATCH request with body', async () => {
        mockFetch({ updated: true });
        const payload = { name: 'Updated' };

        await apiClient.patch('/test', payload);

        const [, config] = getLastFetchCall()!;
        expect(config.method).toBe('PATCH');
        expect(config.body).toBe(JSON.stringify(payload));
      });
    });

    describe('DELETE requests', () => {
      it('makes DELETE request', async () => {
        mockFetch({ deleted: true });

        await apiClient.delete('/test');

        const [, config] = getLastFetchCall()!;
        expect(config.method).toBe('DELETE');
      });
    });
  });

  describe('Authentication', () => {
    it('adds Authorization header when token is available', async () => {
      setMockTokenState({ accessToken: 'test-access-token', isExpired: false });
      mockFetch({});

      await apiClient.get('/protected');

      const [, config] = getLastFetchCall()!;
      expect(config.headers).toMatchObject({
        Authorization: 'Bearer test-access-token',
      });
    });

    it('skips Authorization header when skipAuth is true', async () => {
      setMockTokenState({ accessToken: 'test-access-token', isExpired: false });
      mockFetch({});

      await apiClient.get('/public', { skipAuth: true });

      const [, config] = getLastFetchCall()!;
      expect((config.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    it('does not add Authorization when no token available', async () => {
      setMockTokenState({ accessToken: null, isExpired: true });
      mockFetch({});

      await apiClient.get('/test');

      const [, config] = getLastFetchCall()!;
      expect((config.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    it('attempts token refresh when token is expired', async () => {
      setMockTokenState({
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        isExpired: true,
      });

      // First call is refresh, second is the actual request
      mockFetchSequence([
        {
          data: {
            tokens: {
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
              expiresIn: 3600,
            },
            user: { id: '1' },
          },
        },
        { data: { result: 'success' } },
      ]);

      await apiClient.get('/protected');

      expect(globalThis.__mockTokenStorage.setTokens).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('throws ApiError on non-ok response', async () => {
      mockFetchError('Not found', 404);

      await expect(apiClient.get('/missing')).rejects.toMatchObject({
        message: 'Not found',
        statusCode: 404,
      });
    });

    it('handles network errors', async () => {
      mockFetchNetworkError('Network error');

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('handles 401 by clearing tokens', async () => {
      setMockTokenState({
        accessToken: 'expired-token',
        refreshToken: null, // No refresh token
        isExpired: false,
      });
      mockFetchError('Unauthorized', 401);

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        statusCode: 401,
      });

      expect(globalThis.__mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it('handles malformed JSON in error response', async () => {
      const mock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue(''),
      });
      global.fetch = mock;

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Ошибка сервера',
        statusCode: 500,
      });
    });
  });

  describe('Timeout', () => {
    it('handles abort error correctly', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      // Mock fetch to immediately reject with AbortError
      const mock = jest.fn().mockRejectedValue(abortError);
      global.fetch = mock;

      await expect(apiClient.get('/slow', { timeout: 100 })).rejects.toMatchObject({
        message: 'Превышено время ожидания',
        statusCode: 408,
      });
    });
  });
});

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTokenState();
  });

  describe('deviceAuth', () => {
    it('sends device auth request', async () => {
      const authResponse: AuthResponse = {
        user: {
          id: 'user-1',
          citizenshipCode: null,
          regionCode: null,
          entryDate: null,
          subscriptionType: 'free',
          subscriptionExpiresAt: null,
          settings: {
            locale: 'ru',
            timezone: 'Europe/Moscow',
            notifications: { push: true, telegram: false, deadlines: true, news: false },
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      };
      mockFetch(authResponse);

      const result = await authApi.deviceAuth('device-123', 'web', '1.0.0');

      expect(result).toEqual(authResponse);
      const [url, config] = getLastFetchCall()!;
      expect(url).toContain('/auth/device');
      expect(JSON.parse(config.body as string)).toEqual({ deviceId: 'device-123', platform: 'web', appVersion: '1.0.0' });
    });

    it('does not send auth header for device auth', async () => {
      setMockTokenState({ accessToken: 'existing-token', isExpired: false });
      mockFetch({ user: {}, tokens: {} });

      await authApi.deviceAuth('device-123', 'web', '1.0.0');

      const [, config] = getLastFetchCall()!;
      expect((config.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('sends refresh token request', async () => {
      mockFetch({
        tokens: { accessToken: 'new', refreshToken: 'new-refresh', expiresIn: 3600 },
        user: {},
      });

      await authApi.refresh('old-refresh-token');

      const [url, config] = getLastFetchCall()!;
      expect(url).toContain('/auth/refresh');
      expect(JSON.parse(config.body as string)).toEqual({ refreshToken: 'old-refresh-token' });
    });
  });
});

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTokenState();
    setMockTokenState({ accessToken: 'test-token', isExpired: false });
  });

  describe('getMe', () => {
    it('fetches current user', async () => {
      const user: ApiUser = {
        id: 'user-1',
        citizenshipCode: 'UZ',
        regionCode: 'moscow',
        entryDate: '2024-01-01',
        subscriptionType: 'free',
        subscriptionExpiresAt: null,
        settings: {
          locale: 'ru',
          timezone: 'Europe/Moscow',
          notifications: { push: true, telegram: false, deadlines: true, news: false },
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockFetch(user);

      const result = await usersApi.getMe();

      expect(result).toEqual(user);
      const [url] = getLastFetchCall()!;
      expect(url).toContain('/users/me');
    });
  });

  describe('updateMe', () => {
    it('updates current user', async () => {
      const updatedUser: ApiUser = {
        id: 'user-1',
        citizenshipCode: 'TJ',
        regionCode: 'spb',
        entryDate: '2024-02-01',
        subscriptionType: 'free',
        subscriptionExpiresAt: null,
        settings: {
          locale: 'ru',
          timezone: 'Europe/Moscow',
          notifications: { push: true, telegram: false, deadlines: true, news: false },
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
      mockFetch(updatedUser);

      const result = await usersApi.updateMe({
        citizenshipCode: 'TJ',
        regionCode: 'spb',
      });

      expect(result).toEqual(updatedUser);
      const [url, config] = getLastFetchCall()!;
      expect(url).toContain('/users/me');
      expect(config.method).toBe('PATCH');
    });
  });
});

describe('Utilities API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTokenState();
    setMockTokenState({ accessToken: 'test-token', isExpired: false });
  });

  describe('checkBan', () => {
    it('sends ban check request with query params', async () => {
      const response: BanCheckResponse = {
        status: 'no_ban',
        checkedAt: '2024-01-01T00:00:00Z',
      };
      mockFetch(response);

      const result = await utilitiesApi.checkBan({
        lastName: 'Иванов',
        firstName: 'Иван',
        birthDate: '1990-01-01',
      });

      expect(result).toEqual(response);
      const [url] = getLastFetchCall()!;
      expect(url).toContain('/utilities/ban-check');
      expect(url).toContain('lastName');
      expect(url).toContain('firstName');
      expect(url).toContain('birthDate');
    });
  });

  describe('getPatentRegions', () => {
    it('fetches patent regions without auth', async () => {
      const response: PatentRegionsResponse = {
        regions: [
          { code: 'moscow', name: 'Москва', price: 7500 },
          { code: 'spb', name: 'Санкт-Петербург', price: 4500 },
        ],
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockFetch(response);

      const result = await utilitiesApi.getPatentRegions();

      expect(result).toEqual(response);
      const [url] = getLastFetchCall()!;
      expect(url).toContain('/utilities/patent/regions');
    });
  });
});

describe('Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('checks API health without auth', async () => {
      const response: HealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
      };
      mockFetch(response);

      const result = await healthApi.check();

      expect(result).toEqual(response);
      const [url] = getLastFetchCall()!;
      expect(url).toContain('/health');
    });
  });
});
