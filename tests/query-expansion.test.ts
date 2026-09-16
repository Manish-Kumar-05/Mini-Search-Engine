import { describe, expect, test } from "vitest";

import { QueryExpander } from "../src/query-expander.js";

describe("Query Expansion", () => {
  const expander = new QueryExpander();

  test("should expand car", () => {
    const result = expander.expand(["car"]);

    expect(result).toContain("car");
    expect(result).toContain("automobile");
    expect(result).toContain("vehicle");
  });

  test("should expand javascript", () => {
    const result = expander.expand(["javascript"]);

    expect(result).toContain("javascript");
    expect(result).toContain("js");
  });

  test("should expand database", () => {
    const result = expander.expand(["database"]);

    expect(result).toContain("database");
    expect(result).toContain("db");
  });
});
