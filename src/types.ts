export type TrackSource = "local" | "itunes" | "custom";

interface TrackBase {
  id: string;
  name: string;
  artist: string;
}

/** Track bundled with the app - assets are static imports, always available. */
export interface LocalTrack extends TrackBase {
  source: "local";
  isPreview: false;
  src: string;
  img: string;
}

/** Track from the iTunes Search API - only a ~30s preview clip is playable. */
export interface ItunesTrack extends TrackBase {
  source: "itunes";
  isPreview: true;
  src: string;
  img: string;
  album?: string;
  fullDurationMs?: number;
}

/** Track the user uploaded - src/img are blob: URLs valid only for this session. */
export interface CustomTrack extends TrackBase {
  source: "custom";
  isPreview: false;
  src: string;
  img: string | null;
}

export type Track = LocalTrack | ItunesTrack | CustomTrack;

/**
 * The persisted shape of a favorite. Custom tracks are stored as a bare
 * reference (their blob: URLs die on reload) and rehydrated from the
 * custom library at runtime; other tracks are stored whole.
 */
export type StoredFavorite =
  | LocalTrack
  | ItunesTrack
  | { source: "custom"; id: string; name: string; artist: string };

export type RepeatMode = "off" | "all" | "one";

export type View = "player" | "library" | "search" | "favorites";

export type SearchStatus = "idle" | "loading" | "success" | "error";
