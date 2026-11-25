import { Volume2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Disclosure,
  PageHeader,
  Select,
} from '../../components/ui';
import { GRAMMAR_LESSONS } from '../../data/grammar';
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

  const activeIndex = GRAMMAR_LESSONS.indexOf(activeLesson);
  const nextLesson = GRAMMAR_LESSONS[(activeIndex + 1) % GRAMMAR_LESSONS.length];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Sarufi"
        title="Grammar"
        description="Short lessons for forming natural sentences in the kitchen and at the table."
      />

      <div className="space-y-6">
        <Select
          aria-label="Choose a lesson"
          value={activeLesson.id}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {GRAMMAR_LESSONS.map((lesson, idx) => (
            <option key={lesson.id} value={lesson.id}>
              Lesson {idx + 1}: {lesson.title}
            </option>
          ))}
        </Select>

        <Card className="space-y-10">
          <div className="space-y-3">
            <p className="text-sm text-terracotta">
              {activeLesson.swahiliTitle} · {activeLesson.level}
            </p>
            <h2 className="text-2xl font-semibold leading-snug text-charcoal">
              {activeLesson.title}
            </h2>
            <p className="text-base leading-relaxed text-charcoal-muted">
              {activeLesson.summary}
            </p>
          </div>

          <div className="rounded-2xl bg-savanna-green-soft/60 p-6">
            <h3 className="text-sm font-semibold text-savanna-green">Key rule</h3>
            <p className="mt-2 text-base leading-relaxed text-charcoal">
              {activeLesson.keyRule}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold leading-snug text-charcoal">Examples</h3>
            <ul className="mt-2 divide-y divide-warm-border/60">
              {activeLesson.examples.map((ex) => (
                <li
                  key={ex.swahili}
                  className="flex items-start justify-between gap-3 py-5"
                >
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-charcoal">{ex.swahili}</p>
                    <p className="text-sm text-terracotta">{ex.english}</p>
                    {ex.note && (
                      <p className="text-xs text-charcoal-muted">{ex.note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakSwahili(ex.swahili)}
                    aria-label={`Listen to ${ex.swahili}`}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-charcoal-muted hover:bg-cream-dark/60 hover:text-charcoal"
                  >
                    <Volume2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Disclosure key={activeLesson.id} label="Show a tip">
            <p className="text-center text-sm leading-relaxed text-charcoal-muted">
              {activeLesson.tip}
            </p>
          </Disclosure>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              setSelectedId(nextLesson.id);
              window.scrollTo({ top: 0 });
            }}
          >
            Next lesson
          </Button>
        </Card>
      </div>
    </div>
  );
}
