import { Router } from "express";

import { SearchEngine } from "../../search-engine.js";

export function createSearchRouter(searchEngine: SearchEngine): Router {
  const router = Router();

  router.get("/search", (req, res) => {
    try {
      const query = String(req.query.q ?? "");

      const limit = Number(req.query.limit ?? 10);

      // Validate query
      if (!query.trim()) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      // Validate limit
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      // Search using BM25
      const results = searchEngine.searchBM25(query, limit);

      // Add highlighting
      const highlightedResults = searchEngine.highlightResults(results, query);

      return res.status(200).json({
        success: true,

        data: {
          query,
          count: highlightedResults.length,
          results: highlightedResults,
        },
      });
    } catch (error) {
      console.error("Search error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  return router;
}
