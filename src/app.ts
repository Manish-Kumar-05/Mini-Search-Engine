import express from "express";
import { SearchEngine } from "./search-engine.js";
import { createSearchRouter } from "./api/routes/search.routes.js";

export function createApp(searchEngine: SearchEngine) {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Mini Search Engine API",
    });
  });

  app.use("/api", createSearchRouter(searchEngine));

  return app;
}
