import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Volume2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Disclosure,
  PageHeader,
  ProgressBar,
} from '../../components/ui';
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

  const deckSummary = [
    selectedCategory === 'All' ? 'All cards' : selectedCategory,
    unknownOnly && 'unknown only',
    shuffleSeed > 0 && 'shuffled',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <PageHeader
        eyebrow="Kadi za Maneno"
        title="Flashcards"
        quiet
      />

      {speechNotice && (
        <p role="status" className="text-sm text-charcoal-muted">
          {speechNotice}
        </p>
      )}

      {!activeCard ? (
        <Card className="space-y-4 py-20 text-center">
          <p className="text-base font-semibold text-charcoal">
            Hongera! No unknown cards left in this filter.
          </p>
          <p className="text-sm text-charcoal-muted">
            Turn off “Review unknown only” or choose another category to keep practicing.
          </p>
          <div className="pt-4">
            <Button
              variant="primary"
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
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="boma-card-scene">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
                aria-label={`Flashcard: ${activeCard.swahili}. Activate to flip.`}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(event) => {
                  // Let the listen button handle its own key presses
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFlipped((f) => !f);
                  }
                }}
                data-flipped={flipped}
                className="boma-card-flipper min-h-[26rem] cursor-pointer rounded-card focus-visible:outline-2 focus-visible:outline-terracotta"
              >
                {/* Front Face (Swahili) */}
                <div className="boma-card-face absolute inset-0 flex flex-col rounded-card border border-warm-border/45 bg-surface p-7 shadow-soft sm:p-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-charcoal-muted">
                      {activeCard.category}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSpeak(activeCard.swahili);
                      }}
                      aria-label={`Listen to ${activeCard.swahili}`}
                      className="flex size-10 items-center justify-center rounded-full text-charcoal-muted hover:bg-cream-dark/60 hover:text-charcoal"
                    >
                      <Volume2 className="size-5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="my-auto space-y-3 text-center">
                    <p className="font-serif text-4xl font-semibold leading-snug text-charcoal sm:text-5xl">
                      {activeCard.swahili}
                    </p>
                    <p className="text-sm italic text-charcoal-muted">
                      {activeCard.pronunciation}
                    </p>
                  </div>

                  <p className="text-center text-xs text-charcoal-muted">
                    Tap to see the meaning
                  </p>
                </div>

                {/* Back Face (English + Example) */}
                <div className="boma-card-face boma-card-face-back absolute inset-0 flex flex-col rounded-card bg-savanna-green p-7 text-cream shadow-soft sm:p-10">
                  <span className="text-xs text-cream/75">{activeCard.swahili}</span>

                  <div className="my-auto space-y-5 pb-6 text-center">
                    <p className="font-serif text-3xl font-semibold leading-snug sm:text-4xl">
                      {activeCard.english}
                    </p>
                    <p className="text-sm leading-relaxed text-cream/85">
                      “{activeCard.example}”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" onClick={handleMarkUnknown}>
                Still Learning
              </Button>
              <Button variant="primary" size="lg" onClick={handleMarkKnown}>
                I Know This
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-charcoal-muted">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous card"
                className="flex size-10 items-center justify-center rounded-full hover:bg-cream-dark/60 hover:text-charcoal"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="tabular-nums">
                Card {safeIndex + 1} of {deck.length}
                {knownSet.has(activeCard.id) && ' · Known'}
              </span>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next card"
                className="flex size-10 items-center justify-center rounded-full hover:bg-cream-dark/60 hover:text-charcoal"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Disclosure label={`Deck options: ${deckSummary}`}>
        <div className="space-y-6">
          <ProgressBar
            value={knownSet.size}
            max={PHRASES.length}
            label={`${knownSet.size} of ${PHRASES.length} cards known`}
            showPercentage={false}
            tone="terracotta"
          />

            <div
              className="flex flex-wrap justify-center gap-2"
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
                    'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                    active
                      ? 'border-savanna-green bg-savanna-green text-cream'
                      : 'border-warm-border/70 bg-surface text-charcoal-muted hover:text-charcoal',
                  )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUnknownOnly((v) => !v);
                  setCurrentIndex(0);
                  setFlipped(false);
                }}
                aria-pressed={unknownOnly}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                  unknownOnly
                    ? 'border-terracotta bg-terracotta-soft text-terracotta-hover'
                    : 'border-warm-border/70 bg-surface text-charcoal-muted hover:text-charcoal',
                )}
              >
                Review unknown only
              </button>
              <Button
                variant="ghost"
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
                Reset progress
              </Button>
            </div>
        </div>
      </Disclosure>
    </div>
  );
}
