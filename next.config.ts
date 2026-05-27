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

  // Dev only: proxy /api/* to local Express backend (fallback, only hits if no Next.js route matches)
  ...(!isProduction && {
    async rewrites() {
      return {
        fallback: [
          {
            source: "/api/:path*",
            destination: "http://127.0.0.1:8000/api/:path*",
          },
        ],
      };
    },
  }),
};

export default nextConfig;

