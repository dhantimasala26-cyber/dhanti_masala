/**
 * API Base URL — reads NEXT_PUBLIC_API_URL from .env.local
 *
 * Development : NEXT_PUBLIC_API_URL=http://localhost:8000
 * Production  : NEXT_PUBLIC_API_URL=https://api.yourdomain.com
 *
 * Set the correct value in .env.local BEFORE running `npm run build`.
 *
 * Usage: fetch(apiUrl('/api/products'))
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function apiUrl(path: string): string {
  // On the browser (client-side), use relative paths to route through the Next.js API proxy.
  // This ensures the browser automatically manages same-origin cookies and avoids CORS issues.
  if (typeof window !== 'undefined') {
    return path;
  }
  // On the server-side, call the Express API directly.
  return `${API_BASE}${path}`;
}

