import { useEffect, useMemo, useState } from "react";
import PlayerTop from "./PlayerTop";
import PlayerBody from "./PlayerBody";
import TrackList from "./TrackList";
import SearchView from "./SearchView";
import PlaylistsView from "./PlaylistsView";
import PlaylistPicker from "./PlaylistPicker";
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
import { useMusicSearch } from "../hooks/useMusicSearch";
import { usePlaylists } from "../hooks/usePlaylists";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { rehydrateTrackRefs, toStoredTrackRef } from "../utils/trackRefs";
import { isDownloadable, type RepeatMode, type StoredTrackRef, type Track, type View } from "../types";

const VIEW_TITLES: Record<View, string> = {
  player: "Přehrává se",
  library: "Knihovna",
  search: "Hledat",
  playlists: "Playlisty",
  favorites: "Oblíbené",
};

/** Left-to-right tab order used by swipe navigation. */
const VIEW_ORDER: View[] = ["player", "library", "search", "playlists", "favorites"];

const NOTICE_TIMEOUT_MS = 4000;

/**
 * Top-level orchestrator: owns which list is currently playable (the
 * "queue"), the active view, favorites, playlists and playback settings.
 * Actual audio mechanics live in useAudioPlayer.
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
  const [favorites, setFavorites] = useLocalStorage<StoredTrackRef[]>("musicapp:favorites", []);
  const [savedVolume, setSavedVolume] = useLocalStorage<number>("musicapp:volume", 1);
  const { customTracks, customLibraryError, addTrack, removeTrack } = useCustomLibrary();
  const search = useMusicSearch();
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    removeTrackEverywhere,
  } = usePlaylists();
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [pickerTrack, setPickerTrack] = useState<Track | null>(null);
  const [savingTrackId, setSavingTrackId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const libraryTracks = useMemo<Track[]>(
    () => [...localLibrary, ...customTracks],
    [customTracks]
  );

  // Rehydrate favorites: custom entries get their live blob URLs from the
  // custom library; entries whose track was deleted drop out silently.
  const favoriteTracks = useMemo<Track[]>(
    () => rehydrateTrackRefs(favorites, customTracks),
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

  // Transient notices (saved to library, errors...) clear themselves.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const isFavorite = (trackId: string) => favorites.some((track) => track.id === trackId);

  const toggleFavorite = (track: Track) => {
    setFavorites((current) =>
      isFavorite(track.id)
        ? current.filter((t) => t.id !== track.id)
        : [...current, toStoredTrackRef(track)]
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
    removeTrackEverywhere(trackId);

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

  /**
   * Fetches a downloadable track (Audius, Internet Archive) and stores it
   * in the local (IndexedDB-backed) library, so it plays even offline.
   */
  const saveToLibrary = async (track: Track) => {
    if (!isDownloadable(track) || savingTrackId) return;
    setSavingTrackId(track.id);
    try {
      const audioResponse = await fetch(track.src);
      if (!audioResponse.ok) throw new Error(`download failed: ${audioResponse.status}`);
      const audioBlob = await audioResponse.blob();

      let imgFile: File | null = null;
      if (track.img) {
        try {
          const imgResponse = await fetch(track.img);
          if (imgResponse.ok) {
            const imgBlob = await imgResponse.blob();
            imgFile = new File([imgBlob], "cover.jpg", { type: imgBlob.type || "image/jpeg" });
          }
        } catch {
          // cover art is optional - keep going without it
        }
      }

      await addTrack({
        name: track.name,
        artist: track.artist,
        audioFile: new File([audioBlob], `${track.name}.mp3`, {
          type: audioBlob.type || "audio/mpeg",
        }),
        imgFile,
      });
      setNotice(`„${track.name}" uložena do knihovny.`);
    } catch {
      setNotice("Stažení skladby se nepodařilo. Zkus to prosím znovu.");
    } finally {
      setSavingTrackId(null);
    }
  };

  const handlePickPlaylist = (playlistId: string) => {
    if (!pickerTrack) return;
    addTrackToPlaylist(playlistId, pickerTrack);
    setNotice(`„${pickerTrack.name}" přidána do playlistu.`);
    setPickerTrack(null);
  };

  const handleCreateAndPick = (name: string) => {
    if (!pickerTrack) return;
    const playlist = createPlaylist(name);
    addTrackToPlaylist(playlist.id, pickerTrack);
    setNotice(`„${pickerTrack.name}" přidána do playlistu „${playlist.name}".`);
    setPickerTrack(null);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((mode) => {
      if (mode === "off") return "all";
      if (mode === "all") return "one";
      return "off";
    });
  };

  const goViewDelta = (delta: number) => {
    setView((current) => {
      const index = VIEW_ORDER.indexOf(current) + delta;
      return VIEW_ORDER[Math.min(VIEW_ORDER.length - 1, Math.max(0, index))];
    });
  };
  const swipeHandlers = useSwipeNavigation(
    () => goViewDelta(-1),
    () => goViewDelta(1)
  );

  // On desktop both panes are visible: the content pane falls back to the
  // library when the "player" tab is active.
  const contentView: Exclude<View, "player"> = view === "player" ? "library" : view;

  return (
    <div className="container">
      <div className="player" {...swipeHandlers}>
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
                  onAddToPlaylist={setPickerTrack}
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
                onAddToPlaylist={setPickerTrack}
                onSaveToLibrary={saveToLibrary}
                savingTrackId={savingTrackId}
              />
            )}
            {contentView === "playlists" && (
              <PlaylistsView
                playlists={playlists}
                activePlaylistId={activePlaylistId}
                onOpenPlaylist={setActivePlaylistId}
                onCreatePlaylist={createPlaylist}
                onDeletePlaylist={deletePlaylist}
                onRemoveTrack={removeTrackFromPlaylist}
                customTracks={customTracks}
                activeTrackId={player.currentTrack?.id}
                onSelect={playFromList}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddToPlaylist={setPickerTrack}
              />
            )}
            {contentView === "favorites" && (
              <TrackList
                tracks={favoriteTracks}
                activeTrackId={player.currentTrack?.id}
                onSelect={(i) => playFromList(favoriteTracks, i)}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddToPlaylist={setPickerTrack}
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
        {notice && <p className="player-notice">{notice}</p>}

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

        {pickerTrack && (
          <PlaylistPicker
            track={pickerTrack}
            playlists={playlists}
            onPick={handlePickPlaylist}
            onCreateAndPick={handleCreateAndPick}
            onClose={() => setPickerTrack(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MusicApp;
