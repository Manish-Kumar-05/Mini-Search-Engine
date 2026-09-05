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
