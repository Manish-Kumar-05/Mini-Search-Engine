import { describe, expect, test } from "vitest";

import { InvertedIndex } from "../src/inverted-index.js";
import { PositionalIndex } from "../src/positional-index.js";
import { SearchEngine } from "../src/search-engine.js";

describe("Ranking", () => {
  function createSearchEngine() {
    const index = new InvertedIndex();

    const positionalIndex = new PositionalIndex();

    const documents = [
      {
        id: "doc1.txt",
        name: "Python Document",
        content: "python python python programming",
      },
      {
        id: "doc2.txt",
        name: "JavaScript Document",
        content: "javascript programming",
      },
      {
        id: "doc3.txt",
        name: "Python Machine Learning",
        content: "python machine learning",
      },
    ];

    for (const document of documents) {
      const tokens = document.content.toLowerCase().split(/\s+/);

      index.addDocument(document.id, tokens);

      positionalIndex.addDocument(document.id, tokens);
    }

    return new SearchEngine(index, positionalIndex, documents);
  }

  test("TF-IDF should return matching documents", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchRanked("python");

    expect(results.length).toBeGreaterThan(0);

    const documentIds = results.map((result) => result.documentId);

    expect(documentIds).toContain("doc1.txt");

    expect(documentIds).toContain("doc3.txt");
  });

  test("BM25 should return matching documents", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchBM25("python");

    expect(results.length).toBeGreaterThan(0);

    const documentIds = results.map((result) => result.documentId);

    expect(documentIds).toContain("doc1.txt");

    expect(documentIds).toContain("doc3.txt");
  });

  test("TF-IDF results should have scores", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchRanked("python");

    for (const result of results) {
      expect(typeof result.score).toBe("number");
    }
  });

  test("BM25 results should have scores", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.searchBM25("python");

    for (const result of results) {
      expect(typeof result.score).toBe("number");
    }
  });
});
