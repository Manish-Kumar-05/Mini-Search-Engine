import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { SearchResult } from "./types.js";
import { Tfidf } from "./tf-idf.js";
import { cosineSimilarity } from "./cosine-similarity.js";
import { BM25 } from "./bm25.js";
import { QueryProcessor } from "./query-processor.js";

export class SearchEngine {
  private readonly tfidf: Tfidf;

  private readonly bm25: BM25;

  private readonly queryProcessor: QueryProcessor;

  constructor(private readonly index: InvertedIndex) {
    this.tfidf = new Tfidf(index);
    this.bm25 = new BM25(index);

    this.queryProcessor = new QueryProcessor();
  }

  // --------------------------------
  // Basic / Boolean Search
  // --------------------------------

  search(query: string): string[] {
    const parts = query.trim().split(/\s+/);

    if (parts.length === 0 || parts[0] === "") {
      return [];
    }

    // Single term
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
        return [...this.intersection(left, right)];

      case "OR":
        return [...this.union(left, right)];

      case "NOT":
        return [...this.difference(left, right)];

      default:
        throw new Error("Invalid query. Use: term OPERATOR term");
    }
  }

  // --------------------------------
  // Ranked Search
  // --------------------------------

  searchRanked(query: string): SearchResult[] {
    const tokens = tokenizer(query);

    const normalizedTokens = normalizeTokens(tokens);

    const terms = removeStopWords(normalizedTokens);

    if (terms.length === 0) {
      return [];
    }

    // Remove duplicate dimensions
    const vocabulary = [...new Set(terms)];

    // ----------------------------
    // Query term frequency
    // ----------------------------

    const queryFrequency = new Map<string, number>();

    for (const term of terms) {
      const current = queryFrequency.get(term) ?? 0;

      queryFrequency.set(term, current + 1);
    }

    // ----------------------------
    // Query TF-IDF vector
    // ----------------------------

    const queryVector = vocabulary.map((term) => {
      const frequency = queryFrequency.get(term) ?? 0;

      const tf = frequency / terms.length;

      const idf = this.tfidf.calculateIdf(term);

      return tf * idf;
    });

    // ----------------------------
    // Find candidate documents
    // ----------------------------

    const candidateDocuments = new Set<string>();

    for (const term of vocabulary) {
      const documents = this.index.getDocuments(term);

      for (const documentId of documents) {
        candidateDocuments.add(documentId);
      }
    }

    // ----------------------------
    // Rank documents
    // ----------------------------

    const results: SearchResult[] = [];

    for (const documentId of candidateDocuments) {
      const documentVector = vocabulary.map((term) =>
        this.tfidf.calculate(term, documentId)
      );

      const score = cosineSimilarity(queryVector, documentVector);

      results.push({
        documentId,
        score,
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // --------------------------------
  // Helpers
  // --------------------------------

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

  searchBM25(query: string): SearchResult[] {
    const tokens = tokenizer(query);

    const normalizedTokens = normalizeTokens(tokens);

    const terms = removeStopWords(normalizedTokens);

    if (terms.length === 0) {
      return [];
    }

    const candidateDocuments = new Set<string>();

    // Find documents containing
    // at least one query term
    for (const term of terms) {
      const documents = this.index.getDocuments(term);

      for (const documentId of documents) {
        candidateDocuments.add(documentId);
      }
    }

    const results: SearchResult[] = [];

    for (const documentId of candidateDocuments) {
      const score = this.bm25.calculate(terms, documentId);

      results.push({
        documentId,
        score,
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
