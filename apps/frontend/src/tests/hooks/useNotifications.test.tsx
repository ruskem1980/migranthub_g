import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  NotificationProvider,
  useNotifications,
  useNotificationsOptional,
} from '@/lib/hooks/useNotifications'

// Mock the notifications module
jest.mock('@/lib/notifications', () => ({
  requestPermissions: jest.fn().mockResolvedValue({ display: 'granted' }),
  checkPermissions: jest.fn().mockResolvedValue({ display: 'default' }),
  addNotificationClickListener: jest.fn().mockReturnValue(jest.fn()),
  scheduleDocumentReminders: jest.fn().mockResolvedValue(undefined),
  cancelDocumentReminders: jest.fn().mockResolvedValue(undefined),
  rescheduleAllReminders: jest.fn().mockResolvedValue(undefined),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

import {
  requestPermissions,
  checkPermissions,
  addNotificationClickListener,
  scheduleDocumentReminders,
  cancelDocumentReminders,
  rescheduleAllReminders,
} from '@/lib/notifications'

describe('NotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with unknown permission state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    )

    const { result } = renderHook(() => useNotifications(), { wrapper })

    // Initially permission is 'unknown'
    expect(result.current.permission).toBe('unknown')
    expect(result.current.isInitialized).toBe(false)
  })

  it('checks permissions on mount and updates state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    )

    const { result } = renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true)
    })

    expect(checkPermissions).toHaveBeenCalled()
    expect(result.current.permission).toBe('default')
  })

  it('registers click listener on mount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    )

    renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(addNotificationClickListener).toHaveBeenCalled()
    })
  })

  it('unsubscribes click listener on unmount', async () => {
    const mockUnsubscribe = jest.fn()
    ;(addNotificationClickListener as jest.Mock).mockReturnValue(mockUnsubscribe)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    )

    const { unmount } = renderHook(() => useNotifications(), { wrapper })

    await waitFor(() => {
      expect(addNotificationClickListener).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    ;(checkPermissions as jest.Mock).mockResolvedValue({ display: 'default' })
    ;(requestPermissions as jest.Mock).mockResolvedValue({ display: 'granted' })
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      renderHook(() => useNotifications())
    }).toThrow('useNotifications must be used within NotificationProvider')

    consoleSpy.mockRestore()
  })

  describe('requestPermission', () => {
    it('calls requestPermissions function when invoked', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      // Verify initial state
      expect(result.current.permission).toBe('default')

      await act(async () => {
        await result.current.requestPermission()
      })

      // Verify the function was called
      expect(requestPermissions).toHaveBeenCalled()
    })
  })

  describe('scheduleForDocument', () => {
    it('schedules reminders when permission granted', async () => {
      ;(checkPermissions as jest.Mock).mockResolvedValue({ display: 'granted' })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      const mockDoc = {
        id: 'doc-1',
        type: 'patent',
        data: {},
      }

      await act(async () => {
        await result.current.scheduleForDocument(mockDoc as any)
      })

      expect(scheduleDocumentReminders).toHaveBeenCalledWith(mockDoc)
    })

    it('does not schedule when permission not granted', async () => {
      ;(checkPermissions as jest.Mock).mockResolvedValue({ display: 'denied' })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.permission).toBe('denied')
      })

      const mockDoc = { id: 'doc-1', type: 'patent', data: {} }

      await act(async () => {
        await result.current.scheduleForDocument(mockDoc as any)
      })

      expect(scheduleDocumentReminders).not.toHaveBeenCalled()
    })
  })

  describe('cancelForDocument', () => {
    it('cancels reminders for document', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      await act(async () => {
        await result.current.cancelForDocument('doc-123')
      })

      expect(cancelDocumentReminders).toHaveBeenCalledWith('doc-123')
    })
  })

  describe('rescheduleAll', () => {
    it('reschedules all reminders when permission granted', async () => {
      ;(checkPermissions as jest.Mock).mockResolvedValue({ display: 'granted' })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.permission).toBe('granted')
      })

      const mockDocs = [
        { id: 'doc-1', type: 'patent', data: {} },
        { id: 'doc-2', type: 'registration', data: {} },
      ]

      await act(async () => {
        await result.current.rescheduleAll(mockDocs as any)
      })

      expect(rescheduleAllReminders).toHaveBeenCalledWith(mockDocs)
    })

    it('does not reschedule when permission not granted', async () => {
      ;(checkPermissions as jest.Mock).mockResolvedValue({ display: 'default' })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
      )

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.permission).toBe('default')
      })

      await act(async () => {
        await result.current.rescheduleAll([])
      })

      expect(rescheduleAllReminders).not.toHaveBeenCalled()
    })
  })
})

describe('useNotificationsOptional', () => {
  it('returns null when used outside provider', () => {
    const { result } = renderHook(() => useNotificationsOptional())
    expect(result.current).toBeNull()
  })

  it('returns context when used inside provider', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    )

    const { result } = renderHook(() => useNotificationsOptional(), { wrapper })

    expect(result.current).not.toBeNull()
    expect(result.current?.permission).toBeDefined()
  })
})
