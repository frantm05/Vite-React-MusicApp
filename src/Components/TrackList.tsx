import type { StoredFavorite, Track } from "../types";

interface TrackListProps {
  tracks: Track[];
  activeTrackId?: string;
  onSelect: (index: number) => void;
  favorites: StoredFavorite[];
  onToggleFavorite: (track: Track) => void;
  emptyMessage: string;
  onDelete?: (trackId: string) => void;
}

/**
 * Renders any list of tracks (library, search results, favorites) with
 * consistent selection/favorite behaviour. Custom (user-uploaded) tracks
 * additionally get a delete button when onDelete is provided.
 */
const TrackList = ({
  tracks,
  activeTrackId,
  onSelect,
  favorites,
  onToggleFavorite,
  emptyMessage,
  onDelete,
}: TrackListProps) => {
  if (tracks.length === 0) {
    return <p className="list-empty-state">{emptyMessage}</p>;
  }

  const isFavorite = (id: string) => favorites.some((track) => track.id === id);

  return (
    <div className="songs-list">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`song-list-details ${activeTrackId === track.id ? "selected" : ""}`}
        >
          <button
            type="button"
            className="song-list-play"
            onClick={() => onSelect(index)}
          >
            {track.img ? (
              <img src={track.img} alt="" />
            ) : (
              <span className="song-list-cover-empty" aria-hidden="true">
                <i className="fa-solid fa-music"></i>
              </span>
            )}
            <div className="song-list-name">
              <span>{track.name}</span>
              <div>{track.artist}</div>
            </div>
            {track.isPreview && <span className="preview-badge small">30s</span>}
          </button>
          <button
            type="button"
            className={`favorite-btn ${isFavorite(track.id) ? "is-favorite" : ""}`}
            onClick={() => onToggleFavorite(track)}
            aria-label={isFavorite(track.id) ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
            aria-pressed={isFavorite(track.id)}
          >
            <i className={`fa-${isFavorite(track.id) ? "solid" : "regular"} fa-heart`}></i>
          </button>
          {track.source === "custom" && onDelete && (
            <button
              type="button"
              className="delete-track-btn"
              onClick={() => onDelete(track.id)}
              aria-label={`Smazat skladbu ${track.name}`}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackList;
