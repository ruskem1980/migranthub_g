import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Note: This middleware only works in standalone mode (not static export)
// For Capacitor builds (static export), locale is determined client-side via Zustand
export default createMiddleware({
  locales,
  defaultLocale,
  // Don't use locale prefix in URL - language is stored in localStorage
  localePrefix: 'never',
});

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files
  // - Internal Next.js paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
