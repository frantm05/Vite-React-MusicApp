import { useEffect, useState } from "react";
import PlayerTop from "./PlayerTop";
import PlayerBody from "./PlayerBody";
import TrackList from "./TrackList";
import SearchView from "./SearchView";
import SongInfo from "./SongInfo";
import SongDuration from "./SongDuration";
import Time from "./Time";
import VolumeControl from "./VolumeControl";
import PlayerFooter from "./PlayerFooter";
import Controls from "./Controls";
import { localLibrary } from "../data/localLibrary";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLocalStorage } from "../hooks/useLocalStorage";

const VIEW_TITLES = {
  player: "Now Playing...",
  library: "Knihovna",
  search: "Hledat",
  favorites: "Oblíbené",
};

/**
 * Top-level orchestrator: owns which list is currently playable (the
 * "queue"), the active view, favorites and playback settings. Actual
 * audio mechanics live in useAudioPlayer.
 */
const MusicApp = () => {
  const [view, setView] = useState("player");
  const [queue, setQueue] = useState(localLibrary);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [favorites, setFavorites] = useLocalStorage("musicapp:favorites", []);
  const [savedVolume, setSavedVolume] = useLocalStorage("musicapp:volume", 1);

  const player = useAudioPlayer({
    queue,
    index: queueIndex,
    onIndexChange: setQueueIndex,
    repeatMode,
    shuffle,
    initialVolume: savedVolume,
  });

  // Persist volume changes only - setSavedVolume is stable and intentionally excluded.
  useEffect(() => {
    setSavedVolume(player.volume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.volume]);

  const isFavorite = (trackId) => favorites.some((track) => track.id === trackId);

  const toggleFavorite = (track) => {
    setFavorites((current) =>
      isFavorite(track.id)
        ? current.filter((t) => t.id !== track.id)
        : [...current, track]
    );
  };

  const playFromList = (list, clickedIndex) => {
    const clickedTrack = list[clickedIndex];
    if (player.currentTrack?.id === clickedTrack.id) {
      player.togglePlay();
      return;
    }
    setQueue(list);
    player.selectTrack(clickedIndex);
    setView("player");
  };

  const cycleRepeatMode = () => {
    setRepeatMode((mode) => {
      if (mode === "off") return "all";
      if (mode === "all") return "one";
      return "off";
    });
  };

  const goToView = (targetView) => {
    setView((current) => (current === targetView ? "player" : targetView));
  };

  return (
    <div className="container">
      <div className="player">
        <PlayerTop
          title={VIEW_TITLES[view]}
          showBack={view !== "player"}
          onBack={() => setView("player")}
          onOpenLibrary={() => goToView("library")}
        />

        {view === "player" && (
          <PlayerBody track={player.currentTrack} isPlaying={player.isPlaying} />
        )}
        {view === "library" && (
          <TrackList
            tracks={localLibrary}
            activeTrackId={player.currentTrack?.id}
            onSelect={(i) => playFromList(localLibrary, i)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            emptyMessage="Knihovna je prázdná."
          />
        )}
        {view === "search" && (
          <SearchView
            activeTrackId={player.currentTrack?.id}
            onSelect={playFromList}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {view === "favorites" && (
          <TrackList
            tracks={favorites}
            activeTrackId={player.currentTrack?.id}
            onSelect={(i) => playFromList(favorites, i)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            emptyMessage="Zatím nemáš žádné oblíbené skladby. Přidej je srdíčkem u skladby."
          />
        )}

        <SongInfo
          track={player.currentTrack}
          isFavorite={player.currentTrack ? isFavorite(player.currentTrack.id) : false}
          onToggleFavorite={() => player.currentTrack && toggleFavorite(player.currentTrack)}
        />

        {player.error && <p className="player-error">{player.error}</p>}

        <SongDuration
          progressPercent={player.progressPercent}
          onSeekPercent={player.seekByPercent}
        />
        <Time currentTime={player.currentTime} duration={player.duration} />

        <VolumeControl
          volume={player.volume}
          muted={player.muted}
          onChangeVolume={player.changeVolume}
          onToggleMute={player.toggleMute}
        />

        <Controls
          isPlaying={player.isPlaying}
          onTogglePlay={player.togglePlay}
          onNext={player.next}
          onPrev={player.prev}
          shuffle={shuffle}
          onToggleShuffle={() => setShuffle((s) => !s)}
          repeatMode={repeatMode}
          onCycleRepeat={cycleRepeatMode}
        />

        <audio ref={player.audioRef} className="audio" preload="metadata" />

        <PlayerFooter view={view} onNavigate={goToView} />
      </div>
    </div>
  );
};

export default MusicApp;
