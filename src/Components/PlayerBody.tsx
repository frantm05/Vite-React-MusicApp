import type { Track } from "../types";

interface PlayerBodyProps {
  track: Track | null;
  isPlaying: boolean;
}

const PlayerBody = ({ track, isPlaying }: PlayerBodyProps) => {
  return (
    <div className="player-body">
      <div className="current-song">
        {track?.img ? (
          <img
            src={track.img}
            alt={`${track.name} cover`}
            className={`cover ${isPlaying ? "rotate" : ""}`}
          />
        ) : (
          <div className={`cover cover-empty ${track && isPlaying ? "rotate" : ""}`}>
            <i className="fa-solid fa-music"></i>
          </div>
        )}
        {track?.isPreview && <span className="preview-badge">30s ukázka</span>}
      </div>
    </div>
  );
};

export default PlayerBody;
