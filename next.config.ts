import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Isolate production build output (.next-build) from live `next dev` (.next)
  // so running `next build` never deletes active dev client chunks (main-app.js).
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
};

export default nextConfig;
