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
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.includes('run.app');
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
 * Creates a safe fallback synthetic response for offline / network failures
 */
function createSyntheticErrorResponse(errorMessage: string, status = 503): Response {
  const body = JSON.stringify({
    success: false,
    error: errorMessage,
    offline: true,
    timestamp: Date.now(),
  });
  return new Response(body, {
    status,
    statusText: 'Network / Service Unavailable',
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Fast Resilient API Fetcher: Calls relative endpoints first (works in preview, dev, and Vercel proxy), falls back to central Cloud Run
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isDirectHost = isDirectServerHost();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  try {
    const res = await fetch(cleanEndpoint, options);
    const contentType = res.headers.get('content-type') || '';

    // If local server gave valid JSON or successful API response, return it immediately
    if (res.ok && !contentType.includes('text/html')) {
      return res;
    }

    // If host returned HTML SPA fallback or 404 (e.g., static hosting without rewrite), retry with Central Cloud Run Origin
    if ((contentType.includes('text/html') || res.status === 404) && !isDirectHost && currentOrigin !== CLOUD_RUN_CENTRAL_URL) {
      const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${cleanEndpoint}`;
      return await fetch(fallbackUrl, options);
    }

    return res;
  } catch (err: any) {
    // If relative fetch failed, try central Cloud Run only if we are not already on that origin
    if (!isDirectHost && currentOrigin !== CLOUD_RUN_CENTRAL_URL) {
      try {
        const fallbackUrl = `${CLOUD_RUN_CENTRAL_URL}${cleanEndpoint}`;
        return await fetch(fallbackUrl, options);
      } catch (fallbackErr) {
        console.warn('[apiFetch] Remote fallback fetch unavailable:', fallbackErr);
        return createSyntheticErrorResponse('Network connection unavailable');
      }
    }

    // If direct server fetch temporarily failed (e.g. server restarting or offline)
    console.warn('[apiFetch] Network request temporary blip:', err?.message || err);
    return createSyntheticErrorResponse('Server is reconnecting or network is offline');
  }
}





