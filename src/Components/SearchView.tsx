import type { StoredFavorite, Track } from "../types";
import type { ItunesSearch } from "../hooks/useItunesSearch";
import TrackList from "./TrackList";

interface SearchViewProps {
  search: ItunesSearch;
  activeTrackId?: string;
  onSelect: (list: Track[], index: number) => void;
  favorites: StoredFavorite[];
  onToggleFavorite: (track: Track) => void;
}

/**
 * Pure presentation - the search state itself lives in useItunesSearch up
 * in MusicApp, so the query and results survive switching tabs.
 */
const SearchView = ({ search, activeTrackId, onSelect, favorites, onToggleFavorite }: SearchViewProps) => {
  const { query, setQuery, results, status } = search;

  return (
    <div className="search-view">
      <div className="search-input-wrap">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="search"
          placeholder="Hledat skladbu nebo interpreta..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Hledat skladbu"
        />
      </div>

      {status === "idle" && (
        <p className="list-empty-state">Zadej název skladby nebo interpreta.</p>
      )}
      {status === "loading" && <p className="list-empty-state">Hledám...</p>}
      {status === "error" && (
        <p className="list-empty-state">Vyhledávání se nezdařilo. Zkus to prosím znovu.</p>
      )}
      {status === "success" && results.length === 0 && (
        <p className="list-empty-state">Nic jsme nenašli.</p>
      )}
      {status === "success" && results.length > 0 && (
        <TrackList
          tracks={results}
          activeTrackId={activeTrackId}
          onSelect={(i) => onSelect(results, i)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          emptyMessage=""
        />
      )}
    </div>
  );
};

export default SearchView;
