import withPWAInit from '@ducanh2912/next-pwa';

// await import("./src/env.mjs");

const withPWA = withPWAInit({
  dest: 'public',
  cacheStartUrl: false,
  // Disabled by default in dev so we do not have cache issues.
  // disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/PokeAPI/sprites/master/sprites/**',
      },
    ],
  },
});

export default nextConfig;
