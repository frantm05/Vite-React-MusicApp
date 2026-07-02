import PropTypes from "prop-types";
import { formatTime } from "../utils/formatTime";

const Time = ({ currentTime, duration }) => {
  return (
    <div className="time">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  );
};

Time.propTypes = {
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
};

export default Time;
