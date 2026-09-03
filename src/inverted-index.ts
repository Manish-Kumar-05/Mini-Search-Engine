export class InvertedIndex {
  private index: Map<string, Map<string, number>> = new Map();

  addDocument(documentId: string, tokens: string[]): void {
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
}

// Map<
//   string,                 // token
//   Map<
//     string,               // documentId
//     number                // frequency
//   >
// >
