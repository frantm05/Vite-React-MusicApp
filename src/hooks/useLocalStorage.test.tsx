import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("falls back to the default when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("k", 42));
    expect(result.current[0]).toBe(42);
  });

  it("reads an existing value", () => {
    window.localStorage.setItem("k", JSON.stringify([1, 2]));
    const { result } = renderHook(() => useLocalStorage<number[]>("k", []));
    expect(result.current[0]).toEqual([1, 2]);
  });

  it("persists updates", () => {
    const { result } = renderHook(() => useLocalStorage("k", 0));
    act(() => result.current[1](7));
    expect(JSON.parse(window.localStorage.getItem("k") as string)).toBe(7);
  });

  it("survives malformed stored JSON", () => {
    window.localStorage.setItem("k", "{not json");
    const { result } = renderHook(() => useLocalStorage("k", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("picks up changes from other tabs via the storage event", () => {
    const { result } = renderHook(() => useLocalStorage("k", 1));
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "k",
          newValue: "99",
          storageArea: window.localStorage,
        })
      );
    });
    expect(result.current[0]).toBe(99);
  });
});
