import { useEffect, useState } from "react";
import type { AudiusTrack, ItunesTrack, SearchSource, SearchStatus } from "../types";
import { searchSongs } from "../services/itunesApi";
import { searchAudius } from "../services/audiusApi";
import { useDebouncedValue } from "./useDebouncedValue";

export interface MusicSearch {
  query: string;
  setQuery: (query: string) => void;
  source: SearchSource;
  setSource: (source: SearchSource) => void;
  results: (ItunesTrack | AudiusTrack)[];
  status: SearchStatus;
}

/**
 * Debounced music search across two free sources: iTunes (rich catalog,
 * 30s previews) and Audius (openly licensed music, full-length streams).
 * Lives in MusicApp (which never unmounts) rather than in the search view,
 * so the query and results survive switching tabs.
 */
export function useMusicSearch(): MusicSearch {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SearchSource>("itunes");
  const [results, setResults] = useState<(ItunesTrack | AudiusTrack)[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
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

    const request =
      source === "itunes"
        ? searchSongs(trimmed, { signal: controller.signal })
        : searchAudius(trimmed, { signal: controller.signal });

    request
      .then((tracks) => {
        setResults(tracks);
        setStatus("success");
      })
      .catch((err: DOMException) => {
        if (err.name === "AbortError") return;
        setResults([]);
        setStatus("error");
      });

    return () => controller.abort();
  }, [debouncedQuery, source]);

  return { query, setQuery, source, setSource, results, status };
}
