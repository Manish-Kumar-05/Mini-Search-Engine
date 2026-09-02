import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { intersection, union, difference } from "./set-operations.js";

export class SearchEngine {
  constructor(private readonly index: InvertedIndex) {}

  search(query: string): string[] {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const parts = trimmedQuery.split(/\s+/);

    if (parts.length === 1) {
      return [...this.getDocumentsForTerm(parts[0])];
    }

    if (parts.length !== 3) {
      throw new Error("Invalid query. Use: term OPERATOR term");
    }

    const left = this.getDocumentsForTerm(parts[0]);

    const operator = parts[1].toUpperCase();

    const right = this.getDocumentsForTerm(parts[2]);

    switch (operator) {
      case "AND":
        return [...intersection(left, right)];

      case "OR":
        return [...union(left, right)];

      case "NOT":
        return [...difference(left, right)];

      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private getDocumentsForTerm(term: string): Set<string> {
    const tokens = tokenizer(term);
    const normalizedTokens = normalizeTokens(tokens);
    const filteredTokens = removeStopWords(normalizedTokens);

    if (filteredTokens.length === 0) {
      return new Set();
    }

    return this.index.getDocuments(filteredTokens[0]);
  }
}
