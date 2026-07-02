import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomTrack } from "../types";
import {
  getAllCustomTracks,
  putCustomTrack,
  deleteCustomTrack,
  type CustomTrackRecord,
} from "../services/customTracksDb";

const toTrack = (record: CustomTrackRecord): CustomTrack => ({
  id: record.id,
  source: "custom",
  isPreview: false,
  name: record.name,
  artist: record.artist,
  src: URL.createObjectURL(record.audioBlob),
  img: record.imgBlob ? URL.createObjectURL(record.imgBlob) : null,
});

export interface AddTrackInput {
  name: string;
  artist: string;
  audioFile: File;
  imgFile: File | null;
}

/** Tracks the user uploaded themselves, persisted in IndexedDB across reloads. */
export function useCustomLibrary() {
  const [tracks, setTracks] = useState<CustomTrack[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllCustomTracks()
      .then((records) => {
        if (cancelled) return;
        const mapped = records.map(toTrack);
        objectUrlsRef.current = mapped.flatMap((t) => (t.img ? [t.src, t.img] : [t.src]));
        setTracks(mapped);
      })
      .catch(() => {
        // IndexedDB unavailable (private mode, storage disabled) or corrupted
        if (!cancelled) setLoadError("Vlastní skladby se nepodařilo načíst.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Revoke every object URL we ever created once the app unmounts.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addTrack = useCallback(async ({ name, artist, audioFile, imgFile }: AddTrackInput) => {
    const record: CustomTrackRecord = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      artist,
      audioBlob: audioFile,
      imgBlob: imgFile,
    };
    await putCustomTrack(record);
    const track = toTrack(record);
    objectUrlsRef.current.push(track.src, ...(track.img ? [track.img] : []));
    setTracks((current) => [...current, track]);
    return track;
  }, []);

  const removeTrack = useCallback(async (id: string) => {
    await deleteCustomTrack(id);
    setTracks((current) => {
      const removed = current.find((t) => t.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.src);
        if (removed.img) URL.revokeObjectURL(removed.img);
      }
      return current.filter((t) => t.id !== id);
    });
  }, []);

  return { customTracks: tracks, customLibraryError: loadError, addTrack, removeTrack };
}
