import { useCallback } from "react";
import type { Playlist, Track } from "../types";
import { toStoredTrackRef } from "../utils/trackRefs";
import { useLocalStorage } from "./useLocalStorage";

/** User-created playlists, persisted to localStorage as track references. */
export function usePlaylists() {
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>("musicapp:playlists", []);

  const createPlaylist = useCallback(
    (name: string): Playlist => {
      const playlist: Playlist = {
        id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        tracks: [],
      };
      setPlaylists((current) => [...current, playlist]);
      return playlist;
    },
    [setPlaylists]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      setPlaylists((current) => current.filter((p) => p.id !== playlistId));
    },
    [setPlaylists]
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, track: Track) => {
      setPlaylists((current) =>
        current.map((p) =>
          p.id === playlistId && !p.tracks.some((t) => t.id === track.id)
            ? { ...p, tracks: [...p.tracks, toStoredTrackRef(track)] }
            : p
        )
      );
    },
    [setPlaylists]
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists((current) =>
        current.map((p) =>
          p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
        )
      );
    },
    [setPlaylists]
  );

  /** Removes a (deleted) track from every playlist. */
  const removeTrackEverywhere = useCallback(
    (trackId: string) => {
      setPlaylists((current) =>
        current.map((p) =>
          p.tracks.some((t) => t.id === trackId)
            ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
            : p
        )
      );
    },
    [setPlaylists]
  );

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    removeTrackEverywhere,
  };
}
