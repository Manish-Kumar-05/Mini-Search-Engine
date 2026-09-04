import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { SearchResult } from "./types.js";
import { calculateIdf } from "./tf-idf.js";

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

    const documentScores = new Map<string, number>();

    for (const term of terms) {
      const documents = this.index.getDocuments(term);

      for (const documentId of documents) {
        const score = this.calculateTfIdf(term, documentId);

        const currentScore = documentScores.get(documentId) ?? 0;

        documentScores.set(documentId, currentScore + score);
      }
    }

    const results: SearchResult[] = [];

    for (const [documentId, score] of documentScores) {
      results.push({
        documentId,
        score,
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

  private calculateTfIdf(term: string, documentId: string): number {
    const frequency = this.index.getTermFrequency(term, documentId);

    if (frequency === 0) {
      return 0;
    }

    const documentLength = this.index.getDocumentLength(documentId);

    const tf = frequency / documentLength;

    const df = this.index.getDocumentFrequency(term);

    const totalDocuments = this.index.getDocumentCount();

    const idf = calculateIdf(totalDocuments, df);

    return tf * idf;
  }
}
