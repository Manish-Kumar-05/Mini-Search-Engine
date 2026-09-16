import { describe, expect, test } from "vitest";

import { InvertedIndex } from "../src/inverted-index.js";
import { PositionalIndex } from "../src/positional-index.js";
import { SearchEngine } from "../src/search-engine.js";

describe("Boolean Search", () => {
  function createSearchEngine() {
    const index = new InvertedIndex();

    const positionalIndex = new PositionalIndex();

    const documents = [
      {
        id: "doc1.txt",
        name: "Document 1",
        content: "python machine",
      },
      {
        id: "doc2.txt",
        name: "Document 2",
        content: "python javascript",
      },
      {
        id: "doc3.txt",
        name: "Document 3",
        content: "javascript programming",
      },
      {
        id: "doc4.txt",
        name: "Document 4",
        content: "machine learning",
      },
    ];

    for (const document of documents) {
      const tokens = document.content.toLowerCase().split(/\s+/);

      index.addDocument(document.id, tokens);

      positionalIndex.addDocument(document.id, tokens);
    }

    return new SearchEngine(index, positionalIndex, documents);
  }

  test("AND should return documents containing both terms", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.search("python AND machine");

    expect(results).toContain("doc1.txt");

    expect(results).not.toContain("doc2.txt");

    expect(results).not.toContain("doc3.txt");

    expect(results).not.toContain("doc4.txt");
  });

  test("OR should return documents containing either term", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.search("python OR javascript");

    expect(results).toContain("doc1.txt");

    expect(results).toContain("doc2.txt");

    expect(results).toContain("doc3.txt");

    expect(results).not.toContain("doc4.txt");
  });

  test("NOT should exclude documents containing the term", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.search("python AND NOT javascript");

    expect(results).toContain("doc1.txt");

    expect(results).not.toContain("doc2.txt");

    expect(results).not.toContain("doc3.txt");

    expect(results).not.toContain("doc4.txt");
  });

  test("parentheses should control precedence", () => {
    const searchEngine = createSearchEngine();

    const results = searchEngine.search(
      "(python OR javascript) AND programming"
    );

    expect(results).toContain("doc3.txt");

    expect(results).not.toContain("doc1.txt");

    expect(results).not.toContain("doc2.txt");

    expect(results).not.toContain("doc4.txt");
  });
});
