import PropTypes from "prop-types";

const NAV_ITEMS = [
  { view: "library", icon: "fa-list", label: "Knihovna" },
  { view: "search", icon: "fa-magnifying-glass", label: "Hledat" },
  { view: "favorites", icon: "fa-heart", label: "Oblíbené" },
];

const PlayerFooter = ({ view, onNavigate }) => {
  return (
    <div className="player-footer">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.view}
          type="button"
          className={`footer-nav-btn ${view === item.view ? "active" : ""}`}
          onClick={() => onNavigate(item.view)}
          aria-label={item.label}
          aria-pressed={view === item.view}
        >
          <i className={`fa-solid ${item.icon}`}></i>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

PlayerFooter.propTypes = {
  view: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default PlayerFooter;
