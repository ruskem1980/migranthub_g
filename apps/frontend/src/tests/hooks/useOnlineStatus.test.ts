import { renderHook, act } from '@testing-library/react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useAppStore } from '@/lib/stores'

// Mock the store
jest.mock('@/lib/stores', () => ({
  useAppStore: jest.fn(),
}))

describe('useOnlineStatus', () => {
  const mockSetOnline = jest.fn()
  const originalNavigator = window.navigator

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock navigator.onLine
    Object.defineProperty(window, 'navigator', {
      value: { onLine: true },
      configurable: true,
    })

    // Mock store selector
    ;(useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ setOnline: mockSetOnline })
      }
      return mockSetOnline
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  it('returns true when browser is online', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it('returns false when browser is offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it('updates store with initial online status', () => {
    renderHook(() => useOnlineStatus())
    expect(mockSetOnline).toHaveBeenCalledWith(true)
  })

  it('responds to offline event', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
    expect(mockSetOnline).toHaveBeenCalledWith(false)
  })

  it('responds to online event', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        configurable: true,
      })
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
    expect(mockSetOnline).toHaveBeenCalledWith(true)
  })

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useOnlineStatus())

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})
