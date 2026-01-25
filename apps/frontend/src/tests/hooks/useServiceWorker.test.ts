import { renderHook, act, waitFor } from '@testing-library/react'
import { useServiceWorker } from '@/lib/hooks/useServiceWorker'

describe('useServiceWorker', () => {
  const mockRegistration = {
    installing: null,
    waiting: null,
    active: null,
    scope: '/',
    update: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }

  const originalNavigator = window.navigator
  const originalWindow = { ...window }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Reset navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: {
          register: jest.fn().mockResolvedValue(mockRegistration),
          ready: Promise.resolve(mockRegistration),
          controller: null,
        },
      },
      configurable: true,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  it('detects service worker support', async () => {
    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true)
    })
  })

  it('returns not supported when service worker is unavailable', () => {
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator },
      configurable: true,
    })

    const { result } = renderHook(() => useServiceWorker())

    expect(result.current.isSupported).toBe(false)
    expect(result.current.isRegistered).toBe(false)
  })

  it('registers service worker on mount', async () => {
    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true)
    })

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
    })
  })

  it('stores registration object', async () => {
    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.registration).toBe(mockRegistration)
    })
  })

  it('handles registration failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockRejectedValue(new Error('Registration failed')),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Service worker registration failed:',
        expect.any(Error)
      )
    })

    expect(result.current.isRegistered).toBe(false)

    consoleErrorSpy.mockRestore()
  })

  it('skipWaiting posts SKIP_WAITING message when waiting worker exists', async () => {
    const mockWaitingWorker = {
      postMessage: jest.fn(),
    }

    const registrationWithWaiting = {
      ...mockRegistration,
      waiting: mockWaitingWorker,
    }

    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(registrationWithWaiting),
        ready: Promise.resolve(registrationWithWaiting),
        controller: null,
      },
      configurable: true,
    })

    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true)
    })

    // Note: window.location.reload cannot be mocked in JSDOM
    // We only test that postMessage is called with correct payload
    act(() => {
      result.current.skipWaiting()
    })

    expect(mockWaitingWorker.postMessage).toHaveBeenCalledWith({
      type: 'SKIP_WAITING',
    })
  })

  it('skipWaiting does nothing when no waiting worker', async () => {
    const { result } = renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true)
    })

    // Should not throw
    act(() => {
      result.current.skipWaiting()
    })
  })

  it('sets up periodic update check', async () => {
    renderHook(() => useServiceWorker())

    await waitFor(() => {
      expect(mockRegistration.addEventListener).toHaveBeenCalledWith(
        'updatefound',
        expect.any(Function)
      )
    })

    // Fast-forward 1 hour
    act(() => {
      jest.advanceTimersByTime(60 * 60 * 1000)
    })

    expect(mockRegistration.update).toHaveBeenCalled()
  })
})
