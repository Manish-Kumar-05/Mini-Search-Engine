export class PositionalIndex {
  private index: Map<string, Map<string, number[]>> = new Map();

  addDocument(documentId: string, tokens: string[]): void {
    tokens.forEach((token, position) => {
      if (!this.index.has(token)) {
        this.index.set(token, new Map());
      }

      const documents = this.index.get(token)!;

      if (!documents.has(documentId)) {
        documents.set(documentId, []);
      }

      documents.get(documentId)!.push(position);
    });
  }

  getDocuments(token: string): Set<string> {
    return new Set(this.index.get(token)?.keys() ?? []);
  }

  getPositions(token: string, documentId: string): number[] {
    return this.index.get(token)?.get(documentId) ?? [];
  }
}
