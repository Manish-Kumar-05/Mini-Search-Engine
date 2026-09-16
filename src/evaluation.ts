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
  if (k <= 0 || relevantDocuments.length === 0) {
    return 0;
  }

  const topResults = results.slice(0, k);

  let relevantCount = 0;

  for (const result of topResults) {
    if (relevantDocuments.includes(result.documentId)) {
      relevantCount++;
    }
  }

  return relevantCount / k;
}

export function recallAtK(
  results: SearchResult[],
  relevantDocuments: string[],
  k: number
): number {
  if (k <= 0 || relevantDocuments.length === 0) {
    return 0;
  }

  const topResults = results.slice(0, k);

  let relevantCount = 0;

  for (const result of topResults) {
    if (relevantDocuments.includes(result.documentId)) {
      relevantCount++;
    }
  }

  return relevantCount / relevantDocuments.length;
}

export function f1AtK(
  results: SearchResult[],
  relevantDocuments: string[],
  k: number
): number {
  const precision = precisionAtK(results, relevantDocuments, k);

  const recall = recallAtK(results, relevantDocuments, k);

  if (precision + recall === 0) {
    return 0;
  }

  return (2 * (precision * recall)) / (precision + recall);
}
