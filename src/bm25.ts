import { InvertedIndex } from "./inverted-index.js";

export class BM25 {
  private readonly k1: number;
  private readonly b: number;

  constructor(
    private readonly index: InvertedIndex,
    k1 = 1.2,
    b = 0.75
  ) {
    this.k1 = k1;
    this.b = b;
  }

  calculateIdf(term: string): number {
    const documentFrequency = this.index.getDocumentFrequency(term);

    const totalDocuments = this.index.getDocumentCount();

    if (documentFrequency === 0) {
      return 0;
    }

    return Math.log(
      1 + (totalDocuments - documentFrequency + 0.5) / (documentFrequency + 0.5)
    );
  }

  calculateTermScore(term: string, documentId: string): number {
    const frequency = this.index.getTermFrequency(term, documentId);

    if (frequency === 0) {
      return 0;
    }

    const documentLength = this.index.getDocumentLength(documentId);

    const averageDocumentLength = this.index.getAverageDocumentLength();

    if (documentLength === 0 || averageDocumentLength === 0) {
      return 0;
    }

    const idf = this.calculateIdf(term);

    const lengthNormalization =
      1 - this.b + this.b * (documentLength / averageDocumentLength);

    const denominator = frequency + this.k1 * lengthNormalization;

    const numerator = frequency * (this.k1 + 1);

    return idf * (numerator / denominator);
  }

  calculate(terms: string[], documentId: string): number {
    let score = 0;

    for (const term of terms) {
      score += this.calculateTermScore(term, documentId);
    }

    return score;
  }
}
