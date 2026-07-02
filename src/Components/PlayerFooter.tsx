import type { View } from "../types";

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: "player", icon: "fa-compact-disc", label: "Přehrávač" },
  { view: "library", icon: "fa-list", label: "Knihovna" },
  { view: "search", icon: "fa-magnifying-glass", label: "Hledat" },
  { view: "favorites", icon: "fa-heart", label: "Oblíbené" },
];

interface PlayerFooterProps {
  view: View;
  onNavigate: (view: View) => void;
}

const PlayerFooter = ({ view, onNavigate }: PlayerFooterProps) => {
  return (
    <nav className="player-footer" aria-label="Hlavní navigace">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.view}
          type="button"
          className={`footer-nav-btn footer-nav-${item.view} ${view === item.view ? "active" : ""}`}
          onClick={() => onNavigate(item.view)}
          aria-label={item.label}
          aria-current={view === item.view}
        >
          <i className={`fa-solid ${item.icon}`}></i>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default PlayerFooter;
