import { CheckCircle2, Search, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  Input,
  PageHeader,
  ProgressBar,
  Select,
} from '../../components/ui';
import {
  PHRASES,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from '../../data/phrases';
import { usePhraseProgress } from '../../hooks/usePhraseProgress';
import { cn } from '../../utils/cn';
import { speakSwahili } from '../../utils/speech';

export function PhrasebookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const [selectedCategory, setSelectedCategory] = useState<'All' | PhraseCategory>('All');
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const { knownSet, toggleKnown } = usePhraseProgress();

  const filteredPhrases = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PHRASES.filter((phrase) => {
      const matchesCategory =
        selectedCategory === 'All' || phrase.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        phrase.swahili.toLowerCase().includes(query) ||
        phrase.english.toLowerCase().includes(query) ||
        phrase.example.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, search]);

  const handleSpeak = (id: string, text: string) => {
    const result = speakSwahili(text);
    if (!result.supported) {
      setSpeechNotice('Audio pronunciation is not supported in this browser.');
      return;
    }
    setSpeechNotice(null);
    setSpeakingId(id);
    window.setTimeout(() => {
      setSpeakingId((current) => (current === id ? null : current));
    }, 1200);
  };

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Kitabu cha Misemo"
        title="Phrasebook"
        description="Tap a phrase to see how to say it and use it."
        action={
          <Link
            to="/flashcards"
            className="rounded-md text-sm text-savanna-green underline decoration-savanna-green/30 underline-offset-4 hover:decoration-savanna-green"
          >
            Practice with flashcards
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              type="search"
              aria-label="Filter phrases"
              placeholder="Search Swahili or English..."
              value={search}
              onChange={(event) => {
                const val = event.target.value;
                setSearchParams(val ? { q: val } : {}, { replace: true });
              }}
              leftIcon={<Search className="size-4" />}
            />
          </div>
          <Select
            aria-label="Filter by category"
            className="sm:w-52"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value as 'All' | PhraseCategory)
            }
          >
            <option value="All">All categories</option>
            {PHRASE_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </Select>
        </div>

        <ProgressBar
          value={knownSet.size}
          max={PHRASES.length}
          label={`${knownSet.size} of ${PHRASES.length} phrases known`}
          showPercentage={false}
          tone="green"
        />
      </div>

      {speechNotice && (
        <p role="status" className="text-sm text-charcoal-muted">
          {speechNotice}
        </p>
      )}

      {/* Phrase List */}
      {filteredPhrases.length === 0 ? (
        <Card className="py-16 text-center text-sm text-charcoal-muted">
          No phrases match your current filter.
        </Card>
      ) : (
        <Card className="py-2 sm:py-4">
          <ul className="divide-y divide-warm-border/60">
            {filteredPhrases.map((phrase) => {
              const isKnown = knownSet.has(phrase.id);
              const isSpeaking = speakingId === phrase.id;

              return (
                <li key={phrase.id} className="flex items-start gap-3 py-5">
                  <details className="min-w-0 flex-1">
                    <summary className="cursor-pointer list-none rounded-lg [&::-webkit-details-marker]:hidden">
                      <h2 className="flex items-center gap-2 text-lg font-semibold leading-snug text-charcoal">
                        {phrase.swahili}
                        {isKnown && (
                          <CheckCircle2
                            className="size-4 shrink-0 text-savanna-green"
                            aria-label="Known"
                          />
                        )}
                      </h2>
                      <p className="mt-1 text-sm text-charcoal-muted">{phrase.english}</p>
                    </summary>

                    <div className="space-y-3 pt-4 text-sm leading-relaxed text-charcoal-muted">
                      <p className="italic">{phrase.pronunciation}</p>
                      <p>“{phrase.example}”</p>
                      <button
                        type="button"
                        onClick={() => toggleKnown(phrase.id)}
                        aria-pressed={isKnown}
                        aria-label={
                          isKnown
                            ? `Mark ${phrase.swahili} as unknown`
                            : `Mark ${phrase.swahili} as known`
                        }
                        className="rounded-md text-xs font-medium text-savanna-green underline decoration-savanna-green/30 underline-offset-4 hover:decoration-savanna-green"
                      >
                        {isKnown ? 'Mark as still learning' : 'Mark as known'}
                      </button>
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => handleSpeak(phrase.id, phrase.swahili)}
                    aria-label={`Listen to ${phrase.swahili}`}
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
                      isSpeaking
                        ? 'bg-terracotta text-cream'
                        : 'text-charcoal-muted hover:bg-cream-dark/60 hover:text-charcoal',
                    )}
                  >
                    <Volume2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
