import { useEffect, useMemo, useState } from "react";
import PlayerTop from "./PlayerTop";
import PlayerBody from "./PlayerBody";
import TrackList from "./TrackList";
import SearchView from "./SearchView";
import SongInfo from "./SongInfo";
import SongDuration from "./SongDuration";
import Time from "./Time";
import PlayerFooter from "./PlayerFooter";
import Controls from "./Controls";
import AddTrackForm from "./AddTrackForm";
import { localLibrary } from "../data/localLibrary";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useCustomLibrary } from "../hooks/useCustomLibrary";
import { useItunesSearch } from "../hooks/useItunesSearch";
import type { RepeatMode, StoredFavorite, Track, View } from "../types";

const VIEW_TITLES: Record<View, string> = {
  player: "Přehrává se",
  library: "Knihovna",
  search: "Hledat",
  favorites: "Oblíbené",
};

/**
 * Persisted favorite: custom tracks are stored as a bare reference because
 * their blob: URLs die on reload - they get rehydrated from the custom
 * library at runtime. Other tracks are stored whole.
 */
const toStoredFavorite = (track: Track): StoredFavorite =>
  track.source === "custom"
    ? { source: "custom", id: track.id, name: track.name, artist: track.artist }
    : track;

/**
 * Top-level orchestrator: owns which list is currently playable (the
 * "queue"), the active view, favorites and playback settings. Actual
 * audio mechanics live in useAudioPlayer.
 */
const MusicApp = () => {
  // On desktop the player pane is always visible and its tab is hidden,
  // so the content pane starts on the library instead.
  const [view, setView] = useState<View>(() =>
    window.matchMedia("(min-width: 900px)").matches ? "library" : "player"
  );
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [queue, setQueue] = useState<Track[]>(localLibrary);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [favorites, setFavorites] = useLocalStorage<StoredFavorite[]>("musicapp:favorites", []);
  const [savedVolume, setSavedVolume] = useLocalStorage<number>("musicapp:volume", 1);
  const { customTracks, customLibraryError, addTrack, removeTrack } = useCustomLibrary();
  const search = useItunesSearch();

  const libraryTracks = useMemo<Track[]>(
    () => [...localLibrary, ...customTracks],
    [customTracks]
  );

  // Rehydrate favorites: custom entries get their live blob URLs from the
  // custom library; entries whose track was deleted drop out silently.
  const favoriteTracks = useMemo<Track[]>(
    () =>
      favorites
        .map((fav) =>
          fav.source === "custom" ? customTracks.find((t) => t.id === fav.id) ?? null : fav
        )
        .filter((t): t is Track => t !== null),
    [favorites, customTracks]
  );

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

  const isFavorite = (trackId: string) => favorites.some((track) => track.id === trackId);

  const toggleFavorite = (track: Track) => {
    setFavorites((current) =>
      isFavorite(track.id)
        ? current.filter((t) => t.id !== track.id)
        : [...current, toStoredFavorite(track)]
    );
  };

  const playFromList = (list: Track[], clickedIndex: number) => {
    const clickedTrack = list[clickedIndex];
    if (player.currentTrack?.id === clickedTrack.id) {
      player.togglePlay();
      return;
    }
    setQueue(list);
    player.selectTrack(clickedIndex);
    setView("player");
  };

  const handleDeleteCustomTrack = (trackId: string) => {
    setFavorites((current) => current.filter((t) => t.id !== trackId));

    // Drop the track from the live queue too, keeping the current position
    // stable (or moving to the following track when deleting the one playing).
    const removedIndex = queue.findIndex((t) => t.id === trackId);
    if (removedIndex !== -1) {
      const newQueue = queue.filter((t) => t.id !== trackId);
      setQueue(newQueue);
      setQueueIndex((prev) => {
        if (removedIndex < prev) return prev - 1;
        if (removedIndex === prev) return Math.min(prev, Math.max(newQueue.length - 1, 0));
        return prev;
      });
    }

    void removeTrack(trackId);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((mode) => {
      if (mode === "off") return "all";
      if (mode === "all") return "one";
      return "off";
    });
  };

  // On desktop both panes are visible: the content pane falls back to the
  // library when the "player" tab is active.
  const contentView: Exclude<View, "player"> = view === "player" ? "library" : view;

  return (
    <div className="container">
      <div className="player">
        <PlayerTop
          title={VIEW_TITLES[view]}
          volumeOpen={volumeOpen}
          onToggleVolume={() => setVolumeOpen((v) => !v)}
          onCloseVolume={() => setVolumeOpen(false)}
          volume={player.volume}
          muted={player.muted}
          onChangeVolume={player.changeVolume}
          onToggleMute={player.toggleMute}
        />

        <div className="panes">
          <section
            className={`pane pane-player ${view !== "player" ? "mobile-hidden" : ""}`}
            aria-label="Přehrávač"
          >
            <PlayerBody track={player.currentTrack} isPlaying={player.isPlaying} />
          </section>

          <section
            className={`pane pane-content ${view === "player" ? "mobile-hidden" : ""}`}
            aria-label={VIEW_TITLES[contentView]}
          >
            {contentView === "library" && (
              <>
                <AddTrackForm onAdd={addTrack} />
                {customLibraryError && <p className="player-error">{customLibraryError}</p>}
                <TrackList
                  tracks={libraryTracks}
                  activeTrackId={player.currentTrack?.id}
                  onSelect={(i) => playFromList(libraryTracks, i)}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onDelete={handleDeleteCustomTrack}
                  emptyMessage="Knihovna je prázdná."
                />
              </>
            )}
            {contentView === "search" && (
              <SearchView
                search={search}
                activeTrackId={player.currentTrack?.id}
                onSelect={playFromList}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {contentView === "favorites" && (
              <TrackList
                tracks={favoriteTracks}
                activeTrackId={player.currentTrack?.id}
                onSelect={(i) => playFromList(favoriteTracks, i)}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onDelete={handleDeleteCustomTrack}
                emptyMessage="Zatím nemáš žádné oblíbené skladby. Přidej je srdíčkem u skladby."
              />
            )}
          </section>
        </div>

        <SongInfo
          track={player.currentTrack}
          isFavorite={player.currentTrack ? isFavorite(player.currentTrack.id) : false}
          onToggleFavorite={() => player.currentTrack && toggleFavorite(player.currentTrack)}
        />

        {player.error && <p className="player-error">{player.error}</p>}

        <SongDuration
          progressPercent={player.progressPercent}
          currentTime={player.currentTime}
          duration={player.duration}
          onSeekPercent={player.seekByPercent}
        />
        <Time currentTime={player.currentTime} duration={player.duration} />

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

        <PlayerFooter view={view} onNavigate={setView} />
      </div>
    </div>
  );
};

export default MusicApp;
