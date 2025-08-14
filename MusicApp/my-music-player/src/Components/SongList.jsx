import propTypes from "prop-types";

const SongList = (props) => {
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      props.setSongData([...props.songData, ...props.songData]);
    }
  };

  return (
    <div className="songs-list" onScroll={handleScroll}>
      {props.songData.map((song, index) => (
        <div
          ref={(ref) => (props.songRefs.current[index] = ref)}
          key={index}
          className={`song-list-details ${
            props.songIndex === index ? "selected" : ""
          }`}
          onClick={() => props.setSongIndex(index)}
        >
          <img src={"./src/assets/" + song.img} alt="cover" />
          <div className="song-list-name">
            <span>{song.name}</span>
            <div>{song.artist}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

SongList.propTypes = {
  songData: propTypes.array,
  songIndex: propTypes.number,
  setSongIndex: propTypes.func,
  setSongData: propTypes.func,
  songRefs: propTypes.object,
};

export default SongList;
