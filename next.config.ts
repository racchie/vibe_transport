import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Explicitly set workspace root to silence multiple lockfile warning
    root: process.cwd(),
  },
};

export default nextConfig;
