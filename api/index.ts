// Vercel Serverless Function - Transparent Proxy to GCap Central Cloud Run Backend

const CLOUD_RUN_CENTRAL_URL = 'https://ais-dev-uh2lixxuk2xqat24sbmmqm-80829483615.asia-east1.run.app';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawUrl = req.url || '';
    const cleanUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    const targetUrl = `${CLOUD_RUN_CENTRAL_URL}${cleanUrl}`;

    const headers: Record<string, string> = {};
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to proxy to central server' });
  }
}
