import { describe, expect, it } from "vitest";
import { normalizeLatestActivityTimestamp } from "./latestActivity";

describe("normalizeLatestActivityTimestamp", () => {
  it("returns a safe epoch for a valid persisted activity date", () => {
    expect(normalizeLatestActivityTimestamp({ createdAt: new Date("2026-08-17T18:00:00.000Z") })).toBe(1_786_989_600_000);
  });

  it("returns null for an empty or malformed public activity value", () => {
    expect(normalizeLatestActivityTimestamp(null)).toBeNull();
    expect(normalizeLatestActivityTimestamp({ createdAt: "not-a-date" })).toBeNull();
    expect(normalizeLatestActivityTimestamp({ createdAt: 0 })).toBeNull();
  });
});
