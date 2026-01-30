import { redirect } from 'next/navigation';

/**
 * Lazy Auth Flow:
 * - Приложение открывается сразу на dashboard
 * - Анонимные пользователи видят AnonymousDashboard
 * - Регистрация происходит только когда пользователю нужны premium-функции
 */
export default function Home() {
  // Редирект на группу (main), которая обслуживает dashboard
  redirect('/dashboard');
}
