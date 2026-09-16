import { describe, expect, test } from "vitest";

import { tokenizer } from "../src/tokenizer.js";

describe("Tokenizer", () => {
  test("should split text into tokens", () => {
    const result = tokenizer("Python is a programming language");

    expect(result).toEqual(["Python", "is", "a", "programming", "language"]);
  });
});
