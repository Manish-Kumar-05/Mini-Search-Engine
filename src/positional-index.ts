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

  exportState(): {
    index: [string, [string, number[]][]][];
  } {
    return {
      index: Array.from(this.index.entries()).map(
        ([term, documents]) =>
          [term, Array.from(documents.entries())] as [
            string,
            [string, number[]][],
          ]
      ),
    };
  }

  importState(state: { index: [string, [string, number[]][]][] }): void {
    this.index = new Map(
      state.index.map(([term, documents]) => [term, new Map(documents)])
    );
  }
}
