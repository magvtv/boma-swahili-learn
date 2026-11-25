import type { PhraseCategory, PhraseItem } from '../../data/phrases';

export type QuizMode = 'mixed' | 'multiple-choice' | 'type-translation';

export type QuestionKind = 'multiple-choice' | 'type-translation';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  phrase: PhraseItem;
  promptLabel: string;
  promptText: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
}

export interface QuizAnswerRecord {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  note?: string;
}

export interface QuizHighScores {
  bestScore: number;
  bestPercentage: number;
  quizzesCompleted: number;
  lastScore: number | null;
  lastTotal: number | null;
}

export interface QuizConfig {
  category: 'All' | PhraseCategory;
  mode: QuizMode;
  count: number;
}
