import '@testing-library/jest-dom'

// Мок для next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Мок для IndexedDB (Dexie)
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
}
Object.defineProperty(window, 'indexedDB', { value: indexedDB })
