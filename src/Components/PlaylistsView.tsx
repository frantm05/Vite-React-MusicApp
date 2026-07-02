import { useState } from "react";
import type { CustomTrack, Playlist, StoredTrackRef, Track } from "../types";
import { rehydrateTrackRefs } from "../utils/trackRefs";
import TrackList from "./TrackList";

interface PlaylistsViewProps {
  playlists: Playlist[];
  activePlaylistId: string | null;
  onOpenPlaylist: (id: string | null) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveTrack: (playlistId: string, trackId: string) => void;
  customTracks: CustomTrack[];
  activeTrackId?: string;
  onSelect: (list: Track[], index: number) => void;
  favorites: StoredTrackRef[];
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
}

const PlaylistsView = ({
  playlists,
  activePlaylistId,
  onOpenPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveTrack,
  customTracks,
  activeTrackId,
  onSelect,
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
}: PlaylistsViewProps) => {
  const [newName, setNewName] = useState("");

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) ?? null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreatePlaylist(newName);
    setNewName("");
  };

  if (activePlaylist) {
    const tracks = rehydrateTrackRefs(activePlaylist.tracks, customTracks);
    return (
      <div className="playlists-view">
        <div className="playlist-detail-header">
          <button
            type="button"
            className="row-action-btn"
            onClick={() => onOpenPlaylist(null)}
            aria-label="Zpět na seznam playlistů"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <span className="playlist-detail-name">{activePlaylist.name}</span>
          <button
            type="button"
            className="row-action-btn delete-track-btn"
            onClick={() => {
              onDeletePlaylist(activePlaylist.id);
              onOpenPlaylist(null);
            }}
            aria-label={`Smazat playlist ${activePlaylist.name}`}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
        <TrackList
          tracks={tracks}
          activeTrackId={activeTrackId}
          onSelect={(i) => onSelect(tracks, i)}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onAddToPlaylist={onAddToPlaylist}
          onRemoveFromList={(trackId) => onRemoveTrack(activePlaylist.id, trackId)}
          emptyMessage="Playlist je prázdný. Skladby přidáš tlačítkem + u libovolné skladby."
        />
      </div>
    );
  }

  return (
    <div className="playlists-view">
      <form className="playlist-create" onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Název nového playlistu..."
          aria-label="Název nového playlistu"
          maxLength={60}
        />
        <button type="submit" disabled={!newName.trim()}>
          <i className="fa-solid fa-plus"></i> Vytvořit
        </button>
      </form>

      {playlists.length === 0 ? (
        <p className="list-empty-state">
          Zatím nemáš žádný playlist. Vytvoř si první a přidávej do něj skladby tlačítkem + u
          skladby.
        </p>
      ) : (
        <div className="songs-list">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="song-list-details">
              <button
                type="button"
                className="song-list-play"
                onClick={() => onOpenPlaylist(playlist.id)}
              >
                <span className="song-list-cover-empty" aria-hidden="true">
                  <i className="fa-solid fa-layer-group"></i>
                </span>
                <div className="song-list-name">
                  <span>{playlist.name}</span>
                  <div>
                    {playlist.tracks.length}{" "}
                    {playlist.tracks.length === 1
                      ? "skladba"
                      : playlist.tracks.length < 5
                        ? "skladby"
                        : "skladeb"}
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="row-action-btn delete-track-btn"
                onClick={() => onDeletePlaylist(playlist.id)}
                aria-label={`Smazat playlist ${playlist.name}`}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsView;
