export type LanguageCode = 'en' | 'sw';

export interface TranslationEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  from: LanguageCode;
  to: LanguageCode;
  timestamp: number;
}

export interface TranslationResult {
  translatedText: string;
  fromCache: boolean;
  entry: TranslationEntry;
}
