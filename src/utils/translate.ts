// English to Hindi Auto-Translation Utility

export async function translateEnglishToHindi(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';

  // 1. Try Google Translate Client Endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('');
        if (translated) return translated;
      }
    }
  } catch (err) {
    console.warn('[Translate] Direct endpoint failed, trying fallback:', err);
  }

  // 2. Try Server API Proxy endpoint
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, from: 'en', to: 'hi' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.translatedText) {
        return data.translatedText;
      }
    }
  } catch (_) {}

  // 3. Try MyMemory Free API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|hi`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (_) {}

  return clean;
}
