import type { AudiusTrack } from "../types";

const HOSTS_ENDPOINT = "https://api.audius.co";
const APP_NAME = "vite-react-musicapp";

interface AudiusApiTrack {
  id: string;
  title: string;
  user?: { name?: string };
  artwork?: { "150x150"?: string; "480x480"?: string; "1000x1000"?: string };
  duration?: number;
  is_downloadable?: boolean;
}

let cachedHost: string | null = null;
let hostPromise: Promise<string> | null = null;

/**
 * Audius is a decentralized network - the API is served by community nodes,
 * so a host has to be discovered first. Cache it for the session.
 */
async function resolveHost(signal?: AbortSignal): Promise<string> {
  if (cachedHost) return cachedHost;
  if (!hostPromise) {
    hostPromise = fetch(HOSTS_ENDPOINT, { signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Audius host discovery failed with status ${r.status}`);
        return r.json() as Promise<{ data?: string[] }>;
      })
      .then(({ data }) => {
        if (!data?.length) throw new Error("Audius host discovery returned no hosts");
        cachedHost = data[0];
        return cachedHost;
      })
      .finally(() => {
        hostPromise = null;
      });
  }
  return hostPromise;
}

export function streamUrl(host: string, trackId: string): string {
  return `${host}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`;
}

const mapApiTrack = (host: string, t: AudiusApiTrack): AudiusTrack => ({
  id: `audius-${t.id}`,
  source: "audius",
  isPreview: false,
  name: t.title,
  artist: t.user?.name ?? "Neznámý interpret",
  img: t.artwork?.["480x480"] ?? t.artwork?.["150x150"] ?? null,
  src: streamUrl(host, t.id),
  durationSec: t.duration,
  downloadable: Boolean(t.is_downloadable),
});

/**
 * Searches Audius - a free, key-less API over openly licensed / artist
 * uploaded music. Unlike iTunes previews these are full-length tracks, and
 * artists can explicitly allow downloads.
 */
export async function searchAudius(
  term: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<AudiusTrack[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const host = await resolveHost(signal);
  const url = new URL(`${host}/v1/tracks/search`);
  url.searchParams.set("query", trimmed);
  url.searchParams.set("app_name", APP_NAME);

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Audius search failed with status ${response.status}`);
  }

  const data = (await response.json()) as { data?: AudiusApiTrack[] };
  return (data.data ?? []).map((t) => mapApiTrack(host, t));
}

/** Test seam - clears the cached discovery host. */
export function __resetHostCache() {
  cachedHost = null;
  hostPromise = null;
}
