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
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nodejs-backend-api-16444256465.europe-west1.run.app';

// Ensure no trailing slash on API_BASE
const cleanApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanApiBase}${cleanPath}`;
}

// Global fetch interceptor on the client-side to ensure cross-origin credentials (cookies) are sent
// and relative /api paths are mapped directly to the Node.js Express backend.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    let finalInput = input;
    const newInit = { ...init };

    newInit.credentials = 'include';

    if (typeof input === 'string') {
      if (input.startsWith('/api')) {
        finalInput = `${cleanApiBase}${input}`;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api')) {
        finalInput = new URL(input.pathname + input.search, cleanApiBase);
      }
    } else if (input && typeof input === 'object' && 'url' in input) {
      const req = input as Request;
      if (req.url.startsWith('/api')) {
        finalInput = new Request(`${cleanApiBase}${req.url}`, req);
      }
    }

    return originalFetch(finalInput, newInit);
  };
}
