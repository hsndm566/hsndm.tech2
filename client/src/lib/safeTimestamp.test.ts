import { describe, expect, it } from "vitest";
import { formatSafeDate, formatSafeDateTime, safeTimestampMs, toActivityTimestamp } from "./safeTimestamp";

describe("safe timestamp helpers", () => {
  it("returns a sortable zero value for missing or malformed dates", () => {
    expect(safeTimestampMs(undefined)).toBe(0);
    expect(safeTimestampMs(null)).toBe(0);
    expect(safeTimestampMs("not-a-date")).toBe(0);
    expect(formatSafeDate("not-a-date")).toBe("Date unavailable");
    expect(formatSafeDateTime(undefined)).toBe("Date unavailable");
  });

  it("uses the first valid timestamp for legacy activity records", () => {
    const fallback = new Date("2026-08-18T08:00:00.000Z");
    expect(toActivityTimestamp("invalid", fallback)).toBe(fallback.toISOString());
    expect(safeTimestampMs(fallback)).toBe(fallback.getTime());
  });
});
