import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Owns the single <audio> element and all playback mechanics: play/pause,
 * seeking, volume, shuffle and repeat. The queue and current index are
 * controlled from the outside (MusicApp) so the same hook can drive the
 * local library, search results or the favorites list interchangeably.
 */
export function useAudioPlayer({
  queue,
  index,
  onIndexChange,
  repeatMode,
  shuffle,
  initialVolume = 1,
}) {
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const repeatModeRef = useRef(repeatMode);
  const shuffleHistoryRef = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);

  const currentTrack = queue[index] ?? null;
  const trackKey = currentTrack?.id ?? null;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  const goRelative = (direction, { auto = false } = {}) => {
    if (queue.length === 0) return;

    if (queue.length === 1) {
      onIndexChange(0);
      return;
    }

    if (shuffle) {
      if (direction < 0 && shuffleHistoryRef.current.length > 0) {
        onIndexChange(shuffleHistoryRef.current.pop());
        return;
      }
      shuffleHistoryRef.current.push(index);
      const choices = queue.map((_, i) => i).filter((i) => i !== index);
      const randomIndex = choices[Math.floor(Math.random() * choices.length)];
      onIndexChange(randomIndex);
      return;
    }

    let newIndex = index + direction;
    if (newIndex >= queue.length) {
      if (repeatModeRef.current !== "all" && auto) {
        return;
      }
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = queue.length - 1;
    }
    onIndexChange(newIndex);
  };

  const goNextRef = useRef(goRelative);
  goNextRef.current = goRelative;

  // Wire up the audio element's native events once.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (repeatModeRef.current === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      goNextRef.current(1, { auto: true });
    };
    const handleError = () => {
      if (!audio.src) return;
      setError("Tuto skladbu se nepodařilo přehrát.");
      goNextRef.current(1, { auto: true });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Load the new source whenever the current track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setError(null);
    setCurrentTime(0);
    setDuration(0);
    audio.src = currentTrack.src;
    audio.load();

    if (isPlayingRef.current) {
      audio.play().catch(() => setError("Tuto skladbu se nepodařilo přehrát."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackKey]);

  // Keep the audio element's volume in sync with state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const play = () => {
    audioRef.current?.play().catch(() => setError("Tuto skladbu se nepodařilo přehrát."));
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const togglePlay = () => (isPlaying ? pause() : play());

  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const seekByPercent = (percent) => {
    if (!duration) return;
    seek((percent / 100) * duration);
  };

  const changeVolume = (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolume(clamped);
    if (clamped > 0 && muted) setMuted(false);
  };

  const toggleMute = () => setMuted((m) => !m);

  const next = () => goRelative(1);
  const prev = () => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    goRelative(-1);
  };

  /** Explicitly chosen from a list - always starts playback, unlike next/prev. */
  const selectTrack = (newIndex) => {
    isPlayingRef.current = true;
    onIndexChange(newIndex);
  };

  const progressPercent = useMemo(
    () => (duration ? (currentTime / duration) * 100 : 0),
    [currentTime, duration]
  );

  return {
    audioRef,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    volume,
    muted,
    error,
    play,
    pause,
    togglePlay,
    next,
    prev,
    selectTrack,
    seek,
    seekByPercent,
    changeVolume,
    toggleMute,
  };
}
