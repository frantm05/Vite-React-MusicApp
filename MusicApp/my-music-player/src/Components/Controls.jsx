import { propTypes } from "react";

const Controls = (props) => {
  const prevSongPlay = () => {
    props.setSongIndex((prevIndex) => {
      let newIndex = prevIndex - 1;
      if (newIndex < 0) {
        newIndex = props.songData.length - 1;
      }
      return newIndex;
    });
    props.loadSong(props.songIndex);
  };


  const playSong = () => {
    props.setIsPlaying(true);
    props.audioRef.current.play();
  };

  const pauseSong = () => {
    props.setIsPlaying(false);
    props.audioRef.current.pause();
  };

  return (
    <div className="controls">
      <button
        className="player-btn prev-btn"
        type="button"
        onClick={prevSongPlay}
      >
        <i className="fa-solid fa-backward"></i>
      </button>
      <button
        className="player-btn play-pause"
        type="button"
        onClick={props.isPlaying ? pauseSong : playSong}
      >
        {props.isPlaying ? (
          <i className="fa-solid fa-pause"></i>
        ) : (
          <i className="fa-solid fa-play"></i>
        )}
      </button>
      <button
        className="player-btn next-btn"
        type="button"
        onClick={props.nextSongPlay}
      >
        <i className="fa-solid fa-forward"></i>
      </button>
    </div>
  );
};



export default Controls;
