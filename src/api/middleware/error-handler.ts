import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("API Error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
