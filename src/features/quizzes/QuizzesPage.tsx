import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Input, ProgressBar } from '../../components/ui';
import { PHRASE_CATEGORIES, type PhraseCategory } from '../../data/phrases';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ochre-soft text-charcoal">
              <ClipboardCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                Majaribio
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-charcoal">
                Culinary Swahili Quizzes
              </h1>
            </div>
          </div>
          <p className="text-sm text-charcoal-muted">
            Test your culinary vocabulary with multiple-choice and typed translation
            challenges.
          </p>
        </div>

        <Badge tone="ochre">
          Best: {highScores.bestPercentage}% ({highScores.bestScore} pts)
        </Badge>
      </div>

      {/* Setup Stage */}
      {stage === 'setup' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-6 p-6 lg:col-span-2">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-charcoal">
                1. Choose Category
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['All', ...PHRASE_CATEGORIES] as const).map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                        active
                          ? 'border-savanna-green bg-savanna-green text-cream'
                          : 'border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark hover:text-charcoal',
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-charcoal">
                2. Question Format
              </h2>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {(['mixed', 'multiple-choice', 'type-translation'] as const).map(
                  (itemMode) => {
                    const active = mode === itemMode;
                    return (
                      <button
                        key={itemMode}
                        type="button"
                        onClick={() => setMode(itemMode)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors',
                          active
                            ? 'border-terracotta bg-terracotta-soft text-terracotta-hover'
                            : 'border-warm-border bg-cream/50 text-charcoal-muted hover:bg-cream-dark',
                        )}
                      >
                        {MODE_LABELS[itemMode]}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-charcoal">
                3. Number of Questions
              </h2>
              <div className="flex gap-2.5">
                {[5, 10].map((count) => {
                  const active = questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      aria-pressed={active}
                      className={cn(
                        'rounded-xl border px-4 py-2 text-xs font-semibold transition-colors',
                        active
                          ? 'border-savanna-green bg-savanna-green-soft text-savanna-green'
                          : 'border-warm-border bg-surface text-charcoal-muted hover:bg-cream-dark',
                      )}
                    >
                      {count} Questions
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={startQuiz}
                leftIcon={<Play className="size-4" aria-hidden="true" />}
              >
                Start Quiz
              </Button>
            </div>
          </Card>

          {/* High Score Summary */}
          <Card className="flex flex-col justify-between space-y-5 bg-cream/60 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-savanna-green">
                <Trophy className="size-5" aria-hidden="true" />
                <h2 className="text-base font-bold text-charcoal">Your Records</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-warm-border bg-surface p-3.5">
                  <p className="text-xs text-charcoal-muted">Best Accuracy</p>
                  <p className="mt-1 text-xl font-bold text-savanna-green">
                    {highScores.bestPercentage}%
                  </p>
                </div>
                <div className="rounded-xl border border-warm-border bg-surface p-3.5">
                  <p className="text-xs text-charcoal-muted">Best Score</p>
                  <p className="mt-1 text-xl font-bold text-terracotta">
                    {highScores.bestScore}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-warm-border bg-surface p-3.5 text-xs text-charcoal-muted">
                <p>
                  Quizzes completed:{' '}
                  <strong className="text-charcoal">
                    {highScores.quizzesCompleted}
                  </strong>
                </p>
                {highScores.lastScore !== null && highScores.lastTotal !== null && (
                  <p className="mt-1">
                    Last attempt:{' '}
                    <strong className="text-charcoal">
                      {highScores.lastScore} / {highScores.lastTotal}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-charcoal-muted">
              High scores are saved automatically in your browser’s local storage.
            </p>
          </Card>
        </div>
      )}

      {/* Active Quiz Stage */}
      {stage === 'active' && activeQuestion && (
        <div className="mx-auto max-w-2xl space-y-5">
          <Card className="p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-charcoal-muted">
              <span>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span>
                Score: <strong className="text-savanna-green">{correctCount}</strong>
              </span>
            </div>
            <ProgressBar
              value={currentIdx + (submittedRecord ? 1 : 0)}
              max={questions.length}
              showPercentage={false}
              tone="green"
            />
          </Card>

          <Card className="space-y-6 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Badge tone="neutral">{activeQuestion.phrase.category}</Badge>
                <p className="text-xs font-medium text-charcoal-muted">
                  {activeQuestion.promptLabel}
                </p>
                <h2 className="text-2xl font-bold text-charcoal">
                  {activeQuestion.promptText}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => speakSwahili(activeQuestion.phrase.swahili)}
                aria-label={`Listen to ${activeQuestion.phrase.swahili}`}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-warm-border bg-cream text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
              >
                <Volume2 className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Multiple Choice */}
            {activeQuestion.kind === 'multiple-choice' && activeQuestion.options && (
              <div className="grid gap-2.5 sm:grid-cols-2">
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
                        'flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                        !submittedRecord &&
                          'border-warm-border bg-cream/40 text-charcoal hover:border-savanna-green hover:bg-savanna-green-soft/40',
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
                          'border-warm-border bg-surface text-charcoal-muted opacity-60',
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
              <form onSubmit={handleTypedSubmit} className="space-y-3">
                <Input
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
                    size="md"
                    disabled={!typedInput.trim()}
                  >
                    Check Answer
                  </Button>
                )}
              </form>
            )}

            {/* Feedback & Next */}
            {submittedRecord && (
              <div className="space-y-4 border-t border-warm-border pt-4">
                <div
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm',
                    submittedRecord.isCorrect
                      ? 'bg-savanna-green-soft text-savanna-green'
                      : 'bg-terracotta-soft text-terracotta-hover',
                  )}
                >
                  {submittedRecord.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {submittedRecord.isCorrect ? 'Sahihi! Correct.' : 'Not quite.'}
                    </p>
                    {submittedRecord.note && (
                      <p className="mt-0.5 text-xs font-medium">
                        {submittedRecord.note}
                      </p>
                    )}
                    {!submittedRecord.isCorrect && (
                      <p className="mt-0.5 text-xs">
                        Correct answer:{' '}
                        <strong>{activeQuestion.correctAnswer}</strong>
                      </p>
                    )}
                    <p className="mt-1 text-xs opacity-90">
                      Example: {activeQuestion.phrase.example}
                    </p>
                  </div>
                </div>

                <Button variant="primary" size="md" onClick={handleNextQuestion}>
                  {currentIdx + 1 < questions.length
                    ? 'Next Question'
                    : 'See Results'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && (
        <div className="mx-auto max-w-2xl space-y-6">
          {(() => {
            const total = questions.length;
            const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const feedback = getScoreFeedback(percentage);

            return (
              <Card className="space-y-5 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="size-6 text-terracotta" aria-hidden="true" />
                      <h2 className="text-xl font-bold text-charcoal">
                        {feedback.title}
                      </h2>
                    </div>
                    <p className="text-sm text-charcoal-muted">{feedback.message}</p>
                  </div>

                  {isNewBest && <Badge tone="ochre">New High Score!</Badge>}
                </div>

                <div className="rounded-2xl bg-cream p-5">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-charcoal-muted">
                      Final Score
                    </span>
                    <span className="text-2xl font-bold text-savanna-green">
                      {correctCount} / {total} ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={correctCount}
                    max={total}
                    showPercentage={false}
                    tone="green"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={startQuiz}
                    leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
                  >
                    Restart Quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setStage('setup')}
                  >
                    Change Settings
                  </Button>
                </div>
              </Card>
            );
          })()}

          {/* Answer Review */}
          <section aria-labelledby="review-heading" className="space-y-3">
            <h3 id="review-heading" className="text-base font-bold text-charcoal">
              Answer Review
            </h3>
            <div className="space-y-2.5">
              {answers.map((record) => (
                <Card
                  key={record.question.id}
                  className={cn(
                    'flex items-start justify-between gap-3 p-4',
                    record.isCorrect
                      ? 'border-savanna-green/30'
                      : 'border-terracotta/30',
                  )}
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-charcoal">
                      {record.question.promptText}
                    </p>
                    <p className="text-xs text-charcoal-muted">
                      Your answer:{' '}
                      <span
                        className={
                          record.isCorrect
                            ? 'font-medium text-savanna-green'
                            : 'font-medium text-terracotta'
                        }
                      >
                        {record.userAnswer}
                      </span>
                    </p>
                    {!record.isCorrect && (
                      <p className="text-xs text-charcoal-muted">
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
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="size-5 shrink-0 text-terracotta"
                      aria-hidden="true"
                    />
                  )}
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
