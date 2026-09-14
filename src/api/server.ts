import express from "express";

import cors from "cors";
import morgan from "morgan";
import { SearchEngine } from "../search-engine.js";

import { createSearchRouter } from "./routes/search.routes.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp(searchEngine: SearchEngine) {
  const app = express();

  app.use(
    cors({
      origin: true,
    })
  );

  /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */
  app.use(morgan("dev"));
  app.use(express.json());

  /*
    |--------------------------------------------------------------------------
    | API Root
    |--------------------------------------------------------------------------
    */

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

  /*
    |--------------------------------------------------------------------------
    | Health Check
    |--------------------------------------------------------------------------
    */

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "Search engine API is healthy",
    });
  });

  /*
    |--------------------------------------------------------------------------
    | Search Routes
    |--------------------------------------------------------------------------
    */

  app.use("/api", createSearchRouter(searchEngine));

  /*
    |--------------------------------------------------------------------------
    | Root
    |--------------------------------------------------------------------------
    */

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Mini Search Engine API",
    });
  });

  /*
    |--------------------------------------------------------------------------
    | 404
    |--------------------------------------------------------------------------
    */

  app.use(notFoundHandler);

  /*
    |--------------------------------------------------------------------------
    | Error Handler
    |--------------------------------------------------------------------------
    */

  app.use(errorHandler);

  return app;
}
