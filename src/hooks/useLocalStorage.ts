import { useEffect, useRef, useState } from "react";

/**
 * useState backed by localStorage. Reads lazily on mount, writes on every
 * change, and picks up changes made in other tabs via the storage event.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const defaultValueRef = useRef(defaultValue);

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
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

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;
      try {
        setValue(e.newValue !== null ? (JSON.parse(e.newValue) as T) : defaultValueRef.current);
      } catch {
        // ignore malformed external writes
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [value, setValue] as const;
}
