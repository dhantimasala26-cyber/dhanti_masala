import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1" || !!process.env.NEXT_PUBLIC_VERCEL_URL;

const nextConfig: NextConfig = {
  // Static export for cPanel deployment (only in production build and NOT on Vercel)
  ...(isProduction && !isVercel && {
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true, // Required for static export
    },
  }),

  // Dev only: proxy /api/* to Express backend (local or deployed)
  ...(!isProduction && {
    async rewrites() {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      return {
        fallback: [
          {
            source: "/api/:path*",
            destination: `${backendUrl}/api/:path*`,
          },
        ],
      };
    },
  }),
};

export default nextConfig;

