import type { RepeatMode } from "../types";

export type QueueStep =
  | { type: "none" }
  | { type: "restart" }
  | { type: "index"; index: number };

/**
 * Pure sequential-queue navigation (shuffle is handled separately by the
 * player hook). `auto` distinguishes automatic advance at the end of a
 * track from an explicit next/prev press: reaching the end of the queue
 * automatically only wraps around when repeat-all is on, while a manual
 * press always wraps. Landing back on the same index (single-item queue)
 * is reported as "restart" because a state update would be a no-op.
 */
export function resolveQueueStep(params: {
  length: number;
  index: number;
  direction: 1 | -1;
  repeatMode: RepeatMode;
  auto: boolean;
}): QueueStep {
  const { length, index, direction, repeatMode, auto } = params;
  if (length === 0) return { type: "none" };

  let newIndex = index + direction;
  if (newIndex >= length) {
    if (auto && repeatMode !== "all") return { type: "none" };
    newIndex = 0;
  } else if (newIndex < 0) {
    newIndex = length - 1;
  }

  if (newIndex === index) return { type: "restart" };
  return { type: "index", index: newIndex };
}
