import type { SearchResult as SearchResultType } from "../types/search";

import { SearchResult } from "./SearchResult";

interface SearchResultsProps {
  results: SearchResultType[];
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <section className="results">
      {results.map((result) => (
        <SearchResult key={result.documentId} result={result} />
      ))}
    </section>
  );
}
