import { PHRASES, type PhraseCategory, type PhraseItem } from '../../data/phrases';
import type { QuizHighScores, QuizMode, QuizQuestion } from './types';

const HIGH_SCORE_STORAGE_KEY = 'boma_quiz_highscores_v1';

const DEFAULT_HIGH_SCORES: QuizHighScores = {
  bestScore: 0,
  bestPercentage: 0,
  quizzesCompleted: 0,
  lastScore: null,
  lastTotal: null,
};

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ');
}

function buildAcceptedAnswers(english: string, swahili: string, isSwahiliTarget: boolean): string[] {
  const target = isSwahiliTarget ? swahili : english;
  const parts = target
    .split('/')
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);

  const normalizedFull = normalizeAnswer(target);
  const set = new Set<string>([normalizedFull, ...parts]);

  // Also allow omitting leading "to " for English infinitives like "To chop / cut"
  if (!isSwahiliTarget) {
    for (const item of [...set]) {
      if (item.startsWith('to ')) {
        set.add(item.slice(3).trim());
      }
    }
  }

  return [...set];
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuizQuestions(
  category: 'All' | PhraseCategory,
  mode: QuizMode,
  requestedCount: number,
): QuizQuestion[] {
  const pool =
    category === 'All'
      ? PHRASES
      : PHRASES.filter((phrase) => phrase.category === category);

  const selected = shuffleArray(pool).slice(0, Math.min(requestedCount, pool.length));

  return selected.map((phrase: PhraseItem, index: number) => {
    const kind =
      mode === 'mixed'
        ? index % 2 === 0
          ? 'multiple-choice'
          : 'type-translation'
        : mode;

    if (kind === 'multiple-choice') {
      const distractors = shuffleArray(
        PHRASES.filter((candidate) => candidate.id !== phrase.id),
      )
        .slice(0, 3)
        .map((candidate) => candidate.english);

      const options = shuffleArray([phrase.english, ...distractors]);

      return {
        id: `${phrase.id}-${index}`,
        kind: 'multiple-choice',
        phrase,
        promptLabel: 'What does this Kiswahili phrase mean?',
        promptText: phrase.swahili,
        options,
        correctAnswer: phrase.english,
        acceptedAnswers: [normalizeAnswer(phrase.english)],
      };
    }

    // Alternate direction in type-translation: even -> Kiswahili to English, odd -> English to Kiswahili
    const askForSwahili = index % 2 === 1;
    return {
      id: `${phrase.id}-${index}`,
      kind: 'type-translation',
      phrase,
      promptLabel: askForSwahili
        ? 'Type the Kiswahili translation'
        : 'Type the English translation',
      promptText: askForSwahili ? phrase.english : phrase.swahili,
      correctAnswer: askForSwahili ? phrase.swahili : phrase.english,
      acceptedAnswers: buildAcceptedAnswers(phrase.english, phrase.swahili, askForSwahili),
    };
  });
}

export function getQuizHighScores(): QuizHighScores {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (!raw) return DEFAULT_HIGH_SCORES;
    const parsed = JSON.parse(raw) as Partial<QuizHighScores>;
    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      bestPercentage:
        typeof parsed.bestPercentage === 'number' ? parsed.bestPercentage : 0,
      quizzesCompleted:
        typeof parsed.quizzesCompleted === 'number' ? parsed.quizzesCompleted : 0,
      lastScore: typeof parsed.lastScore === 'number' ? parsed.lastScore : null,
      lastTotal: typeof parsed.lastTotal === 'number' ? parsed.lastTotal : null,
    };
  } catch {
    return DEFAULT_HIGH_SCORES;
  }
}

export function recordQuizResult(
  score: number,
  total: number,
): { scores: QuizHighScores; isNewBest: boolean } {
  const current = getQuizHighScores();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isNewBest = percentage > current.bestPercentage || score > current.bestScore;

  const updated: QuizHighScores = {
    bestScore: Math.max(current.bestScore, score),
    bestPercentage: Math.max(current.bestPercentage, percentage),
    quizzesCompleted: current.quizzesCompleted + 1,
    lastScore: score,
    lastTotal: total,
  };

  try {
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or private mode errors
  }

  return { scores: updated, isNewBest };
}
