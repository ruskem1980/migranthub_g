import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration:
  // - CAPACITOR_BUILD=true: static export for mobile apps
  // - STANDALONE_BUILD=true: standalone for Docker production
  // - Default (dev): no output setting for fast HMR
  ...(process.env.CAPACITOR_BUILD === 'true'
    ? { output: 'export' }
    : process.env.STANDALONE_BUILD === 'true'
      ? { output: 'standalone' }
      : {}),
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable Fast Refresh for development
  // Note: reactStrictMode causes double renders in dev which can expose issues
  reactStrictMode: false,

  // Webpack configuration for better HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable faster refresh
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 5,
        ignored: ['**/node_modules', '**/.git'],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
