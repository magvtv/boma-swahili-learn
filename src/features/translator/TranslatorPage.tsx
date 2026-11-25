import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Copy,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button, Card, Disclosure, PageHeader } from '../../components/ui';
import {
  clearRecentTranslations,
  getRecentTranslations,
  translateText,
} from './translatorService';
import type { LanguageCode, TranslationEntry } from './types';

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  sw: 'Kiswahili',
};

const MAX_CHARS = 500;

const QUICK_SAMPLES: Array<{ label: string; from: LanguageCode; text: string }> = [
  { label: 'Delicious food', from: 'en', text: 'The food is very delicious!' },
  { label: 'How much?', from: 'en', text: 'How much does this cost?' },
  { label: 'Welcome home', from: 'sw', text: 'Karibu sana nyumbani kwetu.' },
  { label: 'At the market', from: 'sw', text: 'Ninataka kununua matunda sokoni.' },
];

export function TranslatorPage() {
  const sourceId = useId();
  const targetId = useId();

  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('sw');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TranslationEntry[]>(() =>
    getRecentTranslations(),
  );

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runTranslation = useCallback(
    async (textToTranslate: string, from: LanguageCode, to: LanguageCode) => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setError('Please enter text to translate.');
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const result = await translateText(trimmed, from, to, controller.signal);
        setTranslatedText(result.translatedText);
        setHistory(getRecentTranslations());
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to complete translation right now.',
        );
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const handleSwapLanguages = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setError(null);

    const nextSourceLang = targetLang;
    const nextTargetLang = sourceLang;
    setSourceLang(nextSourceLang);
    setTargetLang(nextTargetLang);

    if (translatedText.trim()) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleCopy = async () => {
    if (!translatedText.trim()) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard. Please copy manually.');
    }
  };

  const handleClearInput = () => {
    abortRef.current?.abort();
    setSourceText('');
    setTranslatedText('');
    setError(null);
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    clearRecentTranslations();
    setHistory([]);
  };

  const handleRestoreEntry = (entry: TranslationEntry) => {
    setSourceLang(entry.from);
    setTargetLang(entry.to);
    setSourceText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <PageHeader
        eyebrow="Mtafsiri"
        title="Translator"
        quiet
      />

      <Card className="space-y-8">
        <div className="flex items-center justify-center gap-4 text-sm font-medium text-charcoal">
          <span>{LANGUAGE_LABELS[sourceLang]}</span>
          <button
            type="button"
            onClick={handleSwapLanguages}
            aria-label={`Swap languages (${LANGUAGE_LABELS[sourceLang]} and ${LANGUAGE_LABELS[targetLang]})`}
            className="flex size-10 items-center justify-center rounded-full text-savanna-green hover:bg-savanna-green-soft"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </button>
          <span>{LANGUAGE_LABELS[targetLang]}</span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-cream/70 p-6 focus-within:ring-1 focus-within:ring-savanna-green">
            <label htmlFor={sourceId} className="sr-only">
              {LANGUAGE_LABELS[sourceLang]} text
            </label>
            <textarea
              id={sourceId}
              rows={4}
              maxLength={MAX_CHARS}
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void runTranslation(sourceText, sourceLang, targetLang);
                }
              }}
              placeholder={
                sourceLang === 'en' ? 'Type English text here' : 'Andika Kiswahili hapa'
              }
              className="w-full resize-none bg-transparent text-lg leading-relaxed text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none"
            />
            {sourceText && (
              <div className="flex items-center justify-between gap-3 text-xs text-charcoal-muted">
                <span className="tabular-nums">
                  {sourceText.length} / {MAX_CHARS}
                </span>
                <button
                  type="button"
                  onClick={handleClearInput}
                  aria-label="Clear source text"
                  className="rounded-md px-1.5 py-0.5 hover:text-charcoal"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {(translatedText || isLoading) && (
            <div className="rounded-2xl bg-savanna-green-soft/50 p-6">
              <label htmlFor={targetId} className="sr-only">
                {LANGUAGE_LABELS[targetLang]} translation
              </label>
              <textarea
                id={targetId}
                rows={4}
                readOnly
                value={isLoading ? '' : translatedText}
                placeholder="Translating..."
                className="w-full resize-none bg-transparent text-lg leading-relaxed text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none"
              />
              {!isLoading && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleCopy()}
                    leftIcon={
                      copied ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Copy className="size-4" aria-hidden="true" />
                      )
                    }
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl bg-terracotta-soft p-4 text-sm text-terracotta-hover"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            disabled={isLoading || !sourceText.trim()}
            onClick={() => void runTranslation(sourceText, sourceLang, targetLang)}
            leftIcon={
              isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null
            }
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <p className="text-center text-xs text-charcoal-muted">
          Powered by MyMemory. Recent translations are saved on this device.
        </p>

        <Disclosure label="Try a sample">
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  const nextTo: LanguageCode = sample.from === 'en' ? 'sw' : 'en';
                  setSourceLang(sample.from);
                  setTargetLang(nextTo);
                  setSourceText(sample.text);
                  void runTranslation(sample.text, sample.from, nextTo);
                }}
                className="rounded-full border border-warm-border/70 bg-surface px-4 py-2 text-xs font-medium text-charcoal transition-colors hover:border-terracotta/50"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </Disclosure>

        {history.length > 0 && (
          <Disclosure label={`Recent translations (${history.length})`}>
            <ul className="divide-y divide-warm-border/60">
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => handleRestoreEntry(entry)}
                    className="group w-full rounded-lg py-4 text-left"
                  >
                    <p className="line-clamp-1 text-sm text-charcoal">
                      {entry.sourceText}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-savanna-green group-hover:text-terracotta">
                      {entry.translatedText}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-center pt-4">
              <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                Clear history
              </Button>
            </div>
          </Disclosure>
        )}
      </div>
    </div>
  );
}
