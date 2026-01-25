import { useAppStore } from '@/lib/stores/appStore';

// Mock crypto.randomUUID for consistent test results
const mockUUID = 'test-uuid-123';
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => mockUUID),
  },
});

// Initial state for reset (without actions)
const initialStateData = {
  theme: 'system' as const,
  isOnline: true,
  isAppReady: false,
  currentTab: 'home' as const,
  notifications: [] as Array<{
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>,
  unreadCount: 0,
  hasCompletedOnboarding: false,
  onboardingStep: 0,
};

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store state before each test (preserve actions)
    useAppStore.setState(initialStateData);
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState();

      expect(state.theme).toBe('system');
      expect(state.isOnline).toBe(true);
      expect(state.isAppReady).toBe(false);
      expect(state.currentTab).toBe('home');
      expect(state.notifications).toEqual([]);
      expect(state.unreadCount).toBe(0);
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.onboardingStep).toBe(0);
    });
  });

  describe('Theme', () => {
    it('should set theme to light', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('light');

      expect(useAppStore.getState().theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('dark');

      expect(useAppStore.getState().theme).toBe('dark');
    });

    it('should set theme to system', () => {
      useAppStore.setState({ theme: 'dark' });

      const { setTheme } = useAppStore.getState();
      setTheme('system');

      expect(useAppStore.getState().theme).toBe('system');
    });
  });

  describe('Online Status', () => {
    it('should set online status to false', () => {
      const { setOnline } = useAppStore.getState();

      setOnline(false);

      expect(useAppStore.getState().isOnline).toBe(false);
    });

    it('should set online status to true', () => {
      useAppStore.setState({ isOnline: false });

      const { setOnline } = useAppStore.getState();
      setOnline(true);

      expect(useAppStore.getState().isOnline).toBe(true);
    });
  });

  describe('App Ready', () => {
    it('should set app ready to true', () => {
      const { setAppReady } = useAppStore.getState();

      setAppReady(true);

      expect(useAppStore.getState().isAppReady).toBe(true);
    });
  });

  describe('Navigation Tabs', () => {
    it('should set current tab to documents', () => {
      const { setCurrentTab } = useAppStore.getState();

      setCurrentTab('documents');

      expect(useAppStore.getState().currentTab).toBe('documents');
    });

    it('should set current tab to services', () => {
      const { setCurrentTab } = useAppStore.getState();

      setCurrentTab('services');

      expect(useAppStore.getState().currentTab).toBe('services');
    });

    it('should set current tab to assistant', () => {
      const { setCurrentTab } = useAppStore.getState();

      setCurrentTab('assistant');

      expect(useAppStore.getState().currentTab).toBe('assistant');
    });

    it('should set current tab to sos', () => {
      const { setCurrentTab } = useAppStore.getState();

      setCurrentTab('sos');

      expect(useAppStore.getState().currentTab).toBe('sos');
    });
  });

  describe('Notifications', () => {
    describe('addNotification', () => {
      it('should add a notification', () => {
        const { addNotification } = useAppStore.getState();

        addNotification({
          type: 'info',
          title: 'Test Title',
          message: 'Test Message',
        });

        const state = useAppStore.getState();
        expect(state.notifications).toHaveLength(1);
        expect(state.notifications[0]).toMatchObject({
          id: mockUUID,
          type: 'info',
          title: 'Test Title',
          message: 'Test Message',
          read: false,
        });
        expect(state.notifications[0].createdAt).toBeDefined();
        expect(state.unreadCount).toBe(1);
      });

      it('should add notifications to the beginning of the list', () => {
        const { addNotification } = useAppStore.getState();

        addNotification({
          type: 'info',
          title: 'First',
          message: 'First message',
        });

        // Change mock UUID for second notification
        (global.crypto.randomUUID as jest.Mock).mockReturnValueOnce(
          'second-uuid'
        );

        addNotification({
          type: 'warning',
          title: 'Second',
          message: 'Second message',
        });

        const state = useAppStore.getState();
        expect(state.notifications).toHaveLength(2);
        expect(state.notifications[0].title).toBe('Second');
        expect(state.notifications[1].title).toBe('First');
        expect(state.unreadCount).toBe(2);
      });

      it('should handle different notification types', () => {
        const { addNotification } = useAppStore.getState();

        const types: Array<'info' | 'warning' | 'success' | 'error'> = [
          'info',
          'warning',
          'success',
          'error',
        ];

        types.forEach((type) => {
          addNotification({
            type,
            title: `${type} notification`,
            message: 'Message',
          });
        });

        const state = useAppStore.getState();
        expect(state.notifications).toHaveLength(4);
      });
    });

    describe('markNotificationRead', () => {
      it('should mark a notification as read', () => {
        useAppStore.setState({
          notifications: [
            {
              id: 'notif-1',
              type: 'info',
              title: 'Test',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        });

        const { markNotificationRead } = useAppStore.getState();
        markNotificationRead('notif-1');

        const state = useAppStore.getState();
        expect(state.notifications[0].read).toBe(true);
        expect(state.unreadCount).toBe(0);
      });

      it('should not affect other notifications', () => {
        useAppStore.setState({
          notifications: [
            {
              id: 'notif-1',
              type: 'info',
              title: 'Test 1',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'notif-2',
              type: 'info',
              title: 'Test 2',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 2,
        });

        const { markNotificationRead } = useAppStore.getState();
        markNotificationRead('notif-1');

        const state = useAppStore.getState();
        expect(state.notifications[0].read).toBe(true);
        expect(state.notifications[1].read).toBe(false);
        expect(state.unreadCount).toBe(1);
      });

      it('should not decrease unread count below 0', () => {
        useAppStore.setState({
          notifications: [
            {
              id: 'notif-1',
              type: 'info',
              title: 'Test',
              message: 'Test',
              read: true,
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 0,
        });

        const { markNotificationRead } = useAppStore.getState();
        markNotificationRead('notif-1');

        expect(useAppStore.getState().unreadCount).toBe(0);
      });
    });

    describe('markAllNotificationsRead', () => {
      it('should mark all notifications as read', () => {
        useAppStore.setState({
          notifications: [
            {
              id: 'notif-1',
              type: 'info',
              title: 'Test 1',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'notif-2',
              type: 'warning',
              title: 'Test 2',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 2,
        });

        const { markAllNotificationsRead } = useAppStore.getState();
        markAllNotificationsRead();

        const state = useAppStore.getState();
        expect(state.notifications.every((n) => n.read)).toBe(true);
        expect(state.unreadCount).toBe(0);
      });
    });

    describe('clearNotifications', () => {
      it('should clear all notifications', () => {
        useAppStore.setState({
          notifications: [
            {
              id: 'notif-1',
              type: 'info',
              title: 'Test',
              message: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        });

        const { clearNotifications } = useAppStore.getState();
        clearNotifications();

        const state = useAppStore.getState();
        expect(state.notifications).toEqual([]);
        expect(state.unreadCount).toBe(0);
      });
    });
  });

  describe('Onboarding', () => {
    describe('setOnboardingCompleted', () => {
      it('should set onboarding completed to true', () => {
        const { setOnboardingCompleted } = useAppStore.getState();

        setOnboardingCompleted(true);

        expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
      });

      it('should set onboarding completed to false', () => {
        useAppStore.setState({ hasCompletedOnboarding: true });

        const { setOnboardingCompleted } = useAppStore.getState();
        setOnboardingCompleted(false);

        expect(useAppStore.getState().hasCompletedOnboarding).toBe(false);
      });
    });

    describe('setOnboardingStep', () => {
      it('should set onboarding step', () => {
        const { setOnboardingStep } = useAppStore.getState();

        setOnboardingStep(3);

        expect(useAppStore.getState().onboardingStep).toBe(3);
      });

      it('should update onboarding step progressively', () => {
        const { setOnboardingStep } = useAppStore.getState();

        setOnboardingStep(1);
        expect(useAppStore.getState().onboardingStep).toBe(1);

        setOnboardingStep(2);
        expect(useAppStore.getState().onboardingStep).toBe(2);

        setOnboardingStep(3);
        expect(useAppStore.getState().onboardingStep).toBe(3);
      });
    });
  });

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      useAppStore.setState({
        theme: 'dark',
        isOnline: false,
        isAppReady: true,
        currentTab: 'documents',
        notifications: [
          {
            id: 'test',
            type: 'info',
            title: 'Test',
            message: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
        unreadCount: 1,
        hasCompletedOnboarding: true,
        onboardingStep: 5,
      });

      const { reset } = useAppStore.getState();
      reset();

      const state = useAppStore.getState();
      expect(state.theme).toBe('system');
      expect(state.isOnline).toBe(true);
      expect(state.isAppReady).toBe(false);
      expect(state.currentTab).toBe('home');
      expect(state.notifications).toEqual([]);
      expect(state.unreadCount).toBe(0);
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.onboardingStep).toBe(0);
    });
  });
});
