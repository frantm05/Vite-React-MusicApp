import { useCallback, useRef, useState } from "react";
import { formatTime } from "../utils/formatTime";

const SEEK_STEP_PERCENT = 2;

interface SongDurationProps {
  progressPercent: number;
  currentTime: number;
  duration: number;
  onSeekPercent: (percent: number) => void;
}

/**
 * Seekable progress bar. While dragging, only the local visual position
 * updates; the actual seek is committed once on release, so a slow network
 * stream isn't asked to seek dozens of times per second.
 */
const SongDuration = ({ progressPercent, currentTime, duration, onSeekPercent }: SongDurationProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragPercent, setDragPercent] = useState<number | null>(null);

  const disabled = duration <= 0;
  const shownPercent = dragPercent ?? progressPercent;

  const percentFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const { left, width } = track.getBoundingClientRect();
    if (width === 0) return 0;
    return Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPercent(percentFromClientX(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPercent === null) return;
    setDragPercent(percentFromClientX(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPercent === null) return;
    onSeekPercent(percentFromClientX(e.clientX));
    setDragPercent(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = () => setDragPercent(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeekPercent(Math.min(100, progressPercent + SEEK_STEP_PERCENT));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeekPercent(Math.max(0, progressPercent - SEEK_STEP_PERCENT));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeekPercent(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeekPercent(100);
    }
  };

  return (
    <div
      className={`song-duration ${dragPercent !== null ? "dragging" : ""} ${disabled ? "disabled" : ""}`}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Průběh skladby"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shownPercent) || 0}
      aria-valuetext={`${formatTime(currentTime)} z ${formatTime(duration)}`}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
    >
      <div className="song-time" ref={trackRef}>
        <div className="song-progress" style={{ width: `${shownPercent}%` }}>
          {!disabled && <span className="song-progress-handle" />}
        </div>
      </div>
    </div>
  );
};

export default SongDuration;
