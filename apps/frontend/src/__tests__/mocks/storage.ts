/**
 * Mock for tokenStorage and deviceStorage
 */

interface TokenStorageMock {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isExpired: boolean;
}

const defaultState: TokenStorageMock = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isExpired: true,
};

let mockState = { ...defaultState };

/**
 * Create mocked tokenStorage
 */
export const createTokenStorageMock = () => ({
  getAccessToken: jest.fn().mockImplementation(() => Promise.resolve(mockState.accessToken)),
  setAccessToken: jest.fn().mockImplementation((token: string) => {
    mockState.accessToken = token;
    return Promise.resolve();
  }),
  getRefreshToken: jest.fn().mockImplementation(() => Promise.resolve(mockState.refreshToken)),
  setRefreshToken: jest.fn().mockImplementation((token: string) => {
    mockState.refreshToken = token;
    return Promise.resolve();
  }),
  setTokens: jest.fn().mockImplementation((access: string, refresh: string, expiresIn: number) => {
    mockState.accessToken = access;
    mockState.refreshToken = refresh;
    mockState.expiresAt = Date.now() + expiresIn * 1000;
    return Promise.resolve();
  }),
  getTokenExpiresAt: jest.fn().mockImplementation(() => Promise.resolve(mockState.expiresAt)),
  isTokenExpired: jest.fn().mockImplementation(() => Promise.resolve(mockState.isExpired)),
  clearTokens: jest.fn().mockImplementation(() => {
    mockState.accessToken = null;
    mockState.refreshToken = null;
    mockState.expiresAt = null;
    return Promise.resolve();
  }),
});

/**
 * Set mock token state
 */
export const setMockTokenState = (state: Partial<TokenStorageMock>): void => {
  mockState = { ...mockState, ...state };
};

/**
 * Reset mock token state
 */
export const resetMockTokenState = (): void => {
  mockState = { ...defaultState };
};

/**
 * Get current mock token state
 */
export const getMockTokenState = (): TokenStorageMock => ({ ...mockState });

/**
 * Create mocked deviceStorage
 */
export const createDeviceStorageMock = () => {
  let deviceId: string | null = null;

  return {
    getDeviceId: jest.fn().mockImplementation(() => Promise.resolve(deviceId)),
    setDeviceId: jest.fn().mockImplementation((id: string) => {
      deviceId = id;
      return Promise.resolve();
    }),
    hasDeviceId: jest.fn().mockImplementation(() => Promise.resolve(deviceId !== null)),
  };
};
