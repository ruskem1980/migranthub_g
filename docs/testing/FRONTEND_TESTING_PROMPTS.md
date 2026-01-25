# Frontend Testing - Промпты для подзадач

## Обзор

| # | Подзадача | Файлов | Строк | Зависит от | Параллельно с |
|---|-----------|--------|-------|------------|---------------|
| 1 | Настройка Jest | 4 | ~100 | — | — |
| 2 | Тесты UI | 5-8 | ~200 | П1 | П3, П4, П5, П6 |
| 3 | Тесты Stores | 5 | ~150 | П1 | П2, П4, П5, П6 |
| 4 | Тесты Hooks | 3-5 | ~120 | П1 | П2, П3, П5, П6 |
| 5 | Тесты Utils/Crypto | 4 | ~100 | П1 | П2, П3, П4, П6 |
| 6 | Тесты API | 4 | ~150 | П1 | П2, П3, П4, П5 |

## Схема зависимостей

```
[Подзадача 1: Настройка Jest]
            │
            ▼
    ┌───────┴───────┬───────────┬───────────┬───────────┐
    ▼               ▼           ▼           ▼           ▼
[П2: UI]      [П3: Stores]  [П4: Hooks]  [П5: Utils]  [П6: API]
(параллельно)  (параллельно) (параллельно) (параллельно) (параллельно)
```

---

## Подзадача 1: Настройка Jest (БЛОКИРУЮЩАЯ)

**Зависимости:** нет
**Блокирует:** все остальные подзадачи

```
## Задача: Настройка Jest + React Testing Library

## Контекст
- Проект: apps/frontend (Next.js 14 + React 18 + TypeScript)
- State: Zustand + TanStack Query
- Тестирование НЕ настроено (0 тестов, 0 конфигов)
- Backend использует Jest — нужна консистентность

## Цель
Настроить тестовое окружение так, чтобы команда `npm run test` работала

## Шаги

### 1. Установить зависимости
```bash
cd apps/frontend
npm install -D jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 2. Создать файл jest.config.js
```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### 3. Создать файл jest.setup.ts
```ts
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
```

### 4. Обновить package.json — добавить скрипты
В секцию "scripts" добавить:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

### 5. Создать простой тест для проверки настройки
Создать файл src/__tests__/setup.test.ts:
```ts
describe('Jest Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })
})
```

## Файлы для создания/изменения
- apps/frontend/jest.config.js (создать)
- apps/frontend/jest.setup.ts (создать)
- apps/frontend/package.json (изменить scripts)
- apps/frontend/src/__tests__/setup.test.ts (создать)

## Критерии готовности
- [ ] npm install завершился без ошибок
- [ ] npm run test запускается и находит тесты
- [ ] Тест setup.test.ts проходит
- [ ] Нет ошибок конфигурации

## После завершения
```bash
cd apps/frontend && npm run test
```
Должен вывести: "1 passed"
```

---

## Подзадача 2: Тесты UI компонентов (ПАРАЛЛЕЛЬНАЯ)

**Зависимости:** Подзадача 1
**Можно запускать параллельно с:** П3, П4, П5, П6

```
## Задача: Тесты для UI компонентов

## Контекст
- Jest настроен и работает
- UI компоненты находятся в src/components/ui/
- Используется Tailwind CSS + class-variance-authority

## Цель
Написать unit-тесты для всех базовых UI компонентов

## Шаги

### 1. Прочитать и понять структуру компонентов
Изучить файлы в src/components/ui/:
- button.tsx
- input.tsx
- card.tsx
- label.tsx
- и другие

### 2. Создать тесты для Button
Файл: src/__tests__/components/ui/button.test.tsx
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 3. Создать тесты для Input
Файл: src/__tests__/components/ui/input.test.tsx
- Рендеринг с placeholder
- Ввод текста
- Обработка onChange
- Состояние disabled

### 4. Создать тесты для Card
Файл: src/__tests__/components/ui/card.test.tsx
- Рендеринг Card, CardHeader, CardContent, CardFooter
- Проверка вложенности

### 5. Создать тесты для остальных компонентов
По аналогии для: Label, Badge, Skeleton, Progress и др.

## Файлы для создания
- src/__tests__/components/ui/button.test.tsx
- src/__tests__/components/ui/input.test.tsx
- src/__tests__/components/ui/card.test.tsx
- src/__tests__/components/ui/label.test.tsx
- src/__tests__/components/ui/index.test.tsx (общий экспорт)

## Критерии готовности
- [ ] Все UI компоненты имеют тесты
- [ ] Тесты проверяют рендеринг, props, события
- [ ] Все тесты проходят
- [ ] Нет console warnings

## После завершения
```bash
npm run test -- --testPathPattern="components/ui"
```
```

---

## Подзадача 3: Тесты Zustand Stores (ПАРАЛЛЕЛЬНАЯ)

**Зависимости:** Подзадача 1
**Можно запускать параллельно с:** П2, П4, П5, П6

