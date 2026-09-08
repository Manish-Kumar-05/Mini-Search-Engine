import { InvertedIndex } from "./inverted-index.js";
import { tokenizer } from "./tokenizer.js";
import { normalizeTokens } from "./normalizer.js";
import { removeStopWords } from "./stop-words.js";
import { Document, HighlightedResult, SearchResult } from "./types.js";
import { Tfidf } from "./tf-idf.js";
import { cosineSimilarity } from "./cosine-similarity.js";
import { BM25 } from "./bm25.js";
import { QueryProcessor } from "./query-processor.js";
import { QueryNode, QueryParser } from "./query-parser.js";
import { PositionalIndex } from "./positional-index.js";
import { QueryExpander } from "./query-expander.js";
import { SpellCorrector } from "./spell-corrector.js";
import { highlightTerms } from "./highlighter.js";
import { RANKING_WEIGHTS } from "./ranking-config.js";

export class SearchEngine {
  private readonly tfidf: Tfidf;

  private readonly bm25: BM25;

  private readonly queryProcessor: QueryProcessor;

  private readonly queryParser: QueryParser;

  private readonly queryExpander: QueryExpander;

  private readonly spellCorrector: SpellCorrector;

  private readonly positionalIndex: PositionalIndex;

  private readonly index: InvertedIndex;

  private readonly documents: Map<string, Document>;

  constructor(
    index: InvertedIndex,
    positionalIndex: PositionalIndex,
    documents: Document[]
  ) {
    this.index = index;
    this.positionalIndex = positionalIndex;

    this.tfidf = new Tfidf(index);

    this.bm25 = new BM25(index);

    this.queryProcessor = new QueryProcessor();

    this.queryParser = new QueryParser();

    this.queryExpander = new QueryExpander();

    this.spellCorrector = new SpellCorrector(index.getTerms());

    this.documents = new Map(
      documents.map((document) => [document.id, document])
    );
  }

  // --------------------------------
  // Basic / Boolean Search
  // --------------------------------

  search(query: string): string[] {
    if (!query.trim()) {
      return [];
    }

    const queryNode = this.queryParser.parse(query);

    const correctedNode = this.correctQueryNode(queryNode);

    return [...this.evaluateQuery(correctedNode)];
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

  searchBM25(query: string, limit = 10): SearchResult[] {
    const originalTerms = this.queryProcessor.process(query);

    if (originalTerms.length === 0) {
      return [];
    }

    const correctedTerms = originalTerms.map((term) => this.correctTerm(term));

    const expandedTerms = this.queryExpander.expand(correctedTerms);

    const candidateDocuments = new Set<string>();

    for (const term of expandedTerms) {
      for (const documentId of this.index.getDocuments(term)) {
        candidateDocuments.add(documentId);
      }
    }

    const results: SearchResult[] = [];

    for (const documentId of candidateDocuments) {
      const score = this.calculateFinalScore(
        query,
        originalTerms,
        correctedTerms,
        expandedTerms,
        documentId
      );

      results.push({
        documentId,
        score,
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
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

  private correctTerm(term: string): string {
    const documents = this.index.getDocuments(term);

    // Exact term exists
    if (documents.size > 0) {
      return term;
    }

    // Try to find a close term
    return this.spellCorrector.findClosestTerm(term) ?? term;
  }

  private correctQueryNode(node: QueryNode): QueryNode {
    switch (node.type) {
      case "TERM":
        return {
          type: "TERM",
          value: this.correctTerm(node.value),
        };

      case "AND":
      case "OR":
        return {
          type: node.type,
          left: this.correctQueryNode(node.left),
          right: this.correctQueryNode(node.right),
        };

      case "NOT":
        return {
          type: "NOT",
          child: this.correctQueryNode(node.child),
        };
    }
  }

  highlightResults(
    results: SearchResult[],
    query: string
  ): HighlightedResult[] {
    const processedTerms = this.queryProcessor.process(query);

    const correctedTerms = processedTerms.map((term) => this.correctTerm(term));

    const expandedTerms = this.queryExpander.expand(correctedTerms);

    return results.map((result) => {
      const document = this.documents.get(result.documentId);

      if (!document) {
        return {
          documentId: result.documentId,
          score: result.score,
          snippet: "",
        };
      }

      return {
        documentId: result.documentId,
        score: result.score,
        snippet: highlightTerms(document.content, expandedTerms),
      };
    });
  }

  private hasPhraseMatch(terms: string[], documentId: string): boolean {
    if (terms.length === 0) {
      return false;
    }

    const firstTerm = terms[0];

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
        return true;
      }
    }

    return false;
  }

  private calculateNameBoost(terms: string[], documentId: string): number {
    const document = this.documents.get(documentId);

    if (!document) {
      return 0;
    }

    const normalizedName = document.name.toLowerCase();

    let boost = 0;

    for (const term of terms) {
      if (normalizedName.includes(term.toLowerCase())) {
        boost += RANKING_WEIGHTS.name;
      }
    }

    return boost;
  }

  private calculateFinalScore(
    query: string,
    originalTerms: string[],
    correctedTerms: string[],
    expandedTerms: string[],
    documentId: string
  ): number {
    const bm25Score = this.bm25.calculate(expandedTerms, documentId);

    const exactMatchBoost = originalTerms.every((term) =>
      correctedTerms.includes(term)
    )
      ? this.calculateExactMatchBoost(originalTerms, documentId)
      : 0;

    // Phrase match
    const phraseTerms = this.getPhraseTerms(query);

    let phraseBoost = 0;

    if (
      phraseTerms.length > 1 &&
      this.hasPhraseMatch(phraseTerms, documentId)
    ) {
      phraseBoost = RANKING_WEIGHTS.phrase;
    }

    // Document-name match
    const nameBoost = this.calculateNameBoost(correctedTerms, documentId);

    return bm25Score + exactMatchBoost + phraseBoost + nameBoost;
  }

  private calculateExactMatchBoost(
    terms: string[],
    documentId: string
  ): number {
    let boost = 0;

    for (const term of terms) {
      const frequency = this.index.getTermFrequency(term, documentId);

      if (frequency > 0) {
        boost += RANKING_WEIGHTS.exactMatch * Math.log1p(frequency);
      }
    }

    return boost;
  }

  private getPhraseTerms(query: string): string[] {
    return this.queryProcessor.processPhrase(query);
  }
}
