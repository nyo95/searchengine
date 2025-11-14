import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone only for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
