import { useEffect, useState } from "react";
import type { ItunesTrack, SearchStatus } from "../types";
import { searchSongs } from "../services/itunesApi";
import { useDebouncedValue } from "./useDebouncedValue";

export interface ItunesSearch {
  query: string;
  setQuery: (query: string) => void;
  results: ItunesTrack[];
  status: SearchStatus;
}

/**
 * Debounced iTunes search. Lives in MusicApp (which never unmounts) rather
 * than in the search view, so the query and results survive switching tabs.
 */
export function useItunesSearch(): ItunesSearch {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItunesTrack[]>([]);
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

    searchSongs(trimmed, { signal: controller.signal })
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
  }, [debouncedQuery]);

  return { query, setQuery, results, status };
}
