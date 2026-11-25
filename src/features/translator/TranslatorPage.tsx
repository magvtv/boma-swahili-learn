import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Clock,
  Copy,
  Languages,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Card, PageHeader } from '../../components/ui';
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
  const [fromCache, setFromCache] = useState(false);
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
        setFromCache(result.fromCache);
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
    setFromCache(false);

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
    setFromCache(false);
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
    setFromCache(true);
    setError(null);
  };

  return (
    <div className="space-y-10">
      <PageHeader
        icon={<Languages className="size-5" aria-hidden="true" />}
        eyebrow="Mtafsiri"
        title="English ↔ Kiswahili Translator"
        description="Translate everyday phrases, culinary terms, and travel expressions. Recent translations are cached locally for instant offline recall."
        action={<Badge tone="green">MyMemory API</Badge>}
      />

      {/* Quick sample chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-charcoal-muted">Try a sample:</span>
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
            className="rounded-full border border-warm-border/70 bg-surface px-4 py-2 text-xs font-medium text-charcoal transition-colors hover:border-terracotta/50 hover:bg-terracotta-soft"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Translator Workspace */}
      <Card className="p-5 sm:p-8">
        {/* Language Bar */}
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-cream p-4 sm:px-6">
          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-medium text-charcoal-muted">From</span>
            <p className="text-sm font-bold text-savanna-green sm:text-base">
              {LANGUAGE_LABELS[sourceLang]}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLanguages}
            aria-label={`Swap languages (${LANGUAGE_LABELS[sourceLang]} and ${LANGUAGE_LABELS[targetLang]})`}
            leftIcon={<ArrowLeftRight className="size-4" aria-hidden="true" />}
          >
            Swap
          </Button>

          <div className="flex-1 text-center sm:text-right">
            <span className="text-xs font-medium text-charcoal-muted">To</span>
            <p className="text-sm font-bold text-terracotta sm:text-base">
              {LANGUAGE_LABELS[targetLang]}
            </p>
          </div>
        </div>

        {/* Source & Target Text Areas */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Source Panel */}
          <div className="flex flex-col rounded-2xl border border-warm-border/70 bg-cream/40 p-5 focus-within:border-savanna-green">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor={sourceId}
                className="text-xs font-semibold tracking-wider text-charcoal-muted uppercase"
              >
                {LANGUAGE_LABELS[sourceLang]}
              </label>
              {sourceText && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  aria-label="Clear source text"
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <textarea
              id={sourceId}
              rows={5}
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
                sourceLang === 'en'
                  ? 'Type English text here (e.g. "I would like some ugali and sukuma wiki")...'
                  : 'Andika Kiswahili hapa (mfano: "Habari za asubuhi, rafiki yangu")...'
              }
              className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none sm:text-base"
            />

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-warm-border/70 pt-4">
              <span className="text-xs tabular-nums text-charcoal-muted">
                {sourceText.length} / {MAX_CHARS}
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={isLoading || !sourceText.trim()}
                onClick={() => void runTranslation(sourceText, sourceLang, targetLang)}
                leftIcon={
                  isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Languages className="size-4" aria-hidden="true" />
                  )
                }
              >
                {isLoading ? 'Translating...' : 'Translate'}
              </Button>
            </div>
          </div>

          {/* Target Panel */}
          <div className="flex flex-col rounded-2xl border border-warm-border/70 bg-surface p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor={targetId}
                className="text-xs font-semibold tracking-wider text-charcoal-muted uppercase"
              >
                {LANGUAGE_LABELS[targetLang]}
              </label>
              {translatedText && !isLoading && (
                <Badge tone={fromCache ? 'ochre' : 'green'}>
                  {fromCache ? 'Cached' : 'Live'}
                </Badge>
              )}
            </div>

            <textarea
              id={targetId}
              rows={5}
              readOnly
              value={isLoading ? '' : translatedText}
              placeholder={
                isLoading
                  ? 'Translating...'
                  : 'Translation will appear here...'
              }
              className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none sm:text-base"
            />

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-warm-border/70 pt-4">
              <span className="text-xs text-charcoal-muted">
                {isLoading ? 'Fetching translation...' : 'Ctrl/Cmd + Enter to translate'}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!translatedText.trim() || isLoading}
                onClick={() => void handleCopy()}
                leftIcon={
                  copied ? (
                    <Check className="size-4 text-savanna-green" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )
                }
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-terracotta/30 bg-terracotta-soft px-4 py-3 text-sm text-terracotta-hover"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Recent Cached Translations */}
      <section aria-labelledby="recent-heading" className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-charcoal-muted" aria-hidden="true" />
            <h2 id="recent-heading" className="text-xl font-semibold leading-snug text-charcoal">
              Recent Translations
            </h2>
          </div>

          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              leftIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
            >
              Clear history
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="py-10 text-center text-sm text-charcoal-muted">
            No cached translations yet. Translate a phrase above to save it here.
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleRestoreEntry(entry)}
                className="group rounded-card border border-warm-border/70 bg-surface p-6 text-left transition-colors hover:border-terracotta/40 hover:bg-cream/60"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Badge tone="neutral">
                    {entry.from.toUpperCase()} → {entry.to.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-charcoal-muted">
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm font-medium text-charcoal">
                  {entry.sourceText}
                </p>
                <p className="mt-0.5 line-clamp-1 text-sm text-savanna-green group-hover:text-terracotta">
                  {entry.translatedText}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
