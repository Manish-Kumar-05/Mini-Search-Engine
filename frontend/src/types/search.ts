export type SearchMode = "bm25" | "boolean" | "phrase";

export interface SearchResult {
  documentId: string;
  score: number;
  snippet: string;
}

export interface SearchResponse {
  success: boolean;

  data: {
    query: string;
    mode: SearchMode;
    count: number;
    results: SearchResult[];
  };
}

export interface SearchErrorResponse {
  success: false;
  message: string;
}
