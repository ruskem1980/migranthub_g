import { useAuthStore } from '@/lib/stores/authStore';
import type { ApiUser } from '@/lib/api/types';

// Mock user for testing
const mockUser: ApiUser = {
  id: 'user-123',
  citizenshipCode: 'UZ',
  regionCode: 'moscow',
  entryDate: '2024-01-15',
  subscriptionType: 'free',
  subscriptionExpiresAt: null,
  settings: {
    locale: 'ru',
    timezone: 'Europe/Moscow',
    notifications: {
      push: true,
      telegram: false,
      deadlines: true,
      news: false,
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Initial state for reset (without actions)
const initialStateData = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  _hasHydrated: false,
};

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test (preserve actions)
    useAuthStore.setState(initialStateData);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and authenticate', () => {
      const { setUser } = useAuthStore.getState();

      setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should clear user when set to null', () => {
      // First set a user
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });

      const { setUser } = useAuthStore.getState();
      setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear error when setting user', () => {
      useAuthStore.setState({ error: 'Some error' });

      const { setUser } = useAuthStore.getState();
      setUser(mockUser);

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      useAuthStore.setState({ isLoading: true });

      const { setLoading } = useAuthStore.getState();
      setLoading(false);

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setInitialized', () => {
    it('should set initialized state', () => {
      const { setInitialized } = useAuthStore.getState();

      setInitialized(true);

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and clear loading', () => {
      useAuthStore.setState({ isLoading: true });

      const { setError } = useAuthStore.getState();
      setError('Authentication failed');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Authentication failed');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error when set to null', () => {
      useAuthStore.setState({ error: 'Previous error' });

      const { setError } = useAuthStore.getState();
      setError(null);

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('logout', () => {
    it('should reset to initial state but keep initialized and hydrated', () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
        _hasHydrated: true,
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.error).toBeNull();
      expect(state._hasHydrated).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state but keep hydrated', () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: true,
        isInitialized: true,
        error: 'Error',
        _hasHydrated: true,
      });

      const { reset } = useAuthStore.getState();
      reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.error).toBeNull();
      expect(state._hasHydrated).toBe(true);
    });
  });

  describe('setHasHydrated', () => {
    it('should set hydration state', () => {
      const { setHasHydrated } = useAuthStore.getState();

      setHasHydrated(true);

      expect(useAuthStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe('Selectors', () => {
    it('should select user correctly', () => {
      useAuthStore.setState({ user: mockUser });

      const user = useAuthStore.getState().user;
      expect(user?.id).toBe('user-123');
    });

    it('should select isAuthenticated correctly', () => {
      useAuthStore.setState({ isAuthenticated: true });

      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      expect(isAuthenticated).toBe(true);
    });
  });
});
