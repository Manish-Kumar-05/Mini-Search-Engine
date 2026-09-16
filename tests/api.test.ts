import { describe, expect, test } from "vitest";

import request from "supertest";

import express from "express";

import { InvertedIndex } from "../src/inverted-index.js";
import { PositionalIndex } from "../src/positional-index.js";
import { SearchEngine } from "../src/search-engine.js";

import { createApp } from "../src/api/server.js";

describe("Search Engine API", () => {
  function createTestApp() {
    const index = new InvertedIndex();

    const positionalIndex = new PositionalIndex();

    const documents = [
      {
        id: "python.txt",
        name: "Python",
        content: "python programming language",
      },
      {
        id: "javascript.txt",
        name: "JavaScript",
        content: "javascript programming language",
      },
      {
        id: "machine-learning.txt",
        name: "Machine Learning",
        content: "python machine learning",
      },
    ];

    for (const document of documents) {
      const tokens = document.content.toLowerCase().split(/\s+/);

      index.addDocument(document.id, tokens);

      positionalIndex.addDocument(document.id, tokens);
    }

    const searchEngine = new SearchEngine(index, positionalIndex, documents);

    return createApp(searchEngine);
  }

  test("GET /api/health should return healthy response", async () => {
    const app = createTestApp();

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Search engine API is healthy",
    });
  });

  test("GET / should return API information", async () => {
    const app = createTestApp();

    const response = await request(app).get("/");

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Mini Search Engine API");
  });
});
