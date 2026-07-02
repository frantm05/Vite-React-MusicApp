import type { SearchSource, StoredTrackRef, Track } from "../types";
import type { MusicSearch } from "../hooks/useMusicSearch";
import TrackList from "./TrackList";

const SOURCES: { id: SearchSource; label: string; hint: string }[] = [
  { id: "itunes", label: "iTunes", hint: "30s ukázky" },
  { id: "audius", label: "Audius", hint: "celé skladby" },
];

interface SearchViewProps {
  search: MusicSearch;
  activeTrackId?: string;
  onSelect: (list: Track[], index: number) => void;
  favorites: StoredTrackRef[];
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onSaveToLibrary: (track: Track) => void;
  savingTrackId: string | null;
}

/**
 * Pure presentation - the search state itself lives in useMusicSearch up
 * in MusicApp, so the query and results survive switching tabs.
 */
const SearchView = ({
  search,
  activeTrackId,
  onSelect,
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
  onSaveToLibrary,
  savingTrackId,
}: SearchViewProps) => {
  const { query, setQuery, source, setSource, results, status } = search;

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

      <div className="search-source-toggle" role="group" aria-label="Zdroj vyhledávání">
        {SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={source === s.id ? "active" : ""}
            onClick={() => setSource(s.id)}
            aria-pressed={source === s.id}
          >
            {s.label} <small>{s.hint}</small>
          </button>
        ))}
      </div>

      {status === "idle" && (
        <p className="list-empty-state">
          {source === "audius"
            ? "Audius nabízí volně licencovanou hudbu v plné délce - skladby s ikonou stažení si můžeš uložit do knihovny."
            : "Zadej název skladby nebo interpreta."}
        </p>
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
          onAddToPlaylist={onAddToPlaylist}
          onSaveToLibrary={onSaveToLibrary}
          savingTrackId={savingTrackId}
          emptyMessage=""
        />
      )}
    </div>
  );
};

export default SearchView;
