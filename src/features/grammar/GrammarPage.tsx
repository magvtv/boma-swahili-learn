import { CheckCircle2, GraduationCap, Lightbulb, Volume2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Card, PageHeader } from '../../components/ui';
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
    <div className="space-y-10">
      <PageHeader
        icon={<GraduationCap className="size-5" aria-hidden="true" />}
        eyebrow="Sarufi"
        title="Swahili Grammar Essentials"
        description="Four practical lessons to help you form natural sentences in the kitchen and at the table."
      />

      {/* Lesson Selector + Content */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          {GRAMMAR_LESSONS.map((lesson, idx) => {
            const active = lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedId(lesson.id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'w-full rounded-card border p-5 text-left transition-colors',
                  active
                    ? 'border-savanna-green/25 bg-savanna-green-soft/80 text-savanna-green'
                    : 'border-warm-border/70 bg-surface text-charcoal hover:bg-cream-dark/60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      active ? 'text-savanna-green' : 'text-terracotta',
                    )}
                  >
                    Lesson {idx + 1}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      active
                        ? 'bg-surface text-savanna-green'
                        : 'bg-cream-dark text-charcoal-muted',
                    )}
                  >
                    {lesson.level}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{lesson.title}</p>
                <p
                  className={cn(
                    'mt-1 text-xs',
                    active ? 'text-savanna-green' : 'text-charcoal-muted',
                  )}
                >
                  {lesson.swahiliTitle}
                </p>
              </button>
            );
          })}
        </div>

        <Card className="space-y-8 sm:p-10 lg:col-span-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                {activeLesson.swahiliTitle}
              </p>
              <Badge tone="green">{activeLesson.level}</Badge>
            </div>
            <h2 className="text-2xl font-semibold leading-snug text-charcoal">
              {activeLesson.title}
            </h2>
            <p className="text-sm leading-relaxed text-charcoal-muted">
              {activeLesson.summary}
            </p>
          </div>

          {/* Key Rule */}
          <div className="rounded-2xl bg-savanna-green-soft/60 p-5">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-snug text-charcoal">Examples</h3>
            <div className="space-y-3">
              {activeLesson.examples.map((ex) => (
                <div
                  key={ex.swahili}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-cream/70 p-5"
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
          <div className="rounded-2xl bg-ochre-soft p-5">
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
