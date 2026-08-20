import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("small visual refinements", () => {
  it("keeps keyboard focus visible across existing controls", () => {
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("outline: 2px solid var(--signal)");
  });

  it("adds hover-only polish and disables transition motion when reduced motion is requested", () => {
    expect(styles).toContain("@media (hover: hover)");
    expect(styles).toContain(".process-item:hover");
    expect(styles).toContain(".hero-ledger:hover");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
