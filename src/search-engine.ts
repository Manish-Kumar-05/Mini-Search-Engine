import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { SearchResult } from "./types.js";
import { Tfidf } from "./tf-idf.js";
import { cosineSimilarity } from "./cosine-similarity.js";
import { BM25 } from "./bm25.js";
import { QueryProcessor } from "./query-processor.js";
import { QueryNode, QueryParser } from "./query-parser.js";
import { PositionalIndex } from "./positional-index.js";

export class SearchEngine {
  private readonly tfidf: Tfidf;

  private readonly bm25: BM25;

  private readonly queryProcessor: QueryProcessor;

  private readonly queryParser: QueryParser;

  constructor(
    private readonly index: InvertedIndex,
    private readonly positionalIndex: PositionalIndex
  ) {
    this.tfidf = new Tfidf(index);
    this.bm25 = new BM25(index);
    this.queryProcessor = new QueryProcessor();
    this.queryParser = new QueryParser();
  }

  // --------------------------------
  // Basic / Boolean Search
  // --------------------------------

  search(query: string): string[] {
    if (!query.trim()) {
      return [];
    }

    const queryNode = this.queryParser.parse(query);

    return [...this.evaluateQuery(queryNode)];
  }

  // --------------------------------
  // Ranked Search
  // --------------------------------

  searchRanked(query: string): SearchResult[] {
    const terms = this.queryProcessor.process(query);
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
    const terms = this.queryProcessor.process(query);

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

  private getAllDocuments(): Set<string> {
    const documents = new Set<string>();

    for (const term of this.index.getTerms()) {
      for (const documentId of this.index.getDocuments(term)) {
        documents.add(documentId);
      }
    }

    return documents;
  }

  private evaluateQuery(node: QueryNode): Set<string> {
    switch (node.type) {
      case "TERM":
        return this.getDocumentsForTerm(node.value);

      case "AND": {
        const left = this.evaluateQuery(node.left);

        const right = this.evaluateQuery(node.right);

        return this.intersection(left, right);
      }

      case "OR": {
        const left = this.evaluateQuery(node.left);

        const right = this.evaluateQuery(node.right);

        return this.union(left, right);
      }

      case "NOT": {
        const child = this.evaluateQuery(node.child);

        return this.difference(this.getAllDocuments(), child);
      }
    }
  }

  searchPhrase(phrase: string): string[] {
    const terms = this.queryProcessor.processPhrase(phrase);

    if (terms.length === 0) {
      return [];
    }

    const firstTerm = terms[0];

    const candidateDocuments = this.positionalIndex.getDocuments(firstTerm);

    const results: string[] = [];

    for (const documentId of candidateDocuments) {
      const firstPositions = this.positionalIndex.getPositions(
        firstTerm,
        documentId
      );

      for (const startPosition of firstPositions) {
        let matches = true;

        for (let i = 1; i < terms.length; i++) {
          const positions = this.positionalIndex.getPositions(
            terms[i],
            documentId
          );

          if (!positions.includes(startPosition + i)) {
            matches = false;
            break;
          }
        }

        if (matches) {
          results.push(documentId);
          break;
        }
      }
    }

    return results;
  }
}
