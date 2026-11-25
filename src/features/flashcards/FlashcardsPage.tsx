import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
  Shuffle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, ProgressBar } from '../../components/ui';
import {
  PHRASES,
  PHRASE_CATEGORIES,
  type PhraseCategory,
  type PhraseItem,
} from '../../data/phrases';
import { usePhraseProgress } from '../../hooks/usePhraseProgress';
import { cn } from '../../utils/cn';
import { speakSwahili } from '../../utils/speech';

export function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | PhraseCategory>('All');
  const [unknownOnly, setUnknownOnly] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const { knownSet, markKnown, markUnknown, resetProgress } = usePhraseProgress();

  const deck: PhraseItem[] = useMemo(() => {
    const filtered = PHRASES.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesUnknown = !unknownOnly || !knownSet.has(item.id);
      return matchesCat && matchesUnknown;
    });

    if (shuffleSeed === 0) return filtered;

    // Deterministic Fisher-Yates copy using shuffleSeed
    const copy = [...filtered];
    let seed = shuffleSeed;
    for (let i = copy.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = seed % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [selectedCategory, unknownOnly, knownSet, shuffleSeed]);

  const safeIndex = deck.length > 0 ? Math.min(currentIndex, deck.length - 1) : 0;
  const activeCard = deck[safeIndex];

  const handleSelectCategory = (category: 'All' | PhraseCategory) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const goToNext = () => {
    if (deck.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const goToPrev = () => {
    if (deck.length === 0) return;
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleMarkKnown = () => {
    if (!activeCard) return;
    markKnown(activeCard.id);
    setFlipped(false);
    if (deck.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }
  };

  const handleMarkUnknown = () => {
    if (!activeCard) return;
    markUnknown(activeCard.id);
    setFlipped(false);
    if (deck.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }
  };

  const handleSpeak = (text: string) => {
    const result = speakSwahili(text);
    if (!result.supported) {
      setSpeechNotice('Audio pronunciation is not supported in this browser.');
    } else {
      setSpeechNotice(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-terracotta-soft text-terracotta">
              <Layers className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                Kadi za Maneno
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-charcoal">
                Culinary Flashcards
              </h1>
            </div>
          </div>
          <p className="text-sm text-charcoal-muted">
            Tap a card to flip between Kiswahili and English, then mark what you know.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShuffleSeed((s) => s + 1);
              setCurrentIndex(0);
              setFlipped(false);
            }}
            leftIcon={<Shuffle className="size-4" aria-hidden="true" />}
          >
            Shuffle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetProgress();
              setCurrentIndex(0);
              setFlipped(false);
            }}
            leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4 sm:p-5">
        <ProgressBar
          value={knownSet.size}
          max={PHRASES.length}
          label={`Overall Mastery (${knownSet.size} of ${PHRASES.length} cards known)`}
          tone="terracotta"
        />
      </Card>

      {/* Category & Unknown Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter flashcards by category"
        >
          {(['All', ...PHRASE_CATEGORIES] as const).map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
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

        <button
          type="button"
          onClick={() => {
            setUnknownOnly((v) => !v);
            setCurrentIndex(0);
            setFlipped(false);
          }}
          aria-pressed={unknownOnly}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
            unknownOnly
              ? 'border-terracotta bg-terracotta-soft text-terracotta-hover'
              : 'border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark',
          )}
        >
          Review Unknown Only
        </button>
      </div>

      {speechNotice && (
        <p className="rounded-xl border border-warm-border bg-ochre-soft px-4 py-2.5 text-xs font-medium text-charcoal">
          {speechNotice}
        </p>
      )}

      {/* Flashcard Stage */}
      {!activeCard ? (
        <Card className="py-12 text-center space-y-3">
          <p className="text-base font-semibold text-charcoal">
            Hongera! No unknown cards left in this filter.
          </p>
          <p className="text-sm text-charcoal-muted">
            Switch off “Review Unknown Only” or choose another category to keep practicing.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setUnknownOnly(false);
                setSelectedCategory('All');
              }}
            >
              Show All Cards
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mx-auto max-w-xl space-y-5">
          <div className="flex items-center justify-between text-xs font-medium text-charcoal-muted">
            <span>
              Card {safeIndex + 1} of {deck.length}
            </span>
            <Badge tone={knownSet.has(activeCard.id) ? 'green' : 'neutral'}>
              {knownSet.has(activeCard.id) ? 'Known' : 'Learning'}
            </Badge>
          </div>

          <div className="boma-card-scene">
            <div
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              aria-label={`Flashcard: ${activeCard.swahili}. Activate to flip.`}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setFlipped((f) => !f);
                }
              }}
              data-flipped={flipped}
              className="boma-card-flipper min-h-72 cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-terracotta"
            >
              {/* Front Face (Swahili) */}
              <div className="boma-card-face absolute inset-0 flex flex-col justify-between rounded-3xl border border-warm-border bg-surface p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="terracotta">{activeCard.category}</Badge>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSpeak(activeCard.swahili);
                    }}
                    aria-label={`Listen to ${activeCard.swahili}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-warm-border bg-cream text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
                  >
                    <Volume2 className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="my-auto text-center space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-charcoal-muted uppercase">
                    Kiswahili
                  </p>
                  <p className="text-2xl font-bold text-charcoal sm:text-3xl">
                    {activeCard.swahili}
                  </p>
                  <p className="text-xs italic text-charcoal-muted">
                    {activeCard.pronunciation}
                  </p>
                </div>

                <p className="text-center text-xs text-charcoal-muted">
                  Tap card to reveal English meaning
                </p>
              </div>

              {/* Back Face (English + Example) */}
              <div className="boma-card-face boma-card-face-back absolute inset-0 flex flex-col justify-between rounded-3xl border border-savanna-green/30 bg-savanna-green p-6 text-cream shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-cream/15 px-2.5 py-0.5 text-xs font-medium text-cream">
                    English Meaning
                  </span>
                  <span className="text-xs text-cream/80">{activeCard.swahili}</span>
                </div>

                <div className="my-auto text-center space-y-3">
                  <p className="text-2xl font-bold sm:text-3xl">
                    {activeCard.english}
                  </p>
                  <p className="rounded-2xl bg-cream/10 px-4 py-2.5 text-xs leading-relaxed text-cream/90 sm:text-sm">
                    “{activeCard.example}”
                  </p>
                </div>

                <p className="text-center text-xs text-cream/75">
                  Tap card to flip back
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrev}
                aria-label="Previous card"
                leftIcon={<ChevronLeft className="size-4" aria-hidden="true" />}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                aria-label="Next card"
                rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkUnknown}
                leftIcon={<XCircle className="size-4 text-terracotta" aria-hidden="true" />}
              >
                Still Learning
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkKnown}
                leftIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
              >
                I Know This
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
