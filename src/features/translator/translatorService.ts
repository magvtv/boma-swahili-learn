import type {
  LanguageCode,
  TranslationEntry,
  TranslationResult,
} from './types';

const CACHE_STORAGE_KEY = 'boma_translator_history_v1';
const MAX_HISTORY_ITEMS = 20;
const AZURE_TRANSLATE_ENDPOINT = '/api/translate';
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

interface TranslateApiResponse {
  translatedText?: string;
  error?: string;
}

interface MyMemoryResponse {
  responseStatus: number;
  responseDetails?: string;
  responseData?: {
    translatedText?: string;
  };
}

function readHistory(): TranslationEntry[] {
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is TranslationEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as TranslationEntry).id === 'string' &&
        typeof (item as TranslationEntry).sourceText === 'string' &&
        typeof (item as TranslationEntry).translatedText === 'string' &&
        ((item as TranslationEntry).from === 'en' ||
          (item as TranslationEntry).from === 'sw') &&
        ((item as TranslationEntry).to === 'en' ||
          (item as TranslationEntry).to === 'sw') &&
        typeof (item as TranslationEntry).timestamp === 'number',
    );
  } catch {
    return [];
  }
}

function writeHistory(entries: TranslationEntry[]): void {
  try {
    window.localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)),
    );
  } catch {
    // Ignore storage quota or private-mode errors gracefully
  }
}

export function getRecentTranslations(): TranslationEntry[] {
  return readHistory();
}

export function clearRecentTranslations(): void {
  try {
    window.localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function saveTranslation(entry: TranslationEntry): TranslationEntry[] {
  const normalized = entry.sourceText.trim().toLowerCase();
  const existing = readHistory().filter(
    (item) =>
      !(
        item.from === entry.from &&
        item.to === entry.to &&
        item.sourceText.trim().toLowerCase() === normalized
      ),
  );
  const updated = [entry, ...existing].slice(0, MAX_HISTORY_ITEMS);
  writeHistory(updated);
  return updated;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function translateWithAzure(
  text: string,
  from: LanguageCode,
  to: LanguageCode,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(AZURE_TRANSLATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from, to }),
    signal,
  });

  let data: TranslateApiResponse = {};
  try {
    data = (await response.json()) as TranslateApiResponse;
  } catch {
    throw new Error('Unexpected response from Azure translation service.');
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Azure translation returned status ${response.status}.`,
    );
  }

  const translated = data.translatedText?.trim();
  if (!translated) {
    throw new Error('Azure translation returned an empty result.');
  }

  return translated;
}

async function translateWithMyMemory(
  text: string,
  from: LanguageCode,
  to: LanguageCode,
  signal?: AbortSignal,
): Promise<string> {
  const langpair = `${from}|${to}`;
  const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Translation service returned status ${response.status}.`);
  }

  const data = (await response.json()) as MyMemoryResponse;
  const translated = data.responseData?.translatedText?.trim();

  if (data.responseStatus !== 200 || !translated) {
    throw new Error(
      data.responseDetails || 'Could not translate this text. Please try again.',
    );
  }

  return translated;
}

export async function translateText(
  text: string,
  from: LanguageCode,
  to: LanguageCode,
  signal?: AbortSignal,
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Please enter some text to translate.');
  }

  const normalized = trimmed.toLowerCase();
  const cached = readHistory().find(
    (item) =>
      item.from === from &&
      item.to === to &&
      item.sourceText.trim().toLowerCase() === normalized,
  );

  if (cached) {
    const refreshed: TranslationEntry = {
      ...cached,
      timestamp: Date.now(),
    };
    saveTranslation(refreshed);
    return {
      translatedText: cached.translatedText,
      fromCache: true,
      entry: refreshed,
    };
  }

  if (from === to) {
    throw new Error('Source and target languages must be different.');
  }

  let translated: string;
  try {
    translated = await translateWithAzure(trimmed, from, to, signal);
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) {
      throw error;
    }
    translated = await translateWithMyMemory(trimmed, from, to, signal);
  }

  const entry: TranslationEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceText: trimmed,
    translatedText: translated,
    from,
    to,
    timestamp: Date.now(),
  };

  saveTranslation(entry);

  return {
    translatedText: translated,
    fromCache: false,
    entry,
  };
}
