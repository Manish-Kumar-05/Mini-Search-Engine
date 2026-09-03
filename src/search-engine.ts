import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { SearchResult } from "./types.js";

export class SearchEngine {
  constructor(private readonly index: InvertedIndex) {}

  search(query: string): string[] {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const parts = trimmedQuery.split(/\s+/);

    if (parts.length === 0) {
      return [];
    }

    if (parts.length === 1) {
      return [...this.getDocumentsForTerm(parts[0])];
    }

    const left = this.getDocumentsForTerm(parts[0]);
    const operator = parts[1].toUpperCase();
    const right = this.getDocumentsForTerm(parts[2]);

    switch (operator) {
      case "AND":
        return [...this.intersection(left, right)];

      case "OR":
        return [...this.union(left, right)];

      case "NOT":
        return [...this.difference(left, right)];

      default:
        throw new Error("Invalid query. Use: term OPERATOR term");
    }
  }

  searchRanked(query: string): SearchResult[] {
    const tokens = tokenizer(query);
    const normalizedTokens = normalizeTokens(tokens);
    const terms = removeStopWords(normalizedTokens);

    if (terms.length === 0) {
      return [];
    }

    const term = terms[0];

    const documents = this.index.getDocuments(term);

    const results: SearchResult[] = [];

    for (const documentId of documents) {
      const frequency = this.index.getTermFrequency(term, documentId);

      results.push({
        documentId,
        score: frequency,
      });
    }

    return results.sort((a, b) => b.score - a.score);
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

  private intersection(first: Set<string>, second: Set<string>): Set<string> {
    return new Set([...first].filter((documentId) => second.has(documentId)));
  }

  private union(first: Set<string>, second: Set<string>): Set<string> {
    return new Set([...first, ...second]);
  }

  private difference(first: Set<string>, second: Set<string>): Set<string> {
    return new Set([...first].filter((documentId) => !second.has(documentId)));
  }
}
