import { Router } from "express";

import { SearchEngine } from "../../search-engine.js";

type SearchMode = "bm25" | "boolean" | "phrase";

export function createSearchRouter(searchEngine: SearchEngine): Router {
  const router = Router();

  router.get("/search", (req, res) => {
    try {
      const query = String(req.query.q ?? "");

      const mode = String(req.query.mode ?? "bm25") as SearchMode;

      const limit = Number(req.query.limit ?? 10);

      /*
                |--------------------------------------------------------------------------
                | Validate query
                |--------------------------------------------------------------------------
                */

      if (!query.trim()) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      /*
                |--------------------------------------------------------------------------
                | Validate mode
                |--------------------------------------------------------------------------
                */

      const validModes: SearchMode[] = ["bm25", "boolean", "phrase"];

      if (!validModes.includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid search mode",
          validModes,
        });
      }

      /*
                |--------------------------------------------------------------------------
                | Validate limit
                |--------------------------------------------------------------------------
                */

      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      /*
                |--------------------------------------------------------------------------
                | BM25 search
                |--------------------------------------------------------------------------
                */

      if (mode === "bm25") {
        const results = searchEngine.searchBM25(query, limit);

        const highlightedResults = searchEngine.highlightResults(
          results,
          query
        );

        return res.status(200).json({
          success: true,

          data: {
            query,
            mode,
            count: highlightedResults.length,
            results: highlightedResults,
          },
        });
      }

      /*
                |--------------------------------------------------------------------------
                | Boolean search
                |--------------------------------------------------------------------------
                */

      if (mode === "boolean") {
        const documentIds = searchEngine.search(query);

        const results = documentIds.slice(0, limit).map((documentId) => ({
          documentId,
          score: 1,
        }));

        const highlightedResults = searchEngine.highlightResults(
          results,
          query
        );

        return res.status(200).json({
          success: true,

          data: {
            query,
            mode,
            count: highlightedResults.length,
            results: highlightedResults,
          },
        });
      }

      /*
                |--------------------------------------------------------------------------
                | Phrase search
                |--------------------------------------------------------------------------
                */

      const documentIds = searchEngine.searchPhrase(query);

      const results = documentIds.slice(0, limit).map((documentId) => ({
        documentId,
        score: 1,
      }));

      const highlightedResults = searchEngine.highlightResults(results, query);

      return res.status(200).json({
        success: true,

        data: {
          query,
          mode,
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
