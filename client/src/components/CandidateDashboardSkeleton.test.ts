import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./CandidateDashboardSkeleton.tsx", import.meta.url), "utf8");

describe("CandidateDashboardSkeleton", () => {
  it("announces a non-data-bearing secure loading state and hides placeholder shapes from assistive technology", () => {
    expect(source).toContain('aria-live="polite" role="status"');
    expect(source).toContain("No application records are shown until the secure session and data checks finish.");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("border-s-[3px] border-[#e5482a]");
  });
});
