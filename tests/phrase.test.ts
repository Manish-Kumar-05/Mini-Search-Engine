import { describe, expect, test } from "vitest";

import { InvertedIndex } from "../src/inverted-index.js";
import { PositionalIndex } from "../src/positional-index.js";
import { SearchEngine } from "../src/search-engine.js";

describe("Phrase Search", () => {
  function createSearchEngine() {
    const index = new InvertedIndex();

    const positionalIndex = new PositionalIndex();

    const documents = [
      {
        id: "doc1.txt",
        name: "Document 1",
        content: "machine learning is useful",
      },
      {
        id: "doc2.txt",
        name: "Document 2",
        content: "learning machine systems",
      },
      {
        id: "doc3.txt",
        name: "Document 3",
        content: "machine learning programming",
      },
    ];

    for (const document of documents) {
      const tokens = document.content.toLowerCase().split(/\s+/);

      index.addDocument(document.id, tokens);

      positionalIndex.addDocument(document.id, tokens);
    }

    return new SearchEngine(index, positionalIndex, documents);
  }

  test("should find exact phrase", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchPhrase("machine learning");

    expect(results).toContain("doc1.txt");

    expect(results).toContain("doc3.txt");

    expect(results).not.toContain("doc2.txt");
  });

  test("should not match reversed phrase", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchPhrase("learning machine");

    expect(results).toContain("doc2.txt");

    expect(results).not.toContain("doc1.txt");

    expect(results).not.toContain("doc3.txt");
  });

  test("should return empty array for missing phrase", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchPhrase("deep learning");

    expect(results).toEqual([]);
  });
});
