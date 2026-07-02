import PropTypes from "prop-types";

const SongInfo = ({ track, isFavorite, onToggleFavorite }) => {
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

SongInfo.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
    artist: PropTypes.string,
  }),
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func.isRequired,
};

export default SongInfo;
