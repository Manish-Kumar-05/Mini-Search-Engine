import type { SearchResult as SearchResultType } from "../types/search";

interface SearchResultProps {
  result: SearchResultType;
}

export function SearchResult({ result }: SearchResultProps) {
  return (
    <article className="result-card">
      <h2>{result.documentId}</h2>

      <div className="result-score">Score: {result.score.toFixed(4)}</div>

      <p
        className="result-snippet"
        dangerouslySetInnerHTML={{
          __html: result.snippet,
        }}
      />
    </article>
  );
}
