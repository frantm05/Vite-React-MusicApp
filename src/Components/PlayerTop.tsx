import VolumeFlyout from "./VolumeFlyout";

const volumeIcon = (volume: number, muted: boolean) => {
  if (muted || volume === 0) return "fa-volume-xmark";
  if (volume < 0.5) return "fa-volume-low";
  return "fa-volume-high";
};

interface PlayerTopProps {
  title: string;
  volumeOpen: boolean;
  onToggleVolume: () => void;
  onCloseVolume: () => void;
  volume: number;
  muted: boolean;
  onChangeVolume: (volume: number) => void;
  onToggleMute: () => void;
}

const PlayerTop = ({
  title,
  volumeOpen,
  onToggleVolume,
  onCloseVolume,
  volume,
  muted,
  onChangeVolume,
  onToggleMute,
}: PlayerTopProps) => {
  return (
    <header className="player-top">
      {/* aria-live announces the view change to screen readers on tab switch */}
      <h1 className="player-top-title" aria-live="polite">
        {title}
      </h1>
      <button
        type="button"
        className={`player-btn ${volumeOpen ? "active" : ""}`}
        onClick={onToggleVolume}
        // Keep the flyout's outside-pointerdown close handler from firing
        // first and turning this click into close-then-reopen.
        onPointerDown={(e) => e.stopPropagation()}
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
    </header>
  );
};

export default PlayerTop;
