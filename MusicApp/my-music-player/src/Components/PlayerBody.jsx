import propTypes from 'prop-types';
import { useEffect } from 'react';

const PlayerBody = (props) => {

    useEffect(() => {
        const coverElement = document.querySelector(".cover");
    
        if (props.isPlaying && coverElement) {
          coverElement.classList.add("rotate");
        } else if (!props.isPlaying && coverElement) {
          coverElement.classList.remove("rotate");
        }
      });

    return(
        <div className="player-body">
            <div className="current-song">
              <img
                src={"./src/assets/" + props.songData[props.songIndex].img}
                alt="cover"
                className="cover"
              />
            </div>
          </div>
    )
}

PlayerBody.propTypes = {
    songData: propTypes.array,
    songIndex: propTypes.number,
    isPlaying: propTypes.bool
}

export default PlayerBody;