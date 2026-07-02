import PropTypes from "prop-types";

const PlayerBody = ({ track, isPlaying }) => {
  return (
    <div className="player-body">
      <div className="current-song">
        {track ? (
          <img
            src={track.img}
            alt={`${track.name} cover`}
            className={`cover ${isPlaying ? "rotate" : ""}`}
          />
        ) : (
          <div className="cover cover-empty">
            <i className="fa-solid fa-music"></i>
          </div>
        )}
        {track?.isPreview && <span className="preview-badge">30s ukázka</span>}
      </div>
    </div>
  );
};

PlayerBody.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
    img: PropTypes.string,
    isPreview: PropTypes.bool,
  }),
  isPlaying: PropTypes.bool,
};

export default PlayerBody;
