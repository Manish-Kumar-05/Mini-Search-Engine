const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "of",
  "to",
  "in",
  "on",
  "for",
  "and",
  "or",
  "but",
  "with",
  "as",
  "at",
  "by",
  "from",
]);

export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}
