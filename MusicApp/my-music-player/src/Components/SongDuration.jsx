import PropTypes from "prop-types";

const SongDuration = ({ progressPercent, onSeekPercent }) => {
  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const { left, width } = bar.getBoundingClientRect();
    const percent = ((e.clientX - left) / width) * 100;
    onSeekPercent(Math.min(100, Math.max(0, percent)));
  };

  return (
    <div className="song-duration">
      <div
        className="song-time"
        onClick={handleSeek}
        role="slider"
        tabIndex={0}
        aria-label="Průběh skladby"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent) || 0}
      >
        <div className="song-progress" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
};

SongDuration.propTypes = {
  progressPercent: PropTypes.number.isRequired,
  onSeekPercent: PropTypes.func.isRequired,
};

export default SongDuration;
