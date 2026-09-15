import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json sits in the parent directory, which makes
  // Next.js guess the wrong workspace root. Pin it to this project.
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      // The tools page moved to /uses. Permanent so bookmarks and any links
      // already in published content keep working.
      { source: "/tools", destination: "/uses", permanent: true },
    ];
  },
};

export default nextConfig;
