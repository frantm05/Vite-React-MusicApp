import type { ArchiveTrack } from "../types";

const SEARCH_ENDPOINT = "https://archive.org/advancedsearch.php";
const METADATA_ENDPOINT = "https://archive.org/metadata";
const DOWNLOAD_ENDPOINT = "https://archive.org/download";
const THUMBNAIL_ENDPOINT = "https://archive.org/services/img";

/** How many albums/concerts to expand and how many tracks to take from each. */
const MAX_ITEMS = 6;
const MAX_TRACKS_PER_ITEM = 4;

interface ArchiveSearchDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
}

interface ArchiveFile {
  name: string;
  format?: string;
  title?: string;
}

const creatorToString = (creator?: string | string[]): string =>
  (Array.isArray(creator) ? creator[0] : creator) ?? "Internet Archive";

const fileTitle = (file: ArchiveFile): string => {
  if (file.title) return file.title;
  const base = file.name.split("/").pop() ?? file.name;
  return base.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
};

const encodePath = (name: string) => name.split("/").map(encodeURIComponent).join("/");

/**
 * Expands one archive.org item (an album, a concert...) into its playable
 * MP3 tracks. Files on archive.org are directly streamable and downloadable.
 */
async function itemTracks(doc: ArchiveSearchDoc, signal?: AbortSignal): Promise<ArchiveTrack[]> {
  const response = await fetch(`${METADATA_ENDPOINT}/${doc.identifier}`, { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as { files?: ArchiveFile[] };

  return (data.files ?? [])
    .filter((f) => f.format?.includes("MP3") && f.name.toLowerCase().endsWith(".mp3"))
    .slice(0, MAX_TRACKS_PER_ITEM)
    .map((file) => ({
      id: `archive-${doc.identifier}-${file.name}`,
      source: "archive" as const,
      isPreview: false as const,
      name: fileTitle(file),
      artist: creatorToString(doc.creator),
      album: doc.title,
      img: `${THUMBNAIL_ENDPOINT}/${doc.identifier}`,
      src: `${DOWNLOAD_ENDPOINT}/${doc.identifier}/${encodePath(file.name)}`,
      downloadable: true as const,
    }));
}

/**
 * Searches the Internet Archive's audio collections (Live Music Archive,
 * netlabels, ...) - a free, key-less API over legally hosted recordings.
 * Item results (albums/concerts) are flattened into individual tracks,
 * most-downloaded items first.
 */
export async function searchArchive(
  term: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<ArchiveTrack[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("q", `(${trimmed}) AND mediatype:(audio)`);
  url.searchParams.append("fl[]", "identifier");
  url.searchParams.append("fl[]", "title");
  url.searchParams.append("fl[]", "creator");
  url.searchParams.append("sort[]", "downloads desc");
  url.searchParams.set("rows", String(MAX_ITEMS));
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Archive search failed with status ${response.status}`);
  }

  const data = (await response.json()) as { response?: { docs?: ArchiveSearchDoc[] } };
  const docs = data.response?.docs ?? [];

  const perItem = await Promise.all(
    docs.map((doc) => itemTracks(doc, signal).catch(() => []))
  );
  return perItem.flat();
}
