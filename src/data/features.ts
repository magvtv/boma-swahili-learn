export type FeatureId =
  | 'translator'
  | 'flashcards'
  | 'quizzes'
  | 'phrasebook'
  | 'grammar'
  | 'community';

export interface FeatureMeta {
  id: FeatureId;
  title: string;
  swahiliTitle: string;
  description: string;
  path: string;
  badge: string;
  tone: 'green' | 'terracotta' | 'ochre';
}

export const FEATURES: FeatureMeta[] = [
  {
    id: 'translator',
    title: 'Translator',
    swahiliTitle: 'Mtafsiri',
    description:
      'Translate between English and Kiswahili with context-aware culinary, travel, and everyday examples.',
    path: '/translator',
    badge: 'Core Tool',
    tone: 'green',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    swahiliTitle: 'Kadi za Maneno',
    description:
      'Build lasting vocabulary with spaced-repetition decks covering greetings, market bargaining, and food.',
    path: '/flashcards',
    badge: 'Practice',
    tone: 'terracotta',
  },
  {
    id: 'quizzes',
    title: 'Quizzes',
    swahiliTitle: 'Majaribio',
    description:
      'Test your listening, reading, and quick recall through short interactive challenges.',
    path: '/quizzes',
    badge: 'Challenge',
    tone: 'ochre',
  },
  {
    id: 'phrasebook',
    title: 'Phrasebook',
    swahiliTitle: 'Kitabu cha Misemo',
    description:
      'Browse curated Kenyan and coastal Swahili phrases for dining, transport, and warm hospitality.',
    path: '/phrasebook',
    badge: 'Reference',
    tone: 'terracotta',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    swahiliTitle: 'Sarufi',
    description:
      'Master noun classes (ngeli), verb tenses, and sentence structure with clear visual breakdowns.',
    path: '/grammar',
    badge: 'Foundations',
    tone: 'green',
  },
  {
    id: 'community',
    title: 'Community',
    swahiliTitle: 'Jamii',
    description:
      'Connect with fellow learners, share cultural notes, and practice conversational Kiswahili together.',
    path: '/community',
    badge: 'Social',
    tone: 'ochre',
  },
];
