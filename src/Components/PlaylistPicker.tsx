import { useState } from "react";
import type { Playlist, Track } from "../types";

interface PlaylistPickerProps {
  track: Track;
  playlists: Playlist[];
  onPick: (playlistId: string) => void;
  onCreateAndPick: (name: string) => void;
  onClose: () => void;
}

/** Bottom-sheet style picker for "add this track to which playlist?". */
const PlaylistPicker = ({ track, playlists, onPick, onCreateAndPick, onClose }: PlaylistPickerProps) => {
  const [newName, setNewName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateAndPick(newName);
  };

  return (
    <div className="playlist-picker" onClick={onClose}>
      <div
        className="playlist-picker-panel"
        role="dialog"
        aria-label={`Přidat skladbu ${track.name} do playlistu`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="playlist-picker-header">
          <span>
            Přidat <strong>{track.name}</strong> do:
          </span>
          <button type="button" className="row-action-btn" onClick={onClose} aria-label="Zavřít">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {playlists.length > 0 && (
          <ul className="playlist-picker-list">
            {playlists.map((playlist) => {
              const alreadyIn = playlist.tracks.some((t) => t.id === track.id);
              return (
                <li key={playlist.id}>
                  <button
                    type="button"
                    onClick={() => onPick(playlist.id)}
                    disabled={alreadyIn}
                  >
                    <i className={`fa-solid ${alreadyIn ? "fa-check" : "fa-layer-group"}`}></i>
                    <span>{playlist.name}</span>
                    {alreadyIn && <small>už obsahuje</small>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <form className="playlist-create" onSubmit={handleCreate}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nebo nový playlist..."
            aria-label="Název nového playlistu"
            maxLength={60}
          />
          <button type="submit" disabled={!newName.trim()}>
            <i className="fa-solid fa-plus"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaylistPicker;
