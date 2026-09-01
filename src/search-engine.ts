import { InvertedIndex } from "./inverted-index.js";

export class SearchEngine {
  constructor(private readonly index: InvertedIndex) {}

  search(query: string): string[] {
    const term = query.toLowerCase().trim();

    if (!term) {
      return [];
    }

    return [...this.index.getDocuments(term)]; // returns array
  }
}
