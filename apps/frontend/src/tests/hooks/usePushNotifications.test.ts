import { renderHook, act, waitFor } from '@testing-library/react'
import {
  usePushNotifications,
  schedulePatentReminder,
  scheduleRegistrationReminder,
} from '@/lib/hooks/usePushNotifications'

describe('usePushNotifications', () => {
  const mockSubscription = {
    endpoint: 'https://push.example.com/123',
    unsubscribe: jest.fn().mockResolvedValue(true),
  }

  const mockPushManager = {
    getSubscription: jest.fn().mockResolvedValue(null),
    subscribe: jest.fn().mockResolvedValue(mockSubscription),
  }

  const mockRegistration = {
    pushManager: mockPushManager,
    showNotification: jest.fn().mockResolvedValue(undefined),
  }

  const originalWindow = { ...window }
  const originalNavigator = window.navigator

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Notification API
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: jest.fn().mockResolvedValue('granted'),
      },
      configurable: true,
    })

    // Mock service worker
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: {
          ready: Promise.resolve(mockRegistration),
        },
      },
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  describe('initialization', () => {
    it('detects notification support', async () => {
      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })
    })

    it('returns not supported when Notification API unavailable', async () => {
      // @ts-expect-error - removing Notification for test
      delete window.Notification

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(false)
      })
    })

    it('returns current permission status', async () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        configurable: true,
      })

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })
    })
  })

  describe('requestPermission', () => {
    it('requests notification permission', async () => {
      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })

      let granted: boolean | undefined
      await act(async () => {
        granted = await result.current.requestPermission()
      })

      expect(Notification.requestPermission).toHaveBeenCalled()
      expect(granted).toBe(true)
      expect(result.current.permission).toBe('granted')
    })

    it('returns false when permission denied', async () => {
      ;(Notification.requestPermission as jest.Mock).mockResolvedValue('denied')

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })

      let granted: boolean | undefined
      await act(async () => {
        granted = await result.current.requestPermission()
      })

      expect(granted).toBe(false)
      expect(result.current.permission).toBe('denied')
    })

    it('returns false when not supported', async () => {
      // @ts-expect-error - removing Notification for test
      delete window.Notification

      const { result } = renderHook(() => usePushNotifications())

      let granted: boolean | undefined
      await act(async () => {
        granted = await result.current.requestPermission()
      })

      expect(granted).toBe(false)
    })

    it('handles permission request error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(Notification.requestPermission as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      )

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })

      let granted: boolean | undefined
      await act(async () => {
        granted = await result.current.requestPermission()
      })

      expect(granted).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('subscribe', () => {
    it('subscribes to push notifications when permission granted', async () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        configurable: true,
      })

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      let subscription
      await act(async () => {
        subscription = await result.current.subscribe()
      })

      expect(subscription).toBe(mockSubscription)
      expect(result.current.isSubscribed).toBe(true)
    })

    it('returns null when permission not granted', async () => {
      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })

      let subscription
      await act(async () => {
        subscription = await result.current.subscribe()
      })

      expect(subscription).toBeNull()
    })

    it('uses existing subscription if available', async () => {
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription)

      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        configurable: true,
      })

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      await act(async () => {
        await result.current.subscribe()
      })

      expect(mockPushManager.subscribe).not.toHaveBeenCalled()
      expect(result.current.isSubscribed).toBe(true)
    })
  })

  describe('unsubscribe', () => {
    it('unsubscribes from push notifications', async () => {
      mockPushManager.getSubscription.mockResolvedValue(mockSubscription)

      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        configurable: true,
      })

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      // First subscribe
      await act(async () => {
        await result.current.subscribe()
      })

      expect(result.current.isSubscribed).toBe(true)

      // Then unsubscribe
      let success: boolean | undefined
      await act(async () => {
        success = await result.current.unsubscribe()
      })

      expect(success).toBe(true)
      expect(result.current.isSubscribed).toBe(false)
    })
  })

  describe('showLocalNotification', () => {
    it('shows notification when permission granted', async () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        configurable: true,
      })

      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      await act(async () => {
        await result.current.showLocalNotification('Test Title', {
          body: 'Test body',
        })
      })

      expect(mockRegistration.showNotification).toHaveBeenCalledWith('Test Title', {
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        body: 'Test body',
      })
    })

    it('does not show notification when permission not granted', async () => {
      const { result } = renderHook(() => usePushNotifications())

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true)
      })

      await act(async () => {
        await result.current.showLocalNotification('Test', {})
      })

      expect(mockRegistration.showNotification).not.toHaveBeenCalled()
    })
  })
})

describe('schedulePatentReminder', () => {
  it('creates reminder 7 days before expiry', () => {
    const expiryDate = new Date('2024-03-15')
    const reminder = schedulePatentReminder(expiryDate)

    expect(reminder.type).toBe('patent_expiry')
    expect(reminder.title).toBe('Срок патента истекает')
    expect(reminder.scheduledFor?.getDate()).toBe(8) // March 8
    expect(reminder.id).toContain('patent-reminder-')
  })
})

describe('scheduleRegistrationReminder', () => {
  it('creates reminder 3 days before expiry', () => {
    const expiryDate = new Date('2024-03-15')
    const reminder = scheduleRegistrationReminder(expiryDate)

    expect(reminder.type).toBe('registration_expiry')
    expect(reminder.title).toBe('Срок регистрации истекает')
    expect(reminder.scheduledFor?.getDate()).toBe(12) // March 12
    expect(reminder.id).toContain('registration-reminder-')
  })
})
