import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app lives in a subfolder whose path has a space ("Nike Task").
  // Keeping the build rooted at the app folder keeps that space out of the
  // file names Vercel deploys.
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
