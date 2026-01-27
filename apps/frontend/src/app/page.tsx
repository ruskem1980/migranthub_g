import { redirect } from 'next/navigation';

/**
 * Единый поток приложения:
 * 1. Welcome (язык + акцепт) → только первый запуск
 * 2. Auth (авторизация) → только первый раз
 * 3. Profiling (профилирование) → после авторизации
 * 4. Dashboard → основное приложение
 */
export default function Home() {
  // Server-side redirect to welcome page
  redirect('/welcome');
}
