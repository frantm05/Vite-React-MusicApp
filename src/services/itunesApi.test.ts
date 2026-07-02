import { afterEach, describe, expect, it, vi } from "vitest";
import { searchSongs, upscaleArtwork } from "./itunesApi";

const makeResult = (overrides: Record<string, unknown> = {}) => ({
  trackId: 123,
  trackName: "Bohemian Rhapsody",
  artistName: "Queen",
  collectionName: "A Night at the Opera",
  artworkUrl100: "https://example.com/a/100x100bb.jpg",
  previewUrl: "https://example.com/preview.m4a",
  trackTimeMillis: 354000,
  ...overrides,
});

const mockFetch = (body: unknown, ok = true, status = 200) => {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("upscaleArtwork", () => {
  it("swaps the 100x100 suffix for the requested size", () => {
    expect(upscaleArtwork("https://x/y/100x100bb.jpg")).toBe("https://x/y/600x600bb.jpg");
    expect(upscaleArtwork("https://x/y/100x100bb.png", 300)).toBe("https://x/y/300x300bb.png");
  });

  it("leaves unrecognized URLs untouched", () => {
    expect(upscaleArtwork("https://x/y/cover.jpg")).toBe("https://x/y/cover.jpg");
  });
});

describe("searchSongs", () => {
  it("returns an empty list for a blank term without calling the API", async () => {
    const fetchFn = mockFetch({ results: [makeResult()] });
    expect(await searchSongs("   ")).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("maps results to tracks", async () => {
    mockFetch({ results: [makeResult()] });
    const tracks = await searchSongs("queen");
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({
      id: "itunes-123",
      source: "itunes",
      isPreview: true,
      name: "Bohemian Rhapsody",
      artist: "Queen",
      img: "https://example.com/a/600x600bb.jpg",
      src: "https://example.com/preview.m4a",
    });
  });

  it("filters out results without a preview URL", async () => {
    mockFetch({ results: [makeResult(), makeResult({ trackId: 456, previewUrl: undefined })] });
    const tracks = await searchSongs("queen");
    expect(tracks).toHaveLength(1);
    expect(tracks[0].id).toBe("itunes-123");
  });

  it("throws on a non-OK response", async () => {
    mockFetch({}, false, 503);
    await expect(searchSongs("queen")).rejects.toThrow("503");
  });
});
