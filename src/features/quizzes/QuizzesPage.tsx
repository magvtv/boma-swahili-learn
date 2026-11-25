import { CheckCircle2, Volume2, XCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Card,
  Disclosure,
  Input,
  PageHeader,
  ProgressBar,
} from '../../components/ui';
import {
  PHRASES,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from '../../data/phrases';
import { cn } from '../../utils/cn';
import { speakSwahili } from '../../utils/speech';
import {
  generateQuizQuestions,
  getQuizHighScores,
  normalizeAnswer,
  recordQuizResult,
} from './quizUtils';
import type {
  QuizAnswerRecord,
  QuizHighScores,
  QuizMode,
  QuizQuestion,
} from './types';

type QuizStage = 'setup' | 'active' | 'results';

const MODE_LABELS: Record<QuizMode, string> = {
  mixed: 'Mixed (Choice + Typed)',
  'multiple-choice': 'Multiple Choice',
  'type-translation': 'Type Translation',
};

function getScoreFeedback(percentage: number): { title: string; message: string } {
  if (percentage >= 90) {
    return {
      title: 'Hongera sana! (Congratulations!)',
      message: 'Outstanding mastery of Kenyan culinary Kiswahili.',
    };
  }
  if (percentage >= 70) {
    return {
      title: 'Vizuri sana! (Very good!)',
      message: 'Great recall—keep practicing to lock in every phrase.',
    };
  }
  if (percentage >= 50) {
    return {
      title: 'Umefanya vizuri! (Good effort!)',
      message: 'Review the missed phrases in the Phrasebook and try again.',
    };
  }
  return {
    title: 'Endelea kujaribu! (Keep trying!)',
    message: 'Spend a few minutes with Flashcards and come back stronger.',
  };
}

function chipClass(active: boolean): string {
  return cn(
    'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
    active
      ? 'border-savanna-green bg-savanna-green text-cream'
      : 'border-warm-border/70 bg-surface text-charcoal-muted hover:text-charcoal',
  );
}

export function QuizzesPage() {
  const [stage, setStage] = useState<QuizStage>('setup');
  const [category, setCategory] = useState<'All' | PhraseCategory>('All');
  const [mode, setMode] = useState<QuizMode>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<QuizAnswerRecord | null>(null);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [highScores, setHighScores] = useState<QuizHighScores>(() =>
    getQuizHighScores(),
  );
  const [isNewBest, setIsNewBest] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeQuestion = questions[currentIdx];

  const startQuiz = () => {
    const generated = generateQuizQuestions(category, mode, questionCount);
    setQuestions(generated);
    setCurrentIdx(0);
    setTypedInput('');
    setSubmittedRecord(null);
    setAnswers([]);
    setIsNewBest(false);
    setStage('active');
  };

  const handleMultipleChoiceAnswer = (option: string) => {
    if (!activeQuestion || submittedRecord) return;
    const isCorrect =
      normalizeAnswer(option) === normalizeAnswer(activeQuestion.correctAnswer);
    const record: QuizAnswerRecord = {
      question: activeQuestion,
      userAnswer: option,
      isCorrect,
    };
    setSubmittedRecord(record);
    setAnswers((prev) => [...prev, record]);
  };

  const handleTypedSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeQuestion || submittedRecord || !typedInput.trim()) return;
    const normalized = normalizeAnswer(typedInput);
    const isCorrect = activeQuestion.acceptedAnswers.includes(normalized);
    const isExact = normalized === normalizeAnswer(activeQuestion.correctAnswer);
    const note =
      isCorrect && !isExact
        ? `Accepted! Full form: ${activeQuestion.correctAnswer}`
        : undefined;

    const record: QuizAnswerRecord = {
      question: activeQuestion,
      userAnswer: typedInput.trim(),
      isCorrect,
      note,
    };
    setSubmittedRecord(record);
    setAnswers((prev) => [...prev, record]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((idx) => idx + 1);
      setTypedInput('');
      setSubmittedRecord(null);
      return;
    }

    const finalScore = answers.filter((a) => a.isCorrect).length;
    const result = recordQuizResult(finalScore, questions.length);
    setHighScores(result.scores);
    setIsNewBest(result.isNewBest);
    setStage('results');
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;

  // A single category can hold fewer phrases than the requested count
  const availableCount = Math.min(
    questionCount,
    PHRASES.filter((p) => category === 'All' || p.category === category).length,
  );

  return (
    <div className="mx-auto max-w-xl space-y-10">
      {stage === 'active' ? (
        <h1 className="sr-only">Quiz in progress</h1>
      ) : (
        <PageHeader eyebrow="Majaribio" title="Quizzes" quiet />
      )}

      {/* Setup Stage */}
      {stage === 'setup' && (
        <div className="space-y-6">
          <Card className="py-16 text-center sm:py-20">
            <h2 className="text-3xl font-semibold leading-snug text-charcoal">
              {availableCount} questions
            </h2>
            <p className="mt-3 text-sm text-charcoal-muted">
              {category === 'All' ? 'All categories' : category} · {MODE_LABELS[mode]}
            </p>
            <Button variant="primary" size="lg" className="mt-10" onClick={startQuiz}>
              Start Quiz
            </Button>
          </Card>

          <Disclosure label="Change settings" defaultOpen={settingsOpen}>
            <div className="space-y-10 text-center">
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-charcoal">Category</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {(['All', ...PHRASE_CATEGORIES] as const).map((cat) => {
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        aria-pressed={active}
                        className={chipClass(active)}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold text-charcoal">Question format</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {(['mixed', 'multiple-choice', 'type-translation'] as const).map(
                    (itemMode) => (
                      <button
                        key={itemMode}
                        type="button"
                        onClick={() => setMode(itemMode)}
                        aria-pressed={mode === itemMode}
                        className={chipClass(mode === itemMode)}
                      >
                        {MODE_LABELS[itemMode]}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold text-charcoal">Length</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {[5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      aria-pressed={questionCount === count}
                      className={chipClass(questionCount === count)}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Disclosure>

          {highScores.quizzesCompleted > 0 && (
            <p className="text-center text-xs text-charcoal-muted">
              Best {highScores.bestPercentage}% · {highScores.quizzesCompleted} completed
              {highScores.lastScore !== null &&
                highScores.lastTotal !== null &&
                ` · Last ${highScores.lastScore} / ${highScores.lastTotal}`}
            </p>
          )}
        </div>
      )}

      {/* Active Quiz Stage */}
      {stage === 'active' && activeQuestion && (
        <div className="space-y-14">
          <div className="space-y-3">
            <ProgressBar
              value={currentIdx + (submittedRecord ? 1 : 0)}
              max={questions.length}
              showPercentage={false}
              tone="green"
            />
            <p className="text-center text-xs text-charcoal-muted">
              Question {currentIdx + 1} of {questions.length}
            </p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4 text-center">
              <p className="text-sm text-charcoal-muted">{activeQuestion.promptLabel}</p>
              <h2 className="text-3xl font-semibold leading-snug text-balance text-charcoal sm:text-4xl">
                {activeQuestion.promptText}
              </h2>
              <button
                type="button"
                onClick={() => speakSwahili(activeQuestion.phrase.swahili)}
                aria-label={`Listen to ${activeQuestion.phrase.swahili}`}
                className="mx-auto flex size-10 items-center justify-center rounded-full text-charcoal-muted hover:bg-cream-dark/60 hover:text-charcoal"
              >
                <Volume2 className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Multiple Choice */}
            {activeQuestion.kind === 'multiple-choice' && activeQuestion.options && (
              <div className="grid gap-3">
                {activeQuestion.options.map((option) => {
                  const isSelected = submittedRecord?.userAnswer === option;
                  const isCorrectOption =
                    normalizeAnswer(option) ===
                    normalizeAnswer(activeQuestion.correctAnswer);

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(submittedRecord)}
                      onClick={() => handleMultipleChoiceAnswer(option)}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-card border px-6 py-5 text-left text-base font-medium transition-colors',
                        !submittedRecord &&
                          'border-warm-border bg-surface text-charcoal hover:border-savanna-green hover:bg-savanna-green-soft',
                        submittedRecord &&
                          isCorrectOption &&
                          'border-savanna-green bg-savanna-green-soft text-savanna-green',
                        submittedRecord &&
                          isSelected &&
                          !isCorrectOption &&
                          'border-terracotta bg-terracotta-soft text-terracotta-hover',
                        submittedRecord &&
                          !isSelected &&
                          !isCorrectOption &&
                          'border-warm-border/55 bg-surface text-charcoal-muted opacity-60',
                      )}
                    >
                      <span>{option}</span>
                      {submittedRecord && isCorrectOption && (
                        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                      )}
                      {submittedRecord && isSelected && !isCorrectOption && (
                        <XCircle className="size-4 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Type Translation */}
            {activeQuestion.kind === 'type-translation' && (
              <form onSubmit={handleTypedSubmit} className="space-y-6">
                <Input
                  key={activeQuestion.id}
                  label="Your answer"
                  placeholder="Type your translation here..."
                  value={typedInput}
                  disabled={Boolean(submittedRecord)}
                  onChange={(event) => setTypedInput(event.target.value)}
                  autoFocus
                />
                {!submittedRecord && (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!typedInput.trim()}
                  >
                    Check Answer
                  </Button>
                )}
              </form>
            )}

            {/* Feedback & Next */}
            {submittedRecord && (
              <div className="space-y-8">
                <div
                  role="status"
                  className={cn(
                    'rounded-2xl p-5 text-sm leading-relaxed',
                    submittedRecord.isCorrect
                      ? 'bg-savanna-green-soft text-savanna-green'
                      : 'bg-terracotta-soft text-terracotta-hover',
                  )}
                >
                  <p className="font-semibold">
                    {submittedRecord.isCorrect ? 'Sahihi! Correct.' : 'Not quite.'}
                  </p>
                  {submittedRecord.note && (
                    <p className="mt-1">{submittedRecord.note}</p>
                  )}
                  {!submittedRecord.isCorrect && (
                    <p className="mt-1">
                      Correct answer: <strong>{activeQuestion.correctAnswer}</strong>
                    </p>
                  )}
                  <p className="mt-2 opacity-90">
                    Example: {activeQuestion.phrase.example}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleNextQuestion}
                >
                  {currentIdx + 1 < questions.length
                    ? 'Next Question'
                    : 'See Results'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && (
        <div className="space-y-8">
          {(() => {
            const total = questions.length;
            const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const feedback = getScoreFeedback(percentage);

            return (
              <Card className="py-16 text-center sm:py-20">
                <p className="font-serif text-5xl font-semibold text-savanna-green">
                  {correctCount} / {total}
                </p>
                <h2 className="mt-6 text-2xl font-semibold leading-snug text-charcoal">
                  {feedback.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
                  {feedback.message}
                </p>
                {isNewBest && (
                  <p className="mt-3 text-sm font-medium text-terracotta">
                    New high score!
                  </p>
                )}
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <Button variant="primary" size="lg" onClick={startQuiz}>
                    Restart Quiz
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      setSettingsOpen(true);
                      setStage('setup');
                    }}
                  >
                    Change Settings
                  </Button>
                </div>
              </Card>
            );
          })()}

          <Disclosure label="Review your answers">
            <ul className="divide-y divide-warm-border/60">
              {answers.map((record) => (
                <li
                  key={record.question.id}
                  className="flex items-start justify-between gap-4 py-5"
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-charcoal">
                      {record.question.promptText}
                    </p>
                    <p className="text-charcoal-muted">
                      Your answer: {record.userAnswer}
                    </p>
                    {!record.isCorrect && (
                      <p className="text-charcoal-muted">
                        Correct:{' '}
                        <strong className="text-charcoal">
                          {record.question.correctAnswer}
                        </strong>
                      </p>
                    )}
                  </div>
                  {record.isCorrect ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-savanna-green"
                      aria-label="Correct"
                    />
                  ) : (
                    <XCircle
                      className="size-5 shrink-0 text-terracotta"
                      aria-label="Incorrect"
                    />
                  )}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      )}
    </div>
  );
}
