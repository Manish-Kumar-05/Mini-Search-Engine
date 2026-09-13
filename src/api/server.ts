import express from "express";

import { SearchEngine } from "../search-engine.js";

import { createSearchRouter } from "./routes/search.routes.js";

export function createApp(searchEngine: SearchEngine) {
  const app = express();

  app.use(express.json());

  // API root
  app.get("/api", (_req, res) => {
    res.json({
      success: true,
      message: "Mini Search Engine API",
      endpoints: {
        health: "/api/health",
        search: "/api/search?q=javascript",
      },
    });
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "Search engine API is healthy",
    });
  });

  // Search routes
  app.use("/api", createSearchRouter(searchEngine));

  // Root route
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Mini Search Engine API",
    });
  });

  return app;
}
