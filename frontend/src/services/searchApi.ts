import type { SearchMode, SearchResponse } from "../types/search";

const API_URL = import.meta.env.VITE_API_URL;

export async function searchDocuments(
  query: string,
  mode: SearchMode,
  limit: number
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    mode,
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}/api/search?${params.toString()}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Search request failed");
  }

  return data;
}
