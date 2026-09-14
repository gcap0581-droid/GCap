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
  return host === 'localhost' || host === '127.0.0.1';
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
 * Fast Resilient API Fetcher: In local/preview dev server, calls Express backend.
 * On static hosts (like Vercel, Android app), immediately falls back to direct Firestore.
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isDirectHost = isDirectServerHost();

  // If running on external / static host like Vercel, immediately yield to direct Firestore bridge
  if (!isDirectHost) {
    return createSyntheticErrorResponse('External host: using direct Firestore bridge', 503);
  }

  try {
    const res = await fetch(cleanEndpoint, options);
    const contentType = res.headers.get('content-type') || '';

    // If local server gave valid JSON or successful API response, return it immediately
    if (res.ok && !contentType.includes('text/html')) {
      return res;
    }

    return createSyntheticErrorResponse('Local server returned HTML or error', 502);
  } catch (err: any) {
    console.warn('[apiFetch] Dev server request error:', err?.message || err);
    return createSyntheticErrorResponse('Server is reconnecting or offline', 503);
  }
}





