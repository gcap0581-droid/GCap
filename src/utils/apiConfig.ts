// Central API Configuration and Resilient Fetch Engine
// Connects any device, browser, Vercel deployment, or Android WebView
// to the authoritative Google Cloud Run central server.

export const CENTRAL_SERVER_ORIGIN =
  'https://ais-pre-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';

/**
 * Returns true if current environment is localhost or direct Cloud Run
 */
export function isDirectServerHost(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.includes('run.app');
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
 * Resilient API Fetcher:
 * 1. Tries standard relative /api endpoint.
 * 2. If it returns HTML (e.g. Vercel SPA static fallback rewrite) or network error,
 *    it automatically forwards the request directly to the central Cloud Run server.
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const relativePath = buildApiPath(endpoint);

  try {
    const res = await fetch(relativePath, options);
    const contentType = res.headers.get('content-type') || '';

    // If server returned an HTML file instead of JSON (common on Vercel SPA fallback),
    // switch to the authoritative central server directly.
    if (res.ok && contentType.includes('text/html') && relativePath.startsWith('/api')) {
      throw new Error('Static HTML SPA fallback intercepted API route');
    }

    return res;
  } catch (err) {
    // If not running directly on Cloud Run, failover to central Cloud Run origin directly
    if (!isDirectServerHost()) {
      const fallbackUrl = `${CENTRAL_SERVER_ORIGIN}${relativePath}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}
