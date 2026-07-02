import type { Track } from "../types";

interface SongInfoProps {
  track: Track | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const SongInfo = ({ track, isFavorite, onToggleFavorite }: SongInfoProps) => {
  return (
    <div className="song-info">
      <div className="song-details">
        <span className="song-name">{track?.name ?? "Žádná skladba"}</span>
        <span className="song-artist">{track?.artist ?? "Vyber skladbu"}</span>
      </div>
      <button
        type="button"
        className={`favorite-btn ${isFavorite ? "is-favorite" : ""}`}
        onClick={onToggleFavorite}
        disabled={!track}
        aria-label={isFavorite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
        aria-pressed={isFavorite}
      >
        <i className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}></i>
      </button>
    </div>
  );
};

export default SongInfo;
