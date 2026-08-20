import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AnimeVisualEnhancements.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

describe("Anime.js visual enhancements", () => {
  it("loads Anime.js only after a public landing route has committed", () => {
    expect(source).toContain('void import("animejs")');
    expect(source).toContain('const landingRoutes = new Set(["/", "/ar"])');
    expect(appSource).toContain("<AnimeVisualEnhancements routeKey={location} />");
  });

  it("keeps hero motion reduced-motion-safe and reversible", () => {
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("data-anime-hero-word");
    expect(source).toContain("animation.revert()");
  });
});
