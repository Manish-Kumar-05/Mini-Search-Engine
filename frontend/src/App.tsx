import { useState } from "react";

import { SearchBar } from "./components/SearchBar";
import { SearchControls } from "./components/SearchControls";
import { SearchResults } from "./components/SearchResults";
import { EmptyState } from "./components/EmptyState";

import { searchDocuments } from "./services/searchApi";

import type { SearchMode, SearchResult } from "./types/search";

function App() {
  const [query, setQuery] = useState("");

  const [mode, setMode] = useState<SearchMode>("bm25");

  const [limit, setLimit] = useState(10);

  const [results, setResults] = useState<SearchResult[]>([]);

  const [searched, setSearched] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [resultCount, setResultCount] = useState(0);

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await searchDocuments(query, mode, limit);

      setResults(response.data.results);

      setResultCount(response.data.count);

      setSearched(true);
    } catch (error) {
      setResults([]);
      setResultCount(0);

      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Mini Search Engine</h1>

          <p>Search your indexed documents</p>
        </div>
      </header>

      <main className="container">
        <section className="search-section">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />

          <SearchControls
            mode={mode}
            limit={limit}
            onModeChange={setMode}
            onLimitChange={setLimit}
          />
        </section>

        {error && <div className="error">{error}</div>}

        {searched && !error && (
          <div className="search-info">
            <span>
              {resultCount} result
              {resultCount !== 1 ? "s" : ""}
            </span>

            <span>Mode: {mode}</span>
          </div>
        )}

        {!searched && <EmptyState searched={false} />}

        {searched && !loading && !error && results.length === 0 && (
          <EmptyState searched={true} />
        )}

        {results.length > 0 && <SearchResults results={results} />}
      </main>
    </div>
  );
}

export default App;
