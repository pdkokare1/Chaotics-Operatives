// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@operative/shared"], // Critical for monorepo
  // Force Build ID: 1 (This comment forces Vercel to clear cache)
};

module.exports = nextConfig;
