import { describe, expect, test } from "vitest";

import { InvertedIndex } from "../src/inverted-index.js";

describe("Inverted Index", () => {
  test("should add documents", () => {
    const index = new InvertedIndex();

    index.addDocument("python.txt", ["python", "programming"]);

    index.addDocument("javascript.txt", ["javascript", "programming"]);

    expect([...index.getDocuments("python")]).toEqual(["python.txt"]);

    expect([...index.getDocuments("javascript")]).toEqual(["javascript.txt"]);
  });

  test("should return multiple documents", () => {
    const index = new InvertedIndex();

    index.addDocument("python.txt", ["python"]);

    index.addDocument("machine-learning.txt", ["python", "machine"]);

    expect([...index.getDocuments("python")]).toEqual([
      "python.txt",
      "machine-learning.txt",
    ]);
  });

  test("unknown term should return empty set", () => {
    const index = new InvertedIndex();

    index.addDocument("python.txt", ["python"]);

    expect([...index.getDocuments("database")]).toEqual([]);
  });
});
