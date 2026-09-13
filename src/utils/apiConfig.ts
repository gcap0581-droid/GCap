// Central API Configuration and Resilient Fetch Engine

export const CLOUD_RUN_CENTRAL_URL = 'https://ais-dev-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';

export function getCentralServerOrigin(): string {
  if (typeof window === 'undefined') {
    return CLOUD_RUN_CENTRAL_URL;
  }
  const hostname = window.location.hostname || '';
  // If hosted on external static/PWA platforms like Vercel, Netlify, custom domains, route to Central Cloud Run Backend
  if (
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    hostname.includes('github.io') ||
    hostname.includes('firebaseapp.com') ||
    hostname.includes('web.app') ||
    (hostname !== 'localhost' && !hostname.includes('run.app') && !hostname.includes('google.com'))
  ) {
    return CLOUD_RUN_CENTRAL_URL;
  }
  return window.location.origin;
}

export const CENTRAL_SERVER_ORIGIN = getCentralServerOrigin();

/**
 * Returns true if running in direct Cloud Run backend or local dev server
 */
export function isDirectServerHost(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname || '';
  return hostname === 'localhost' || hostname.includes('run.app') || hostname.includes('google.com');
}

/**
 * Normalizes an API path to an absolute path targeting the central backend
 */
export function buildApiPath(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const origin = getCentralServerOrigin();
  if (typeof window !== 'undefined' && origin !== window.location.origin) {
    return `${origin}${clean}`;
  }
  return clean;
}

/**
 * Fast Resilient API Fetcher: Uses direct relative endpoints on backend, or central origin on external hosts
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const targetUrl = buildApiPath(endpoint);

  try {
    const res = await fetch(targetUrl, options);
    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('text/html') && endpoint.startsWith('/api')) {
      // If host returned HTML SPA fallback, retry with Central Cloud Run Origin
      const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      return await fetch(fallbackUrl, options);
    }

    return res;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}



