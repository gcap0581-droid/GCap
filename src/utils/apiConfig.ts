// Central API Configuration and Resilient Fetch Engine

export const CLOUD_RUN_DEV_URL = 'https://ais-dev-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';
export const CLOUD_RUN_PRE_URL = 'https://ais-pre-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';
export const CLOUD_RUN_CENTRAL_URL = CLOUD_RUN_DEV_URL;

export function getCentralServerOrigin(): string {
  if (typeof window === 'undefined') {
    return CLOUD_RUN_DEV_URL;
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
 * On static hosts (like Vercel, Android app, PWA), tries all active live origins.
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. Try local or current origin
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(cleanEndpoint, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const contentType = res.headers.get('content-type') || '';

    // If local server gave valid JSON or successful API response, return it immediately
    if (res.ok && !contentType.includes('text/html')) {
      return res;
    }
  } catch (_) {}

  // 2. Try primary Cloud Run endpoints
  const fallbackUrls = [
    `${CLOUD_RUN_DEV_URL}${cleanEndpoint}`,
    `${CLOUD_RUN_PRE_URL}${cleanEndpoint}`,
  ];

  for (const url of fallbackUrls) {
    if (typeof window !== 'undefined' && window.location.origin === new URL(url).origin) {
      continue; // already tried in step 1
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && !contentType.includes('text/html')) {
        return res;
      }
    } catch (_) {}
  }

  return createSyntheticErrorResponse('Server is reconnecting or falling back to Firestore', 503);
}





