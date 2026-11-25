import { useCallback, useState } from 'react';

const PROGRESS_STORAGE_KEY = 'boma_phrase_progress_v1';

function readKnownIds(): string[] {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function writeKnownIds(ids: string[]): void {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota or private mode errors
  }
}

export function usePhraseProgress() {
  const [knownIds, setKnownIds] = useState<string[]>(() => readKnownIds());

  const markKnown = useCallback((id: string) => {
    setKnownIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeKnownIds(next);
      return next;
    });
  }, []);

  const markUnknown = useCallback((id: string) => {
    setKnownIds((prev) => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter((item) => item !== id);
      writeKnownIds(next);
      return next;
    });
  }, []);

  const toggleKnown = useCallback((id: string) => {
    setKnownIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      writeKnownIds(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setKnownIds([]);
    writeKnownIds([]);
  }, []);

  return {
    knownIds,
    knownSet: new Set(knownIds),
    markKnown,
    markUnknown,
    toggleKnown,
    resetProgress,
  };
}
