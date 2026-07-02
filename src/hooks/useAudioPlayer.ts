import { useEffect, useMemo, useRef, useState } from "react";
import type { RepeatMode, Track } from "../types";
import { resolveQueueStep } from "../utils/queueNavigation";

const PLAYBACK_ERROR = "Tuto skladbu se nepodařilo přehrát.";
const SHUFFLE_HISTORY_LIMIT = 50;

interface UseAudioPlayerParams {
  queue: Track[];
  index: number;
  onIndexChange: (index: number) => void;
  repeatMode: RepeatMode;
  shuffle: boolean;
  initialVolume?: number;
}

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
}: UseAudioPlayerParams) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const repeatModeRef = useRef(repeatMode);
  const shuffleHistoryRef = useRef<number[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTrack: Track | null = queue[index] ?? null;
  const trackKey = currentTrack?.id ?? null;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  /**
   * play() rejects with AbortError when interrupted by a subsequent load()
   * (e.g. the user skips tracks quickly). That is not a playback failure,
   * so it must not surface as one - and a successful play clears any stale
   * error from an earlier genuinely failed track.
   */
  const playSafely = (audio: HTMLAudioElement) => {
    audio
      .play()
      .then(() => setError(null))
      .catch((e: DOMException) => {
        if (e.name !== "AbortError") setError(PLAYBACK_ERROR);
      });
  };

  /** Restarts the currently loaded track from 0:00 without going through onIndexChange. */
  const restartCurrentTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    playSafely(audio);
  };

  const goRelative = (direction: 1 | -1, { auto = false } = {}) => {
    if (queue.length === 0) return;

    if (shuffle) {
      if (queue.length === 1) {
        restartCurrentTrack();
        return;
      }
      if (direction < 0 && shuffleHistoryRef.current.length > 0) {
        onIndexChange(shuffleHistoryRef.current.pop() as number);
        return;
      }
      shuffleHistoryRef.current.push(index);
      if (shuffleHistoryRef.current.length > SHUFFLE_HISTORY_LIMIT) {
        shuffleHistoryRef.current.shift();
      }
      const choices = queue.map((_, i) => i).filter((i) => i !== index);
      const randomIndex = choices[Math.floor(Math.random() * choices.length)];
      onIndexChange(randomIndex);
      return;
    }

    const step = resolveQueueStep({
      length: queue.length,
      index,
      direction,
      repeatMode: repeatModeRef.current,
      auto,
    });
    if (step.type === "restart") {
      // Wrapping back to the same track (single-item queue) doesn't change
      // trackKey, so the load effect won't fire - restart explicitly.
      restartCurrentTrack();
    } else if (step.type === "index") {
      onIndexChange(step.index);
    }
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
      setError(PLAYBACK_ERROR);
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
    if (!audio) return;

    setError(null);
    setCurrentTime(0);
    setDuration(0);

    if (!currentTrack) {
      // Queue emptied (e.g. the playing custom track was deleted) - unload.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    audio.src = currentTrack.src;
    audio.load();

    if (isPlayingRef.current) {
      playSafely(audio);
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
    if (audioRef.current) playSafely(audioRef.current);
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const togglePlay = () => (isPlaying ? pause() : play());

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const seekByPercent = (percent: number) => {
    if (!duration) return;
    seek((percent / 100) * duration);
  };

  const changeVolume = (value: number) => {
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
  const selectTrack = (newIndex: number) => {
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
