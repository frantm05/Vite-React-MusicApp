import propTypes from "prop-types";


const PlayerTop = (props) => {

  const handleRefresh = () => {
    window.location.reload();
  };



  return (
    <div className="player-top">
      <button className="player-btn" type="button">
        <i className="fa-solid fa-rotate-right" onClick={handleRefresh}></i>
      </button>
      <span>Now Playing...</span>
      <button
        className="player-btn"
        type="button"
        onClick={props.handleShowSongsList}
      >
        <i className="fa-solid fa-ellipsis"></i>
      </button>
    </div>
  );
};



export default PlayerTop;
