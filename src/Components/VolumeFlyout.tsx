import { useEffect, useRef } from "react";

const volumeIcon = (volume: number, muted: boolean) => {
  if (muted || volume === 0) return "fa-volume-xmark";
  if (volume < 0.5) return "fa-volume-low";
  return "fa-volume-high";
};

interface VolumeFlyoutProps {
  volume: number;
  muted: boolean;
  onChangeVolume: (volume: number) => void;
  onToggleMute: () => void;
  onClose: () => void;
}

/** Small popover anchored under the top bar's volume button. */
const VolumeFlyout = ({ volume, muted, onChangeVolume, onToggleMute, onClose }: VolumeFlyoutProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const percent = Math.round((muted ? 0 : volume) * 100);

  return (
    <div className="volume-flyout" ref={panelRef}>
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
        style={{ background: `linear-gradient(to right, #c86bff ${percent}%, #45464a ${percent}%)` }}
        onChange={(e) => onChangeVolume(Number(e.target.value))}
        aria-label="Hlasitost"
      />
      <span className="volume-percent">{percent}%</span>
    </div>
  );
};

export default VolumeFlyout;
