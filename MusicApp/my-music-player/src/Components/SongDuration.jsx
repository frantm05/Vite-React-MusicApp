import { propTypes } from "react";

const SongDuration = (props) => {
  const handleProgressBarClick = (e) => {
    const progressBar = e.target;
    const { clientX } = e;
    const { x, width } = progressBar.getBoundingClientRect();
    const clickPositionInBar = clientX - x;
    const clickPositionInPercent = clickPositionInBar / width;
    const newTime = props.audioRef.current.duration * clickPositionInPercent;
    props.audioRef.current.currentTime = newTime;
  };

  return (
    <div className="song-duration">
      <div className="song-time" onClick={handleProgressBarClick}>
        <div className="song-progress">
          <audio ref={props.audioRef} className="audio"></audio>
        </div>
      </div>
    </div>
  );
};



export default SongDuration;
