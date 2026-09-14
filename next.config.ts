import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json sits in the parent directory, which makes
  // Next.js guess the wrong workspace root. Pin it to this project.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
