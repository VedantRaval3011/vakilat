export type TranslationSummary = {
  id: string;
  title: string;
  targetLang: string;
  rating: number | null;
  createdAt: string;
};

export type Translation = TranslationSummary & {
  sourceLang: string;
  sourceText: string;
  resultText: string;
  sourceName: string | null;
};
