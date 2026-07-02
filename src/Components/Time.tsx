import { formatTime } from "../utils/formatTime";

interface TimeProps {
  currentTime: number;
  duration: number;
}

const Time = ({ currentTime, duration }: TimeProps) => {
  return (
    <div className="time">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  );
};

export default Time;
