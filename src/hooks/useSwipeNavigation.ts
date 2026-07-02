import { useRef } from "react";

const MIN_DISTANCE_PX = 60;
/** Horizontal movement must dominate vertical this much to count as a swipe. */
const HORIZONTAL_DOMINANCE = 2;
/** Elements with their own horizontal gestures - swipes starting there are ignored. */
const IGNORED_SELECTOR = ".song-duration, input, .volume-flyout, .playlist-picker";

/**
 * Left/right touch swipes for switching tabs. Returns handlers to spread
 * onto the container; clicks/scrolls are unaffected.
 */
export function useSwipeNavigation(onSwipeRight: () => void, onSwipeLeft: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as Element).closest(IGNORED_SELECTOR)) {
      startRef.current = null;
      return;
    }
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < MIN_DISTANCE_PX || Math.abs(dx) < HORIZONTAL_DOMINANCE * Math.abs(dy)) {
      return;
    }

    if (dx > 0) onSwipeRight();
    else onSwipeLeft();
  };

  return { onTouchStart, onTouchEnd };
}
