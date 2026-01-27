'use client';

export type DeepLinkRoute =
  | 'home'
  | 'documents'
  | 'calculator'
  | 'profile'
  | 'settings'
  | 'services'
  | 'reference'
  | 'recovery';

export interface ParsedDeepLink {
  route: DeepLinkRoute | null;
  params: Record<string, string>;
  raw: string;
}

const SCHEME = 'migranthub';

const ROUTE_MAP: Record<string, DeepLinkRoute> = {
  home: 'home',
  documents: 'documents',
  calculator: 'calculator',
  profile: 'profile',
  settings: 'settings',
  services: 'services',
  reference: 'reference',
  recovery: 'recovery',
};

const ROUTE_TO_PATH: Record<DeepLinkRoute, string> = {
  home: '/',
  documents: '/documents',
  calculator: '/calculator',
  profile: '/profile',
  settings: '/settings',
  services: '/services',
  reference: '/reference',
  recovery: '/auth/recovery',
};

export function parseDeepLink(url: string): ParsedDeepLink {
  const result: ParsedDeepLink = {
    route: null,
    params: {},
    raw: url,
  };

  try {
    // Handle migranthub://route or migranthub://route?param=value
    if (!url.startsWith(`${SCHEME}://`)) {
      return result;
    }

    const withoutScheme = url.replace(`${SCHEME}://`, '');
    const [pathPart, queryPart] = withoutScheme.split('?');

    // Extract route and path segments
    const pathSegments = pathPart.split('/').filter(Boolean);
    const routeKey = pathSegments[0]?.toLowerCase();
    result.route = ROUTE_MAP[routeKey] || null;

    // Extract path params (e.g., documents/{id})
    if (pathSegments.length > 1) {
      result.params.id = pathSegments[1];
    }

    // Extract query params
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((value, key) => {
        result.params[key] = value;
      });
    }
  } catch (error) {
    console.error('[DeepLinks] Parse error:', error);
  }

  return result;
}

export function getPathForRoute(route: DeepLinkRoute): string {
  return ROUTE_TO_PATH[route] || '/';
}

export function navigate(parsed: ParsedDeepLink): void {
  if (!parsed.route) {
    console.warn('[DeepLinks] No valid route to navigate');
    return;
  }

  const path = getPathForRoute(parsed.route);

  // Build URL with params
  const queryString = Object.keys(parsed.params).length > 0
    ? '?' + new URLSearchParams(parsed.params).toString()
    : '';

  const fullPath = path + queryString;

  // Use Next.js router if available, otherwise fallback to window.location
  if (typeof window !== 'undefined') {
    // Check if we're in a browser environment
    window.location.href = fullPath;
  }
}

export function createDeepLink(route: DeepLinkRoute, params?: Record<string, string>): string {
  let url = `${SCHEME}://${route}`;

  if (params && Object.keys(params).length > 0) {
    url += '?' + new URLSearchParams(params).toString();
  }

  return url;
}

export const DeepLinks = {
  parse: parseDeepLink,
  navigate,
  getPathForRoute,
  createDeepLink,
  SCHEME,
  ROUTES: Object.keys(ROUTE_MAP) as DeepLinkRoute[],
};
