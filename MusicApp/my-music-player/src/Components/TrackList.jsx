import PropTypes from "prop-types";

/**
 * Renders any list of tracks (library, search results, favorites) with
 * consistent selection/favorite behaviour.
 */
const TrackList = ({ tracks, activeTrackId, onSelect, favorites, onToggleFavorite, emptyMessage }) => {
  if (tracks.length === 0) {
    return <p className="list-empty-state">{emptyMessage}</p>;
  }

  const isFavorite = (id) => favorites.some((track) => track.id === id);

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
            <img src={track.img} alt="" />
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
        </div>
      ))}
    </div>
  );
};

TrackList.propTypes = {
  tracks: PropTypes.array.isRequired,
  activeTrackId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  favorites: PropTypes.array.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

export default TrackList;