```
## Задача: Тесты для Zustand stores

## Контекст
- Jest настроен
- Stores находятся в src/lib/stores/
- Используется Zustand 5 с persist middleware

## Цель
Написать тесты для всех Zustand stores

## Шаги

### 1. Изучить структуру stores
Прочитать файлы:
- src/lib/stores/auth-store.ts
- src/lib/stores/device-store.ts
- src/lib/stores/onboarding-store.ts
- src/lib/stores/settings-store.ts

### 2. Создать хелпер для тестирования stores
Файл: src/__tests__/helpers/store-helper.ts
```ts
import { act } from '@testing-library/react'

// Сброс store между тестами
export const resetStore = (useStore: any) => {
  const initialState = useStore.getState()
  useStore.setState(initialState, true)
}
```

### 3. Тесты для auth-store
Файл: src/__tests__/stores/auth-store.test.ts
```ts
import { useAuthStore } from '@/lib/stores/auth-store'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, deviceId: null })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should authenticate device', () => {
    const { setDeviceAuth } = useAuthStore.getState()
    setDeviceAuth('device-123', 'token-abc')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.deviceId).toBe('device-123')
  })

  it('should logout', () => {
    useAuthStore.setState({ isAuthenticated: true, deviceId: 'test' })
    const { logout } = useAuthStore.getState()
    logout()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
```

### 4. Тесты для device-store
- Сохранение информации об устройстве
- Генерация device fingerprint
- Persist в localStorage

### 5. Тесты для onboarding-store
- Шаги онбординга
- Прогресс
- Завершение онбординга

### 6. Тесты для settings-store
- Язык интерфейса
- Тема (light/dark)
- Уведомления

## Файлы для создания
- src/__tests__/stores/auth-store.test.ts
- src/__tests__/stores/device-store.test.ts
- src/__tests__/stores/onboarding-store.test.ts
- src/__tests__/stores/settings-store.test.ts
- src/__tests__/helpers/store-helper.ts

## Критерии готовности
- [ ] Все stores имеют тесты
- [ ] Тесты проверяют initial state, actions, selectors
- [ ] Тесты изолированы (state сбрасывается)
- [ ] Все тесты проходят

## После завершения
```bash
npm run test -- --testPathPattern="stores"
```
```

---

## Подзадача 4: Тесты React Hooks (ПАРАЛЛЕЛЬНАЯ)

**Зависимости:** Подзадача 1
**Можно запускать параллельно с:** П2, П3, П5, П6

```
## Задача: Тесты для кастомных React hooks

## Контекст
- Jest настроен
- Hooks находятся в src/lib/hooks/
- Требуется @testing-library/react для renderHook

## Цель
Написать тесты для всех кастомных hooks

## Шаги

### 1. Изучить hooks
Прочитать файлы в src/lib/hooks/:
- useOfflineStatus.ts
- useMediaQuery.ts
- usePushNotifications.ts
- и другие

### 2. Тесты для useOfflineStatus
Файл: src/__tests__/hooks/useOfflineStatus.test.ts
```ts
import { renderHook, act } from '@testing-library/react'
import { useOfflineStatus } from '@/lib/hooks/useOfflineStatus'

describe('useOfflineStatus', () => {
  const originalNavigator = window.navigator

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: true },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('returns online status', () => {
    const { result } = renderHook(() => useOfflineStatus())
    expect(result.current.isOffline).toBe(false)
  })

  it('detects offline', () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false })
    const { result } = renderHook(() => useOfflineStatus())
    expect(result.current.isOffline).toBe(true)
  })

  it('responds to online/offline events', () => {
    const { result } = renderHook(() => useOfflineStatus())

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOffline).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current.isOffline).toBe(false)
  })
})
```

### 3. Тесты для useMediaQuery
- Проверка media query matching
- Мок window.matchMedia

### 4. Тесты для usePushNotifications
- Мок Notification API
- Проверка permission request
- Обработка push токена

### 5. Тесты для других hooks
По аналогии для всех найденных hooks

## Файлы для создания
- src/__tests__/hooks/useOfflineStatus.test.ts
- src/__tests__/hooks/useMediaQuery.test.ts
- src/__tests__/hooks/usePushNotifications.test.ts

## Критерии готовности
- [ ] Все hooks имеют тесты
- [ ] Browser APIs замоканы корректно
- [ ] Тесты проверяют все состояния
- [ ] Все тесты проходят

## После завершения
```bash
npm run test -- --testPathPattern="hooks"
```
```

---

## Подзадача 5: Тесты утилит и crypto (ПАРАЛЛЕЛЬНАЯ)

**Зависимости:** Подзадача 1
**Можно запускать параллельно с:** П2, П3, П4, П6

