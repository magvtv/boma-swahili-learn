import type {
  LanguageCode,
  TranslationEntry,
  TranslationResult,
} from './types';

const CACHE_STORAGE_KEY = 'boma_translator_history_v1';
const MAX_HISTORY_ITEMS = 20;
const TRANSLATE_ENDPOINT = '/api/translate';

interface TranslateApiResponse {
  translatedText?: string;
  error?: string;
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

  const response = await fetch(TRANSLATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: trimmed, from, to }),
    signal,
  });

  let data: TranslateApiResponse = {};
  try {
    data = (await response.json()) as TranslateApiResponse;
  } catch {
    throw new Error('Unexpected response from translation service.');
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Translation service returned status ${response.status}.`,
    );
  }

  const translated = data.translatedText?.trim();
  if (!translated) {
    throw new Error('Could not translate this text. Please try again.');
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
