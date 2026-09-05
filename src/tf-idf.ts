import { InvertedIndex } from "./inverted-index.js";

export class Tfidf {
  constructor(private readonly index: InvertedIndex) {}

  calculateTf(term: string, documentId: string): number {
    const frequency = this.index.getTermFrequency(term, documentId);

    if (frequency === 0) {
      return 0;
    }

    const documentLength = this.index.getDocumentLength(documentId);

    return frequency / documentLength;
  }

  calculateIdf(term: string): number {
    const documentFrequency = this.index.getDocumentFrequency(term);

    if (documentFrequency === 0) {
      return 0;
    }

    const totalDocuments = this.index.getDocumentCount();

    return Math.log(1 + totalDocuments / documentFrequency);
  }

  calculate(term: string, documentId: string): number {
    const tf = this.calculateTf(term, documentId);

    const idf = this.calculateIdf(term);

    return tf * idf;
  }
}
