import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import TrackList from "./TrackList";
import { searchSongs } from "../services/itunesApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const SearchView = ({ activeTrackId, onSelect, favorites, onToggleFavorite }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    setStatus("loading");

    searchSongs(trimmed, { signal: controller.signal })
      .then((tracks) => {
        setResults(tracks);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setResults([]);
        setStatus("error");
      });

    return () => controller.abort();
  }, [debouncedQuery]);

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
          autoFocus
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

SearchView.propTypes = {
  activeTrackId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  favorites: PropTypes.array.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
};

export default SearchView;
