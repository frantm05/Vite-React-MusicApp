export type TrackSource = "local" | "itunes" | "audius" | "archive" | "custom";

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

/**
 * Track from the Audius API - full-length, legally streamable. Tracks whose
 * artist enabled downloads can also be saved into the local library.
 */
export interface AudiusTrack extends TrackBase {
  source: "audius";
  isPreview: false;
  src: string;
  img: string | null;
  durationSec?: number;
  downloadable: boolean;
}

/**
 * Track from the Internet Archive (Live Music Archive, netlabels...) -
 * full-length, publicly hosted files that are also freely downloadable.
 */
export interface ArchiveTrack extends TrackBase {
  source: "archive";
  isPreview: false;
  src: string;
  img: string | null;
  album?: string;
  downloadable: true;
}

/** Track the user uploaded - src/img are blob: URLs valid only for this session. */
export interface CustomTrack extends TrackBase {
  source: "custom";
  isPreview: false;
  src: string;
  img: string | null;
}

export type Track = LocalTrack | ItunesTrack | AudiusTrack | ArchiveTrack | CustomTrack;

/** True for tracks whose source allows saving the file into the local library. */
export const isDownloadable = (track: Track): boolean =>
  (track.source === "audius" || track.source === "archive") && track.downloadable;

/**
 * The persisted shape of a track reference (favorites, playlist items).
 * Custom tracks are stored as a bare reference (their blob: URLs die on
 * reload) and rehydrated from the custom library at runtime; other tracks
 * are stored whole.
 */
export type StoredTrackRef =
  | LocalTrack
  | ItunesTrack
  | AudiusTrack
  | ArchiveTrack
  | { source: "custom"; id: string; name: string; artist: string };

export interface Playlist {
  id: string;
  name: string;
  tracks: StoredTrackRef[];
}

export type RepeatMode = "off" | "all" | "one";

export type View = "player" | "library" | "search" | "playlists" | "favorites";

export type SearchStatus = "idle" | "loading" | "success" | "error";

export type SearchSource = "itunes" | "audius" | "archive";
