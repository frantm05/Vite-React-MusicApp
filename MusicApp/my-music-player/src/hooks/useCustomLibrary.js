import { useCallback, useEffect, useRef, useState } from "react";
import { getAllCustomTracks, putCustomTrack, deleteCustomTrack } from "../services/customTracksDb";

const toTrack = (record) => ({
  id: record.id,
  source: "custom",
  isPreview: false,
  name: record.name,
  artist: record.artist,
  src: URL.createObjectURL(record.audioBlob),
  img: record.imgBlob ? URL.createObjectURL(record.imgBlob) : null,
});

/** Tracks the user uploaded themselves, persisted in IndexedDB across reloads. */
export function useCustomLibrary() {
  const [tracks, setTracks] = useState([]);
  const objectUrlsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    getAllCustomTracks().then((records) => {
      if (cancelled) return;
      const mapped = records.map(toTrack);
      objectUrlsRef.current = mapped.flatMap((t) => [t.src, t.img].filter(Boolean));
      setTracks(mapped);
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

  const addTrack = useCallback(async ({ name, artist, audioFile, imgFile }) => {
    const record = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      artist,
      audioBlob: audioFile,
      imgBlob: imgFile ?? null,
    };
    await putCustomTrack(record);
    const track = toTrack(record);
    objectUrlsRef.current.push(track.src, ...(track.img ? [track.img] : []));
    setTracks((current) => [...current, track]);
    return track;
  }, []);

  const removeTrack = useCallback(async (id) => {
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

  return { customTracks: tracks, addTrack, removeTrack };
}
