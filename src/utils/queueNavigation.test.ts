import { describe, expect, it } from "vitest";
import { resolveQueueStep } from "./queueNavigation";

describe("resolveQueueStep", () => {
  it("does nothing on an empty queue", () => {
    expect(
      resolveQueueStep({ length: 0, index: 0, direction: 1, repeatMode: "off", auto: false })
    ).toEqual({ type: "none" });
  });

  it("advances to the next track", () => {
    expect(
      resolveQueueStep({ length: 3, index: 0, direction: 1, repeatMode: "off", auto: false })
    ).toEqual({ type: "index", index: 1 });
  });

  it("goes back to the previous track", () => {
    expect(
      resolveQueueStep({ length: 3, index: 2, direction: -1, repeatMode: "off", auto: false })
    ).toEqual({ type: "index", index: 1 });
  });

  it("wraps forward past the end on a manual press", () => {
    expect(
      resolveQueueStep({ length: 3, index: 2, direction: 1, repeatMode: "off", auto: false })
    ).toEqual({ type: "index", index: 0 });
  });

  it("wraps backward past the start on a manual press", () => {
    expect(
      resolveQueueStep({ length: 3, index: 0, direction: -1, repeatMode: "off", auto: false })
    ).toEqual({ type: "index", index: 2 });
  });

  it("stops at the end of the queue on auto-advance with repeat off", () => {
    expect(
      resolveQueueStep({ length: 3, index: 2, direction: 1, repeatMode: "off", auto: true })
    ).toEqual({ type: "none" });
  });

  it("wraps on auto-advance with repeat-all", () => {
    expect(
      resolveQueueStep({ length: 3, index: 2, direction: 1, repeatMode: "all", auto: true })
    ).toEqual({ type: "index", index: 0 });
  });

  it("restarts a single-item queue on a manual press", () => {
    expect(
      resolveQueueStep({ length: 1, index: 0, direction: 1, repeatMode: "off", auto: false })
    ).toEqual({ type: "restart" });
  });

  it("restarts a single-item queue on auto-advance with repeat-all", () => {
    expect(
      resolveQueueStep({ length: 1, index: 0, direction: 1, repeatMode: "all", auto: true })
    ).toEqual({ type: "restart" });
  });

  it("stops a single-item queue on auto-advance with repeat off", () => {
    expect(
      resolveQueueStep({ length: 1, index: 0, direction: 1, repeatMode: "off", auto: true })
    ).toEqual({ type: "none" });
  });
});
