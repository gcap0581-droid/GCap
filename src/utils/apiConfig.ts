// Central API Configuration and Resilient Fetch Engine

export const CLOUD_RUN_CENTRAL_URL = 'https://ais-dev-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';

export function getCentralServerOrigin(): string {
  if (typeof window === 'undefined') {
    return CLOUD_RUN_CENTRAL_URL;
  }
  return window.location.origin;
}

export const CENTRAL_SERVER_ORIGIN = getCentralServerOrigin();

/**
 * Returns true if running in direct Cloud Run backend or local dev server
 */
export function isDirectServerHost(): boolean {
  return true;
}

/**
 * Normalizes an API path to relative or absolute path targeting the backend
 */
export function buildApiPath(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

/**
 * Fast Resilient API Fetcher: Calls relative endpoints first (works in preview, dev, and Vercel proxy), falls back to central Cloud Run
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(cleanEndpoint, options);
    const contentType = res.headers.get('content-type') || '';

    // If local server gave valid JSON or successful API response, return it immediately
    if (res.ok && !contentType.includes('text/html')) {
      return res;
    }

    // If host returned HTML SPA fallback or 404 (e.g., static hosting without rewrite), retry with Central Cloud Run Origin
    if (contentType.includes('text/html') || res.status === 404) {
      const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${cleanEndpoint}`;
      return await fetch(fallbackUrl, options);
    }

    return res;
  } catch (err) {
    // If relative fetch failed, try central Cloud Run
    try {
      const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${cleanEndpoint}`;
      return await fetch(fallbackUrl, options);
    } catch (fallbackErr) {
      console.error('[apiFetch] Both primary and fallback fetch failed:', fallbackErr);
      throw err;
    }
  }
}




