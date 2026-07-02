import type { ItunesTrack } from "../types";

const SEARCH_ENDPOINT = "https://itunes.apple.com/search";

interface ItunesSearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
}

/**
 * iTunes artwork URLs default to 100x100 - swap in a larger size so the
 * "now playing" cover art doesn't look pixelated when scaled up.
 */
export const upscaleArtwork = (url: string, size = 600): string =>
  url.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`);

const mapResultToTrack = (result: ItunesSearchResult): ItunesTrack => ({
  id: `itunes-${result.trackId}`,
  source: "itunes",
  isPreview: true,
  name: result.trackName,
  artist: result.artistName,
  album: result.collectionName,
  img: result.artworkUrl100 ? upscaleArtwork(result.artworkUrl100) : "",
  src: result.previewUrl ?? "",
  fullDurationMs: result.trackTimeMillis,
});

/**
 * Searches the free, key-less iTunes Search API for songs.
 * Only a ~30s preview clip is legally available without a paid
 * streaming license, so every result is flagged `isPreview: true`.
 */
export async function searchSongs(
  term: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<ItunesTrack[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("term", trimmed);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "25");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`iTunes API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { results?: ItunesSearchResult[] };
  return (data.results ?? [])
    .filter((result) => Boolean(result.previewUrl))
    .map(mapResultToTrack);
}
