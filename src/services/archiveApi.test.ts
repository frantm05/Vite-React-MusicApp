import { afterEach, describe, expect, it, vi } from "vitest";
import { searchArchive } from "./archiveApi";

const searchBody = {
  response: {
    docs: [
      { identifier: "gd1977-05-08", title: "Grateful Dead Live 1977-05-08", creator: "Grateful Dead" },
    ],
  },
};

const metadataBody = {
  files: [
    { name: "gd77-05-08d1t01.flac", format: "Flac" },
    { name: "gd77-05-08d1t01.mp3", format: "VBR MP3", title: "Scarlet Begonias" },
    { name: "subdir/gd77-05-08d1t02.mp3", format: "VBR MP3" },
    { name: "info.txt", format: "Text" },
  ],
};

const mockFetch = (handler: (url: string) => { ok?: boolean; status?: number; body: unknown }) => {
  const fn = vi.fn().mockImplementation((url: string) => {
    const r = handler(String(url));
    return Promise.resolve({
      ok: r.ok ?? true,
      status: r.status ?? 200,
      json: () => Promise.resolve(r.body),
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
};

afterEach(() => vi.unstubAllGlobals());

describe("searchArchive", () => {
  it("flattens item search results into playable MP3 tracks", async () => {
    mockFetch((url) =>
      url.includes("advancedsearch") ? { body: searchBody } : { body: metadataBody }
    );

    const tracks = await searchArchive("grateful dead");
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).toMatchObject({
      id: "archive-gd1977-05-08-gd77-05-08d1t01.mp3",
      source: "archive",
      isPreview: false,
      name: "Scarlet Begonias",
      artist: "Grateful Dead",
      album: "Grateful Dead Live 1977-05-08",
      src: "https://archive.org/download/gd1977-05-08/gd77-05-08d1t01.mp3",
      downloadable: true,
    });
    // no file title -> derived from filename; subdir path is URL-encoded per segment
    expect(tracks[1].name).toBe("gd77 05 08d1t02");
    expect(tracks[1].src).toBe(
      "https://archive.org/download/gd1977-05-08/subdir/gd77-05-08d1t02.mp3"
    );
  });

  it("skips non-MP3 files", async () => {
    mockFetch((url) =>
      url.includes("advancedsearch") ? { body: searchBody } : { body: metadataBody }
    );
    const tracks = await searchArchive("x");
    expect(tracks.every((t) => t.src.endsWith(".mp3"))).toBe(true);
  });

  it("returns an empty list for a blank term without calling the API", async () => {
    const fetchFn = mockFetch(() => ({ body: {} }));
    expect(await searchArchive("  ")).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("survives a failing item metadata fetch", async () => {
    mockFetch((url) =>
      url.includes("advancedsearch")
        ? { body: searchBody }
        : { ok: false, status: 500, body: {} }
    );
    expect(await searchArchive("x")).toEqual([]);
  });

  it("throws when the search endpoint fails", async () => {
    mockFetch(() => ({ ok: false, status: 503, body: {} }));
    await expect(searchArchive("x")).rejects.toThrow("503");
  });

  it("handles array creators", async () => {
    mockFetch((url) =>
      url.includes("advancedsearch")
        ? { body: { response: { docs: [{ identifier: "id1", creator: ["Kapela", "Host"] }] } } }
        : { body: metadataBody }
    );
    const tracks = await searchArchive("x");
    expect(tracks[0].artist).toBe("Kapela");
  });
});
