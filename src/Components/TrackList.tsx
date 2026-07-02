import type { StoredTrackRef, Track } from "../types";

interface TrackListProps {
  tracks: Track[];
  activeTrackId?: string;
  onSelect: (index: number) => void;
  favorites: StoredTrackRef[];
  onToggleFavorite: (track: Track) => void;
  emptyMessage: string;
  /** Shows a trash button on custom (user-uploaded) tracks. */
  onDelete?: (trackId: string) => void;
  /** Shows a "+" button opening the playlist picker. */
  onAddToPlaylist?: (track: Track) => void;
  /** Shows a download button on downloadable Audius tracks. */
  onSaveToLibrary?: (track: Track) => void;
  savingTrackId?: string | null;
  /** Shows an "x" button on every row (used inside a playlist). */
  onRemoveFromList?: (trackId: string) => void;
}

/**
 * Renders any list of tracks (library, search results, favorites, playlist)
 * with consistent selection/favorite behaviour; extra per-row actions are
 * opt-in via the optional handlers.
 */
const TrackList = ({
  tracks,
  activeTrackId,
  onSelect,
  favorites,
  onToggleFavorite,
  emptyMessage,
  onDelete,
  onAddToPlaylist,
  onSaveToLibrary,
  savingTrackId,
  onRemoveFromList,
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

          {onSaveToLibrary && track.source === "audius" && track.downloadable && (
            <button
              type="button"
              className="row-action-btn"
              onClick={() => onSaveToLibrary(track)}
              disabled={savingTrackId !== null}
              aria-label={`Stáhnout skladbu ${track.name} do knihovny`}
            >
              <i
                className={`fa-solid ${savingTrackId === track.id ? "fa-spinner fa-spin" : "fa-download"}`}
              ></i>
            </button>
          )}

          {onAddToPlaylist && (
            <button
              type="button"
              className="row-action-btn"
              onClick={() => onAddToPlaylist(track)}
              aria-label={`Přidat skladbu ${track.name} do playlistu`}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          )}

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
              className="row-action-btn delete-track-btn"
              onClick={() => onDelete(track.id)}
              aria-label={`Smazat skladbu ${track.name}`}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}

          {onRemoveFromList && (
            <button
              type="button"
              className="row-action-btn delete-track-btn"
              onClick={() => onRemoveFromList(track.id)}
              aria-label={`Odebrat skladbu ${track.name} z playlistu`}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackList;
