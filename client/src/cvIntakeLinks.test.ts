import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sources = [
  new URL("./components/FirstLoginDashboard.tsx", import.meta.url),
  new URL("./pages/Ats.tsx", import.meta.url),
].map((url) => readFileSync(url, "utf8"));

describe("public CV intake links", () => {
  it("keeps active CV-intake links pointed at the existing upload section instead of a stale hash", () => {
    for (const source of sources) {
      expect(source).not.toContain("/#cv-intake");
      expect(source).toContain("/#upload");
    }
  });
});
