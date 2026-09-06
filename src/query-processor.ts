import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";

export class QueryProcessor {
  process(query: string): string[] {
    if (!query.trim()) {
      return [];
    }

    const tokens = tokenizer(query);

    const normalizedTokens = normalizeTokens(tokens);

    return removeStopWords(normalizedTokens);
  }

  processPhrase(phrase: string): string[] {
    if (!phrase.trim()) {
      return [];
    }

    const tokens = tokenizer(phrase);

    return normalizeTokens(tokens);
  }
}

export type QueryToken =
  | {
      type: "TERM";
      value: string;
    }
  | {
      type: "OPERATOR";
      value: "AND" | "OR" | "NOT";
    };
