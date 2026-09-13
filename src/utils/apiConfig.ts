// Central API Configuration and Resilient Fetch Engine

export function getCentralServerOrigin(): string {
  if (typeof window === 'undefined') {
    return 'https://ais-dev-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';
  }
  return window.location.origin;
}

export const CENTRAL_SERVER_ORIGIN = getCentralServerOrigin();

/**
 * Returns true if running in browser or direct Cloud Run environment
 */
export function isDirectServerHost(): boolean {
  return true;
}

/**
 * Normalizes an API path to an absolute path
 */
export function buildApiPath(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return clean;
}

/**
 * Fast Resilient API Fetcher: Uses direct relative endpoints
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const relativePath = buildApiPath(endpoint);

  try {
    const res = await fetch(relativePath, options);
    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('text/html') && relativePath.startsWith('/api')) {
      // If server returned HTML SPA fallback, retry with absolute current origin
      const absoluteUrl = `${window.location.origin}${relativePath}`;
      return await fetch(absoluteUrl, options);
    }

    return res;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const fallbackUrl = `${window.location.origin}${relativePath}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}


