export const config = { runtime: 'edge' };

const AZURE_TRANSLATE_ENDPOINT =
  'https://api.cognitive.microsofttranslator.com/translate';

const SUPPORTED_LANGS = new Set(['en', 'sw']);

type TranslateBody = {
  text?: unknown;
  from?: unknown;
  to?: unknown;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  if (!apiKey) {
    return jsonResponse(
      { error: 'Translation service is not configured.' },
      500,
    );
  }

  let body: TranslateBody;
  try {
    body = (await req.json()) as TranslateBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const from = typeof body.from === 'string' ? body.from : '';
  const to = typeof body.to === 'string' ? body.to : '';

  if (!text) {
    return jsonResponse({ error: 'Missing text' }, 400);
  }

  if (!SUPPORTED_LANGS.has(from) || !SUPPORTED_LANGS.has(to)) {
    return jsonResponse(
      { error: 'Only English (en) and Swahili (sw) are supported.' },
      400,
    );
  }

  if (from === to) {
    return jsonResponse(
      { error: 'Source and target languages must be different.' },
      400,
    );
  }

  const params = new URLSearchParams({
    'api-version': '3.0',
    from,
    to,
  });

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': apiKey,
    'Content-Type': 'application/json',
  };

  const region = process.env.AZURE_TRANSLATOR_REGION?.trim();
  if (region) {
    headers['Ocp-Apim-Subscription-Region'] = region;
  }

  let azureResponse: Response;
  try {
    azureResponse = await fetch(`${AZURE_TRANSLATE_ENDPOINT}?${params}`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ Text: text }]),
    });
  } catch {
    return jsonResponse(
      { error: 'Unable to reach the translation service.' },
      502,
    );
  }

  let data: unknown;
  try {
    data = await azureResponse.json();
  } catch {
    return jsonResponse(
      { error: 'Unexpected response from translation service.' },
      502,
    );
  }

  if (!azureResponse.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: { message?: unknown } }).error?.message ===
        'string'
        ? (data as { error: { message: string } }).error.message
        : 'Translation request failed.';

    return jsonResponse({ error: message }, azureResponse.status);
  }

  const translatedText = extractTranslatedText(data);
  if (!translatedText) {
    return jsonResponse(
      { error: 'Could not translate this text. Please try again.' },
      502,
    );
  }

  return jsonResponse({ translatedText });
}

function extractTranslatedText(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return '';

  const first = data[0];
  if (typeof first !== 'object' || first === null || !('translations' in first)) {
    return '';
  }

  const translations = (first as { translations: unknown }).translations;
  if (!Array.isArray(translations) || translations.length === 0) return '';

  const translation = translations[0];
  if (
    typeof translation !== 'object' ||
    translation === null ||
    !('text' in translation) ||
    typeof (translation as { text: unknown }).text !== 'string'
  ) {
    return '';
  }

  return (translation as { text: string }).text.trim();
}
