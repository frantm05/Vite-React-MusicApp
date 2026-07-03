import { useEffect, useState } from "react";
import type { ArchiveTrack, AudiusTrack, ItunesTrack, SearchSource, SearchStatus } from "../types";
import { searchSongs } from "../services/itunesApi";
import { searchAudius } from "../services/audiusApi";
import { searchArchive } from "../services/archiveApi";
import { useDebouncedValue } from "./useDebouncedValue";

type SearchResult = ItunesTrack | AudiusTrack | ArchiveTrack;

export interface MusicSearch {
  query: string;
  setQuery: (query: string) => void;
  source: SearchSource;
  setSource: (source: SearchSource) => void;
  results: SearchResult[];
  status: SearchStatus;
}

const SEARCHERS: Record<
  SearchSource,
  (term: string, opts: { signal?: AbortSignal }) => Promise<SearchResult[]>
> = {
  itunes: searchSongs,
  audius: searchAudius,
  archive: searchArchive,
};

/**
 * Debounced music search across free sources: iTunes (rich catalog, 30s
 * previews), Audius (openly licensed music, full-length streams) and the
 * Internet Archive (live recordings and netlabel releases, downloadable).
 * Lives in MusicApp (which never unmounts) rather than in the search view,
 * so the query and results survive switching tabs.
 */
export function useMusicSearch(): MusicSearch {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SearchSource>("itunes");
  const [results, setResults] = useState<SearchResult[]>([]);
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

    SEARCHERS[source](trimmed, { signal: controller.signal })
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
