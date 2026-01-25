import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { webcrypto } from 'crypto'

// Полифилы для Web APIs в Node.js/jsdom
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder })
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder })
Object.defineProperty(globalThis, 'crypto', { value: webcrypto })

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
