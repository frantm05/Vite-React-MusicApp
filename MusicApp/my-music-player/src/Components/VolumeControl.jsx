import PropTypes from "prop-types";

const volumeIcon = (volume, muted) => {
  if (muted || volume === 0) return "fa-volume-xmark";
  if (volume < 0.5) return "fa-volume-low";
  return "fa-volume-high";
};

const VolumeControl = ({ volume, muted, onChangeVolume, onToggleMute }) => {
  return (
    <div className="volume-control">
      <button
        type="button"
        className="player-btn mini-btn"
        onClick={onToggleMute}
        aria-label={muted ? "Zapnout zvuk" : "Ztlumit"}
        aria-pressed={muted}
      >
        <i className={`fa-solid ${volumeIcon(volume, muted)}`}></i>
      </button>
      <input
        type="range"
        className="volume-slider"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={(e) => onChangeVolume(Number(e.target.value))}
        aria-label="Hlasitost"
      />
    </div>
  );
};

VolumeControl.propTypes = {
  volume: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,
  onChangeVolume: PropTypes.func.isRequired,
  onToggleMute: PropTypes.func.isRequired,
};

export default VolumeControl;
