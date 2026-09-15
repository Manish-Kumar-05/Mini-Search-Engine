interface EmptyStateProps {
  searched: boolean;
}

export function EmptyState({ searched }: EmptyStateProps) {
  if (!searched) {
    return (
      <div className="empty-state">
        <h2>Search your documents</h2>

        <p>Enter a query to find relevant documents.</p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <h2>No results found</h2>

      <p>Try another search query.</p>
    </div>
  );
}
