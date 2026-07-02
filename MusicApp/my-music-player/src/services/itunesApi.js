const SEARCH_ENDPOINT = "https://itunes.apple.com/search";

/**
 * iTunes artwork URLs default to 100x100 - swap in a larger size so the
 * "now playing" cover art doesn't look pixelated when scaled up.
 */
const upscaleArtwork = (url, size = 600) =>
  url ? url.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`) : url;

const mapResultToTrack = (result) => ({
  id: `itunes-${result.trackId}`,
  source: "itunes",
  isPreview: true,
  name: result.trackName,
  artist: result.artistName,
  album: result.collectionName,
  img: upscaleArtwork(result.artworkUrl100),
  src: result.previewUrl,
  fullDurationMs: result.trackTimeMillis,
});

/**
 * Searches the free, key-less iTunes Search API for songs.
 * Only a ~30s preview clip is legally available without a paid
 * streaming license, so every result is flagged `isPreview: true`.
 */
export async function searchSongs(term, { signal } = {}) {
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

  const data = await response.json();
  return (data.results ?? [])
    .filter((result) => Boolean(result.previewUrl))
    .map(mapResultToTrack);
}
