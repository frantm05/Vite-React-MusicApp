import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats zero", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("pads seconds under ten", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("handles minutes over ten", () => {
    expect(formatTime(725)).toBe("12:05");
  });

  it("truncates fractional seconds", () => {
    expect(formatTime(59.9)).toBe("0:59");
  });

  it("guards against NaN, Infinity and negatives", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
    expect(formatTime(-5)).toBe("0:00");
  });
});
