/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration:
  // - CAPACITOR_BUILD=true: static export for mobile apps
  // - Docker production: standalone for minimal image size
  // - Default: standard Next.js output
  ...(process.env.CAPACITOR_BUILD === 'true'
    ? { output: 'export' }
    : { output: 'standalone' }),
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
};

export default nextConfig;
