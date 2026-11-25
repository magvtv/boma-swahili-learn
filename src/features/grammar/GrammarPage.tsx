import { CheckCircle2, GraduationCap, Lightbulb, Volume2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Card } from '../../components/ui';
import { GRAMMAR_LESSONS } from '../../data/grammar';
import { cn } from '../../utils/cn';
import { speakSwahili } from '../../utils/speech';

export function GrammarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson');
  const selectedId =
    lessonParam && GRAMMAR_LESSONS.some((l) => l.id === lessonParam)
      ? lessonParam
      : GRAMMAR_LESSONS[0].id;
  const setSelectedId = (id: string) =>
    setSearchParams({ lesson: id }, { replace: true });

  const activeLesson =
    GRAMMAR_LESSONS.find((lesson) => lesson.id === selectedId) ?? GRAMMAR_LESSONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-savanna-green-soft text-savanna-green">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
              Sarufi
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal">
              Swahili Grammar Essentials
            </h1>
          </div>
        </div>
        <p className="text-sm text-charcoal-muted">
          Four practical lessons to help you form natural sentences in the kitchen and
          at the table.
        </p>
      </div>

      {/* Lesson Selector + Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-2.5 lg:col-span-4">
          {GRAMMAR_LESSONS.map((lesson, idx) => {
            const active = lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedId(lesson.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  active
                    ? 'border-savanna-green bg-savanna-green text-cream shadow-xs'
                    : 'border-warm-border bg-surface text-charcoal hover:bg-cream-dark/60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      active ? 'text-cream/80' : 'text-terracotta',
                    )}
                  >
                    Lesson {idx + 1}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      active
                        ? 'bg-cream/15 text-cream'
                        : 'bg-cream-dark text-charcoal-muted',
                    )}
                  >
                    {lesson.level}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold">{lesson.title}</p>
                <p
                  className={cn(
                    'mt-0.5 text-xs',
                    active ? 'text-cream/80' : 'text-charcoal-muted',
                  )}
                >
                  {lesson.swahiliTitle}
                </p>
              </button>
            );
          })}
        </div>

        <Card className="space-y-6 p-6 sm:p-8 lg:col-span-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                {activeLesson.swahiliTitle}
              </p>
              <Badge tone="green">{activeLesson.level}</Badge>
            </div>
            <h2 className="text-xl font-bold text-charcoal sm:text-2xl">
              {activeLesson.title}
            </h2>
            <p className="text-sm leading-relaxed text-charcoal-muted">
              {activeLesson.summary}
            </p>
          </div>

          {/* Key Rule */}
          <div className="rounded-2xl border border-savanna-green/20 bg-savanna-green-soft/60 p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-savanna-green"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-savanna-green uppercase">
                  Key Rule
                </p>
                <p className="text-sm leading-relaxed text-charcoal">
                  {activeLesson.keyRule}
                </p>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-charcoal">Examples</h3>
            <div className="space-y-2.5">
              {activeLesson.examples.map((ex) => (
                <div
                  key={ex.swahili}
                  className="flex items-start justify-between gap-3 rounded-xl border border-warm-border bg-cream/60 p-3.5"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-charcoal">{ex.swahili}</p>
                    <p className="text-sm text-terracotta">{ex.english}</p>
                    {ex.note && (
                      <p className="text-xs text-charcoal-muted">{ex.note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakSwahili(ex.swahili)}
                    aria-label={`Listen to ${ex.swahili}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
                  >
                    <Volume2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="rounded-2xl border border-ochre/30 bg-ochre-soft p-4">
            <div className="flex items-start gap-2.5">
              <Lightbulb
                className="mt-0.5 size-4 shrink-0 text-terracotta"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-charcoal sm:text-sm">
                <strong>Tip:</strong> {activeLesson.tip}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
