import type { RepeatMode } from "../types";

const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: "Opakování: vypnuto",
  all: "Opakování: vše",
  one: "Opakování: jedna skladba",
};

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
}

const Controls = ({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
}: ControlsProps) => {
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
        aria-label={REPEAT_LABEL[repeatMode]}
      >
        <i className={`fa-solid ${repeatMode === "one" ? "fa-1" : "fa-repeat"}`}></i>
      </button>
    </div>
  );
};

export default Controls;
