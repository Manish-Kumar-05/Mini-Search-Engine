import type { SearchMode } from "../types/search";

interface SearchControlsProps {
  mode: SearchMode;
  limit: number;
  onModeChange: (mode: SearchMode) => void;
  onLimitChange: (limit: number) => void;
}

export function SearchControls({
  mode,
  limit,
  onModeChange,
  onLimitChange,
}: SearchControlsProps) {
  return (
    <div className="search-controls">
      <label>
        Mode
        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value as SearchMode)}
        >
          <option value="bm25">BM25</option>

          <option value="boolean">Boolean</option>

          <option value="phrase">Phrase</option>
        </select>
      </label>

      <label>
        Results
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          <option value="5">5</option>

          <option value="10">10</option>

          <option value="20">20</option>

          <option value="50">50</option>
        </select>
      </label>
    </div>
  );
}
