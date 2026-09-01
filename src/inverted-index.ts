export class InvertedIndex {
  private index: Map<string, Set<string>> = new Map();

  addDocument(documentId: string, tokens: string[]): void {
    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }

      this.index.get(token)!.add(documentId);
    }
  }

  getDocuments(token: string): Set<string> {
    return this.index.get(token) ?? new Set();
  }
}

// typescript  → {"typescript.txt"}

// python      → {"python.txt"}

// programming → {
//     "typescript.txt",
//     "python.txt"
// }

// language    → {
//     "typescript.txt",
//     "python.txt"
// }