```
## Задача: Тесты для утилит и криптографии

## Контекст
- Jest настроен
- Утилиты в src/lib/utils.ts
- Crypto в src/lib/crypto/

## Цель
Написать unit-тесты для всех утилит и crypto функций

## Шаги

### 1. Изучить утилиты
Прочитать:
- src/lib/utils.ts (cn, форматирование и др.)
- src/lib/crypto/ (шифрование, хеширование)

### 2. Тесты для utils.ts
Файл: src/__tests__/lib/utils.test.ts
```ts
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (classnames)', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
  })
})
```

### 3. Тесты для crypto функций
Файл: src/__tests__/lib/crypto/encryption.test.ts
```ts
import { encrypt, decrypt, generateKey } from '@/lib/crypto'

describe('Crypto', () => {
  // Мок для Web Crypto API
  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          generateKey: jest.fn(),
          encrypt: jest.fn(),
          decrypt: jest.fn(),
        },
        getRandomValues: jest.fn((arr) => arr),
      },
    })
  })

  it('generates encryption key', async () => {
    const key = await generateKey()
    expect(key).toBeDefined()
  })

  it('encrypts and decrypts data', async () => {
    const data = 'secret message'
    const key = await generateKey()
    const encrypted = await encrypt(data, key)
    const decrypted = await decrypt(encrypted, key)
    expect(decrypted).toBe(data)
  })
})
```

### 4. Тесты для device fingerprint
- Генерация fingerprint
- Консистентность результата

### 5. Тесты для форматирования
- Даты
- Числа
- Валюты (если есть)

## Файлы для создания
- src/__tests__/lib/utils.test.ts
- src/__tests__/lib/crypto/encryption.test.ts
- src/__tests__/lib/crypto/hashing.test.ts
- src/__tests__/lib/crypto/fingerprint.test.ts

## Критерии готовности
- [ ] Все утилиты покрыты тестами
- [ ] Crypto API замокан
- [ ] Edge cases протестированы
- [ ] Все тесты проходят

## После завершения
```bash
npm run test -- --testPathPattern="lib/(utils|crypto)"
```
```

---

## Подзадача 6: Тесты API клиента (ПАРАЛЛЕЛЬНАЯ)

**Зависимости:** Подзадача 1
**Можно запускать параллельно с:** П2, П3, П4, П5

```
## Задача: Тесты для API клиента и TanStack Query

## Контекст
- Jest настроен
- API клиент в src/lib/api/
- Используется TanStack Query v5
- Нужны моки для fetch/axios

## Цель
Написать тесты для API клиента и query hooks

## Шаги

### 1. Изучить API структуру
Прочитать:
- src/lib/api/client.ts
- src/lib/api/queries/ (если есть)
- src/lib/api/mutations/ (если есть)

### 2. Создать мок-сервер
Файл: src/__tests__/mocks/server.ts
```ts
// Простой мок для fetch
export const mockFetch = (data: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    })
  ) as jest.Mock
}

export const mockFetchError = (error: string) => {
  global.fetch = jest.fn(() => Promise.reject(new Error(error))) as jest.Mock
}
```

### 3. Тесты для API клиента
Файл: src/__tests__/lib/api/client.test.ts
```ts
import { apiClient } from '@/lib/api/client'
import { mockFetch, mockFetchError } from '../../mocks/server'

describe('API Client', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('makes GET requests', async () => {
    mockFetch({ data: 'test' })
    const result = await apiClient.get('/test')
    expect(result).toEqual({ data: 'test' })
  })

  it('makes POST requests with body', async () => {
    mockFetch({ success: true })
    const result = await apiClient.post('/test', { foo: 'bar' })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ foo: 'bar' }),
      })
    )
  })

  it('handles errors', async () => {
    mockFetchError('Network error')
    await expect(apiClient.get('/test')).rejects.toThrow('Network error')
  })

  it('adds auth headers', async () => {
    mockFetch({})
    await apiClient.get('/test', { auth: true })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    )
  })
})
```

### 4. Тесты для Query hooks (с QueryClientProvider)
Файл: src/__tests__/lib/api/queries.test.tsx
```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserQuery } from '@/lib/api/queries/user'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Query Hooks', () => {
  it('fetches user data', async () => {
    mockFetch({ id: 1, name: 'Test' })
    const { result } = renderHook(() => useUserQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ id: 1, name: 'Test' })
  })
})
```

### 5. Тесты для Mutation hooks
По аналогии с queries

## Файлы для создания
- src/__tests__/mocks/server.ts
- src/__tests__/lib/api/client.test.ts
- src/__tests__/lib/api/queries.test.tsx
- src/__tests__/lib/api/mutations.test.tsx

## Критерии готовности
- [ ] API клиент полностью протестирован
- [ ] Fetch замокан корректно
- [ ] Query/Mutation hooks тестируются с провайдером
- [ ] Обработка ошибок протестирована
- [ ] Все тесты проходят

## После завершения
```bash
npm run test -- --testPathPattern="api"
```
```

---

## Порядок выполнения

```
Шаг 1: Запустить П1 (настройка Jest)
        ↓
Шаг 2: Дождаться завершения П1
        ↓
Шаг 3: Запустить П2, П3, П4, П5, П6 ПАРАЛЛЕЛЬНО (5 агентов)
        ↓
Шаг 4: Дождаться всех, сделать git commit
```
