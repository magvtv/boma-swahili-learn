export interface GrammarExample {
  swahili: string;
  english: string;
  note?: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  swahiliTitle: string;
  level: 'Beginner' | 'Essential';
  summary: string;
  keyRule: string;
  examples: GrammarExample[];
  tip: string;
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'noun-classes',
    title: 'Noun Classes in the Kitchen (Ngeli)',
    swahiliTitle: 'Ngeli za Majina',
    level: 'Essential',
    summary:
      'Swahili nouns are grouped into classes that determine how adjectives and verbs agree with them. In the kitchen, Ki-/Vi- and N- classes appear constantly.',
    keyRule:
      'Ki- (singular) becomes Vi- (plural) for many tools: kisu → visu (knife → knives), kikombe → vikombe (cup → cups).',
    examples: [
      {
        swahili: 'Kisu kikali / Visu vikali',
        english: 'Sharp knife / Sharp knives',
        note: 'Ki-/Vi- class agreement',
      },
      {
        swahili: 'Chakula kitamu',
        english: 'Delicious food',
        note: 'Ch- is a variant of Ki- before vowels',
      },
      {
        swahili: 'Mpishi / Wapishi',
        english: 'Cook / Cooks',
        note: 'M-/Wa- class for people',
      },
    ],
    tip: 'When you learn a new kitchen noun, learn its plural prefix right away—it unlocks adjective agreement automatically.',
  },
  {
    id: 'verb-tenses',
    title: 'Present, Past & Future Tenses',
    swahiliTitle: 'Nyakati za Vitenzi',
    level: 'Beginner',
    summary:
      'Swahili verbs pack the subject, tense, and action into one smooth word: [Subject] + [Tense] + [Verb Root].',
    keyRule:
      'Use -na- for present (now), -li- for past, and -ta- for future. With "ni-" (I) + "pika" (cook): ninapika, nilipika, nitapika.',
    examples: [
      {
        swahili: 'Ninapika ugali sasa.',
        english: 'I am cooking ugali now.',
        note: 'ni- (I) + -na- (present) + pika',
      },
      {
        swahili: 'Tulikula samaki jana.',
        english: 'We ate fish yesterday.',
        note: 'tu- (we) + -li- (past) + kula',
      },
      {
        swahili: 'Atakaanga maandazi kesho.',
        english: 'She/he will fry maandazi tomorrow.',
        note: 'a- (s/he) + -ta- (future) + kaanga',
      },
    ],
    tip: 'Drop the infinitive "ku-" from verbs like kupika or kukaanga before adding subject and tense prefixes.',
  },
  {
    id: 'polite-requests',
    title: 'Polite Requests & Ordering',
    swahiliTitle: 'Maombi ya Heshima',
    level: 'Beginner',
    summary:
      'Hospitality is central to Kenyan dining. Using "naomba" (I kindly request) or "tafadhali" (please) makes every order warm and natural.',
    keyRule:
      'Start with "Naomba..." (May I have...) or "Tafadhali nipe..." (Please give me...), and always follow with "Asante" (Thank you).',
    examples: [
      {
        swahili: 'Naomba chai ya tangawizi.',
        english: 'May I have ginger tea, please?',
        note: 'Polite everyday restaurant or home phrasing',
      },
      {
        swahili: 'Tafadhali nipitishie chumvi.',
        english: 'Please pass me the salt.',
        note: 'Use at the dining table',
      },
      {
        swahili: 'Samahani, bili tafadhali.',
        english: 'Excuse me, the bill please.',
        note: 'Polite way to ask for the check',
      },
    ],
    tip: 'Adding "samahani" (excuse me) before a request is a great way to get a server or host’s attention politely.',
  },
  {
    id: 'describing-taste',
    title: 'Describing Taste & Temperature',
    swahiliTitle: 'Sifa za Chakula',
    level: 'Essential',
    summary:
      'Adjectives in Swahili always come after the noun they describe, and many take a matching prefix.',
    keyRule:
      'Noun first, adjective second: "chai moto" (hot tea), "maji baridi" (cold water), "pilipili kali" (spicy chili).',
    examples: [
      {
        swahili: 'Mchuzi huu ni mtamu sana.',
        english: 'This stew is very delicious.',
        note: 'M- class agreement: m-tamu',
      },
      {
        swahili: 'Sipendi chakula chenye pilipili nyingi.',
        english: 'I do not like food with too much chili.',
        note: 'Useful for dietary preferences',
      },
      {
        swahili: 'Chai bado ni moto.',
        english: 'The tea is still hot.',
        note: '"bado" means still / not yet',
      },
    ],
    tip: 'Notice that borrowed or invariant adjectives like "moto" (hot) and "baridi" (cold) keep the same form across noun classes.',
  },
];
