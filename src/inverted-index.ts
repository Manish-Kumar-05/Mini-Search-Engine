export class InvertedIndex {
  private index: Map<string, Map<string, number>> = new Map();

  private documentCount = 0;

  private documentLengths: Map<string, number> = new Map();

  addDocument(documentId: string, tokens: string[]): void {
    this.documentCount++;

    this.documentLengths.set(documentId, tokens.length);

    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Map());
      }

      const documents = this.index.get(token)!;

      const currentFrequency = documents.get(documentId) ?? 0;

      documents.set(documentId, currentFrequency + 1);
    }
  }

  getDocuments(token: string): Set<string> {
    return new Set(this.index.get(token)?.keys() ?? []);
  }

  getTermFrequency(token: string, documentId: string): number {
    return this.index.get(token)?.get(documentId) ?? 0;
  }

  getDocumentFrequency(token: string): number {
    return this.index.get(token)?.size ?? 0;
  }

  getDocumentCount(): number {
    return this.documentCount;
  }

  getDocumentLength(documentId: string): number {
    return this.documentLengths.get(documentId) ?? 0;
  }

  getTerms(): string[] {
    return [...this.index.keys()];
  }

  getAverageDocumentLength(): number {
    if (this.documentCount === 0) {
      return 0;
    }

    let totalLength = 0;

    for (const length of this.documentLengths.values()) {
      totalLength += length;
    }

    return totalLength / this.documentCount;
  }
}
