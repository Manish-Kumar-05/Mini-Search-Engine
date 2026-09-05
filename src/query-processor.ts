import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";

export class QueryProcessor {
  process(query: string): string[] {
    const tokens = tokenizer(query);

    const normalizedTokens = normalizeTokens(tokens);

    const filteredTokens = removeStopWords(normalizedTokens);

    return filteredTokens;
  }
}
