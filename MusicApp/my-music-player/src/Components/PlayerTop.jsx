import PropTypes from "prop-types";
import VolumeFlyout from "./VolumeFlyout";

const volumeIcon = (volume, muted) => {
  if (muted || volume === 0) return "fa-volume-xmark";
  if (volume < 0.5) return "fa-volume-low";
  return "fa-volume-high";
};

const PlayerTop = ({
  title,
  volumeOpen,
  onToggleVolume,
  onCloseVolume,
  volume,
  muted,
  onChangeVolume,
  onToggleMute,
}) => {
  return (
    <div className="player-top">
      <span className="player-top-logo" aria-hidden="true">
        <i className="fa-solid fa-compact-disc"></i>
      </span>
      <span>{title}</span>
      <button
        type="button"
        className={`player-btn ${volumeOpen ? "active" : ""}`}
        onClick={onToggleVolume}
        aria-label="Hlasitost"
        aria-expanded={volumeOpen}
      >
        <i className={`fa-solid ${volumeIcon(volume, muted)}`}></i>
      </button>
      {volumeOpen && (
        <VolumeFlyout
          volume={volume}
          muted={muted}
          onChangeVolume={onChangeVolume}
          onToggleMute={onToggleMute}
          onClose={onCloseVolume}
        />
      )}
    </div>
  );
};

PlayerTop.propTypes = {
  title: PropTypes.string.isRequired,
  volumeOpen: PropTypes.bool.isRequired,
  onToggleVolume: PropTypes.func.isRequired,
  onCloseVolume: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,
  onChangeVolume: PropTypes.func.isRequired,
  onToggleMute: PropTypes.func.isRequired,
};

export default PlayerTop;
