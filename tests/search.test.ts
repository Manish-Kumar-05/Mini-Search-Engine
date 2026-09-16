import { describe, expect, test } from "vitest";

import { InvertedIndex } from "../src/inverted-index.js";
import { SearchEngine } from "../src/search-engine.js";

describe("Search", () => {
  test("should find matching documents", () => {
    const index = new InvertedIndex();

    index.addDocument("python.txt", ["python", "programming"]);

    index.addDocument("javascript.txt", ["javascript", "programming"]);

    const engine = new SearchEngine(index, undefined as any, [
      {
        id: "python.txt",
        name: "python.txt",
        content: "Python programming",
      },
      {
        id: "javascript.txt",
        name: "javascript.txt",
        content: "JavaScript programming",
      },
    ]);

    const results = engine.search("python");

    expect(results).toContain("python.txt");
  });
});
