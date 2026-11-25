import { BookOpen, CheckCircle2, Circle, Layers, Search, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Input, ProgressBar } from '../../components/ui';
import {
  PHRASES,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from '../../data/phrases';
import { usePhraseProgress } from '../../hooks/usePhraseProgress';
import { cn } from '../../utils/cn';
import { speakSwahili } from '../../utils/speech';

const CATEGORY_TONES: Record<PhraseCategory, 'green' | 'terracotta' | 'ochre' | 'neutral'> = {
  'Kitchen Tools': 'green',
  Ingredients: 'terracotta',
  'Cooking Actions': 'ochre',
  'Common Phrases': 'neutral',
};

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-terracotta-soft text-terracotta">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                Kitabu cha Misemo
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-charcoal">
                Culinary Phrasebook
              </h1>
            </div>
          </div>
          <p className="text-sm text-charcoal-muted">
            Essential Kenyan kitchen tools, ingredients, cooking actions, and table
            expressions.
          </p>
        </div>

        <Link to="/flashcards">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Layers className="size-4" aria-hidden="true" />}
          >
            Practice Flashcards
          </Button>
        </Link>
      </div>

      {/* Mastery Progress */}
      <Card className="p-4 sm:p-5">
        <ProgressBar
          value={knownSet.size}
          max={PHRASES.length}
          label={`Phrasebook Mastery (${knownSet.size} of ${PHRASES.length} known)`}
          tone="green"
        />
      </Card>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          {(['All', ...PHRASE_CATEGORIES] as const).map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-savanna-green bg-savanna-green text-cream'
                    : 'border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark hover:text-charcoal',
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="search"
            aria-label="Filter phrases"
            placeholder="Filter Swahili or English..."
            value={search}
            onChange={(event) => {
              const val = event.target.value;
              setSearchParams(val ? { q: val } : {}, { replace: true });
            }}
            leftIcon={<Search className="size-4" />}
          />
        </div>
      </div>

      {speechNotice && (
        <p className="rounded-xl border border-warm-border bg-ochre-soft px-4 py-2.5 text-xs font-medium text-charcoal">
          {speechNotice}
        </p>
      )}

      {/* Phrase List */}
      {filteredPhrases.length === 0 ? (
        <Card className="py-10 text-center text-sm text-charcoal-muted">
          No phrases match your current filter.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredPhrases.map((phrase) => {
            const isKnown = knownSet.has(phrase.id);
            const isSpeaking = speakingId === phrase.id;

            return (
              <Card
                key={phrase.id}
                className={cn(
                  'flex flex-col justify-between gap-4 transition-colors',
                  isKnown && 'border-savanna-green/35 bg-savanna-green-soft/25',
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={CATEGORY_TONES[phrase.category]}>
                      {phrase.category}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeak(phrase.id, phrase.swahili)}
                        aria-label={`Listen to ${phrase.swahili}`}
                        className={cn(
                          'flex size-8 items-center justify-center rounded-lg border border-warm-border transition-colors',
                          isSpeaking
                            ? 'border-terracotta bg-terracotta text-cream'
                            : 'bg-cream text-charcoal-muted hover:bg-cream-dark hover:text-charcoal',
                        )}
                      >
                        <Volume2 className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleKnown(phrase.id)}
                        aria-pressed={isKnown}
                        aria-label={
                          isKnown
                            ? `Mark ${phrase.swahili} as unknown`
                            : `Mark ${phrase.swahili} as known`
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                          isKnown
                            ? 'border-savanna-green/30 bg-savanna-green-soft text-savanna-green'
                            : 'border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark',
                        )}
                      >
                        {isKnown ? (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Circle className="size-3.5" aria-hidden="true" />
                        )}
                        <span>{isKnown ? 'Known' : 'Learn'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-charcoal">
                      {phrase.swahili}
                    </h2>
                    <p className="text-sm font-medium text-terracotta">
                      {phrase.english}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal-muted">
                      Pronunciation: <span className="italic">{phrase.pronunciation}</span>
                    </p>
                  </div>
                </div>

                <p className="rounded-xl bg-cream px-3 py-2 text-xs leading-relaxed text-charcoal-muted">
                  <span className="font-semibold text-charcoal">Example:</span>{' '}
                  {phrase.example}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
