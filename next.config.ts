import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep automated browser runs isolated from an already-running local dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
