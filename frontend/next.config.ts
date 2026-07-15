import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: this machine has an unrelated package-lock.json
  // sitting at C:\Users\ADELAKUN OLUWATOSIN\, which Next.js otherwise
  // mis-detects as the monorepo root (known environmental quirk).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
