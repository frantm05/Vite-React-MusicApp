import PropTypes from "prop-types";

const REPEAT_ICON = {
  off: "fa-repeat",
  all: "fa-repeat",
  one: "fa-1",
};

const Controls = ({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
}) => {
  return (
    <div className="controls">
      <button
        type="button"
        className={`player-btn mini-btn ${shuffle ? "active" : ""}`}
        onClick={onToggleShuffle}
        aria-label="Náhodné přehrávání"
        aria-pressed={shuffle}
      >
        <i className="fa-solid fa-shuffle"></i>
      </button>
      <button
        className="player-btn prev-btn"
        type="button"
        onClick={onPrev}
        aria-label="Předchozí skladba"
      >
        <i className="fa-solid fa-backward"></i>
      </button>
      <button
        className="player-btn play-pause"
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pozastavit" : "Přehrát"}
      >
        {isPlaying ? (
          <i className="fa-solid fa-pause"></i>
        ) : (
          <i className="fa-solid fa-play"></i>
        )}
      </button>
      <button
        className="player-btn next-btn"
        type="button"
        onClick={onNext}
        aria-label="Další skladba"
      >
        <i className="fa-solid fa-forward"></i>
      </button>
      <button
        type="button"
        className={`player-btn mini-btn ${repeatMode !== "off" ? "active" : ""}`}
        onClick={onCycleRepeat}
        aria-label={`Opakování: ${repeatMode === "off" ? "vypnuto" : repeatMode === "all" ? "vše" : "jedna skladba"}`}
      >
        <i className={`fa-solid ${REPEAT_ICON[repeatMode]}`}></i>
      </button>
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onTogglePlay: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  shuffle: PropTypes.bool.isRequired,
  onToggleShuffle: PropTypes.func.isRequired,
  repeatMode: PropTypes.oneOf(["off", "all", "one"]).isRequired,
  onCycleRepeat: PropTypes.func.isRequired,
};

export default Controls;
