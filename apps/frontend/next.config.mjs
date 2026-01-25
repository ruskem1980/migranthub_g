/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for Capacitor builds (CAPACITOR_BUILD=true)
  // Dynamic routes like /documents/[id] don't work with static export
  ...(process.env.CAPACITOR_BUILD === 'true' ? { output: 'export' } : {}),
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
