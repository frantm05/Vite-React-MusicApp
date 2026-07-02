import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";

const SEEK_STEP_PERCENT = 2;

const SongDuration = ({ progressPercent, onSeekPercent }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const percentFromClientX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return 0;
    const { left, width } = track.getBoundingClientRect();
    if (width === 0) return 0;
    return Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    onSeekPercent(percentFromClientX(e.clientX));
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    onSeekPercent(percentFromClientX(e.clientX));
  };

  const stopDragging = (e) => {
    if (!dragging) return;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e) => {
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
      className={`song-duration ${dragging ? "dragging" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label="Průběh skladby"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progressPercent) || 0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onKeyDown={handleKeyDown}
    >
      <div className="song-time" ref={trackRef}>
        <div className="song-progress" style={{ width: `${progressPercent}%` }}>
          <span className="song-progress-handle" />
        </div>
      </div>
    </div>
  );
};

SongDuration.propTypes = {
  progressPercent: PropTypes.number.isRequired,
  onSeekPercent: PropTypes.func.isRequired,
};

export default SongDuration;
