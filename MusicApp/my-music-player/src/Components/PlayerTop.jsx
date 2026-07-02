import PropTypes from "prop-types";

const PlayerTop = ({ title, showBack, onBack, onOpenLibrary }) => {
  return (
    <div className="player-top">
      <button
        className="player-btn"
        type="button"
        aria-label={showBack ? "Zpět na přehrávač" : "Přehrávač"}
        disabled={!showBack}
        onClick={onBack}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>
      <span>{title}</span>
      <button
        className="player-btn"
        type="button"
        aria-label="Otevřít knihovnu"
        onClick={onOpenLibrary}
      >
        <i className="fa-solid fa-ellipsis"></i>
      </button>
    </div>
  );
};

PlayerTop.propTypes = {
  title: PropTypes.string.isRequired,
  showBack: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onOpenLibrary: PropTypes.func.isRequired,
};

export default PlayerTop;
