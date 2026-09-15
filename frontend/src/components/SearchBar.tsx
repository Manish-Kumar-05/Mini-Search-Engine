interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSearch,
  loading,
}: SearchBarProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    onSearch();
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search documents..."
      />

      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
