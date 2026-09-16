import { describe, expect, test } from "vitest";

import { normalizeToken } from "../src/normalizer.js";

describe("Normalizer", () => {
  test("should convert uppercase to lowercase", () => {
    expect(normalizeToken("PYTHON")).toBe("python");
  });

  test("should preserve punctuation if normalizer does not remove it", () => {
    expect(normalizeToken("Python!")).toBe("python!");
  });

  test("should normalize mixed case", () => {
    expect(normalizeToken("JaVaScRiPt")).toBe("javascript");
  });
});
