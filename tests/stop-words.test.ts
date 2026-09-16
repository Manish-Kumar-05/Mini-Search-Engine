import { describe, expect, test } from "vitest";

import { removeStopWords } from "../src/stop-words.js";

describe("Stop Words", () => {
  test("should remove common stop words", () => {
    const result = removeStopWords([
      "python",
      "is",
      "a",
      "programming",
      "language",
    ]);

    expect(result).toEqual(["python", "programming", "language"]);
  });
});
