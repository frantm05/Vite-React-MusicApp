import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetHostCache, searchAudius, streamUrl } from "./audiusApi";

const HOST = "https://node.example.com";

const apiTrack = (overrides: Record<string, unknown> = {}) => ({
  id: "abc123",
  title: "Open Song",
  user: { name: "Free Artist" },
  artwork: { "150x150": "https://img/150.jpg", "480x480": "https://img/480.jpg" },
  duration: 200,
  is_downloadable: true,
  ...overrides,
});

const mockFetchSequence = (responses: { ok?: boolean; status?: number; body: unknown }[]) => {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce({
      ok: r.ok ?? true,
      status: r.status ?? 200,
      json: () => Promise.resolve(r.body),
    });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
};

beforeEach(() => __resetHostCache());
afterEach(() => vi.unstubAllGlobals());

describe("searchAudius", () => {
  it("discovers a host, searches and maps tracks", async () => {
    const fetchFn = mockFetchSequence([
      { body: { data: [HOST] } },
      { body: { data: [apiTrack()] } },
    ]);

    const tracks = await searchAudius("open song");
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(String(fetchFn.mock.calls[1][0])).toContain(`${HOST}/v1/tracks/search`);
    expect(tracks[0]).toMatchObject({
      id: "audius-abc123",
      source: "audius",
      isPreview: false,
      name: "Open Song",
      artist: "Free Artist",
      img: "https://img/480.jpg",
      src: streamUrl(HOST, "abc123"),
      downloadable: true,
    });
  });

  it("caches the discovered host across searches", async () => {
    const fetchFn = mockFetchSequence([
      { body: { data: [HOST] } },
      { body: { data: [] } },
      { body: { data: [] } },
    ]);
    await searchAudius("a");
    await searchAudius("b");
    // 1 discovery + 2 searches
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it("returns an empty list for a blank term without calling the API", async () => {
    const fetchFn = mockFetchSequence([]);
    expect(await searchAudius("  ")).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("flags non-downloadable tracks", async () => {
    mockFetchSequence([
      { body: { data: [HOST] } },
      { body: { data: [apiTrack({ is_downloadable: false })] } },
    ]);
    const tracks = await searchAudius("x");
    expect(tracks[0].downloadable).toBe(false);
  });

  it("throws when the search endpoint fails", async () => {
    mockFetchSequence([
      { body: { data: [HOST] } },
      { ok: false, status: 502, body: {} },
    ]);
    await expect(searchAudius("x")).rejects.toThrow("502");
  });
});
