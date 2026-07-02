import { useEffect, useState } from "react";

/**
 * useState backed by localStorage. Reads lazily on mount and writes
 * whenever the value changes, so it stays a drop-in replacement for
 * useState in the rest of the app.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may be unavailable (private mode, quota) - fail silently
    }
  }, [key, value]);

  return [value, setValue];
}
