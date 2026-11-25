import rawPhrases from './phrases.json';

export type PhraseCategory =
  | 'Kitchen Tools'
  | 'Ingredients'
  | 'Cooking Actions'
  | 'Common Phrases';

export interface PhraseItem {
  id: string;
  category: PhraseCategory;
  swahili: string;
  english: string;
  pronunciation: string;
  example: string;
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  'Kitchen Tools',
  'Ingredients',
  'Cooking Actions',
  'Common Phrases',
];

export const PHRASES: PhraseItem[] = rawPhrases as PhraseItem[];
