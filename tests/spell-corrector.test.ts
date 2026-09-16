import { describe, expect, test } from "vitest";

import { SpellCorrector } from "../src/spell-corrector.js";

describe("Spell Corrector", () => {
  const corrector = new SpellCorrector([
    "python",
    "javascript",
    "machine",
    "programming",
    "database",
  ]);

  test("should correct python typo", () => {
    expect(corrector.findClosestTerm("pythn")).toBe("python");
  });

  test("should correct javascript typo", () => {
    expect(corrector.findClosestTerm("javasript")).toBe("javascript");
  });

  test("should correct machine typo", () => {
    expect(corrector.findClosestTerm("machne")).toBe("machine");
  });
});
