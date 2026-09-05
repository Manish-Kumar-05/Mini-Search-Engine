import { SearchResult } from "./types.js";

export interface EvaluationQuery {
  query: string;
  relevantDocuments: string[];
}

export function precisionAtK(
  results: SearchResult[],
  relevantDocuments: string[],
  k: number
): number {
  const topResults = results.slice(0, k);

  if (topResults.length === 0) {
    return 0;
  }

  let relevantCount = 0;

  for (const result of topResults) {
    if (relevantDocuments.includes(result.documentId)) {
      relevantCount++;
    }
  }

  return relevantCount / topResults.length;
}

export function recallAtK(
  results: SearchResult[],
  relevantDocuments: string[],
  k: number
): number {
  const topResults = results.slice(0, k);

  if (relevantDocuments.length === 0) {
    return 0;
  }

  let relevantCount = 0;

  for (const result of topResults) {
    if (relevantDocuments.includes(result.documentId)) {
      relevantCount++;
    }
  }

  return relevantCount / relevantDocuments.length;
}
