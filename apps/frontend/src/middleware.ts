import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Validates if a string is a valid locale
 */
function isValidLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return locales.includes(value as Locale);
}

/**
 * Gets preferred locale from various sources:
 * 1. NEXT_LOCALE cookie (highest priority - user's explicit choice)
 * 2. Accept-Language header (browser preference)
 * 3. Default locale (fallback)
 */
function getPreferredLocale(request: NextRequest): Locale {
  // 1. Check cookie first (user's explicit choice)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    // Parse Accept-Language header: "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, qValue] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0].toLowerCase(), // "ru-RU" -> "ru"
          q: qValue ? parseFloat(qValue) : 1,
        };
      })
      .sort((a, b) => b.q - a.q);

    for (const { code } of languages) {
      if (isValidLocale(code)) {
        return code;
      }
    }
  }

  // 3. Fallback to default
  return defaultLocale;
}

// Create the base next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Don't use locale prefix in URL - language is stored in localStorage/cookie
  localePrefix: 'never',
});

/**
 * Enhanced middleware that:
 * 1. Checks NEXT_LOCALE cookie for user's language preference
 * 2. Falls back to Accept-Language header
 * 3. Falls back to default locale
 *
 * Note: This middleware only works in standalone mode (not static export)
 * For Capacitor builds (static export), locale is determined client-side via Zustand
 */
export default function middleware(request: NextRequest): NextResponse {
  // Get the preferred locale
  const preferredLocale = getPreferredLocale(request);

  // Create a modified request with the locale in a header that next-intl can use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', preferredLocale);

  // Run the intl middleware with our locale hint
  const response = intlMiddleware(request);

  // If no cookie is set, set it based on detected preference
  // This helps sync the cookie for new users
  if (!request.cookies.get(LOCALE_COOKIE_NAME)?.value) {
    response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files
  // - Internal Next.js paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
