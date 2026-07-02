import type { CustomTrack, StoredTrackRef, Track } from "../types";

/**
 * Converts a track to its persistable form. Custom tracks keep only a bare
 * reference - their blob: URLs are session-scoped and must be rehydrated
 * from the custom library on load.
 */
export const toStoredTrackRef = (track: Track): StoredTrackRef =>
  track.source === "custom"
    ? { source: "custom", id: track.id, name: track.name, artist: track.artist }
    : track;

/**
 * Turns stored refs back into playable tracks. Custom refs resolve against
 * the live custom library; refs whose track was deleted drop out silently.
 */
export const rehydrateTrackRefs = (
  refs: StoredTrackRef[],
  customTracks: CustomTrack[]
): Track[] =>
  refs
    .map((ref) =>
      ref.source === "custom" ? customTracks.find((t) => t.id === ref.id) ?? null : ref
    )
    .filter((t): t is Track => t !== null);
