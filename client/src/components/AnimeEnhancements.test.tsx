import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const controllerSource = readFileSync(new URL("./AnimeEnhancements.tsx", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const arabicHomeSource = readFileSync(new URL("../pages/ArabicHome.tsx", import.meta.url), "utf8");

describe("Anime.js motion enhancement", () => {
  it("loads the official CDN runtime and mounts one shared controller", () => {
    expect(htmlSource).toContain("https://cdn.jsdelivr.net/npm/animejs@4.3.6/dist/bundles/anime.umd.min.js");
    expect(htmlSource).toContain("data-animejs-cdn");
    expect(appSource).toContain("AnimeEnhancements");
  });

  it("keeps the motion opt-in, reduced-motion-safe, and intersection-observer based", () => {
    expect(controllerSource).toContain("prefers-reduced-motion: reduce");
    expect(controllerSource).toContain('animeMotion = "reduced"');
    expect(controllerSource).toContain("IntersectionObserver");
    expect(controllerSource).toContain("data-anime-hero-word");
    expect(controllerSource).toContain("pointerenter");
    expect(controllerSource).toContain("pointerdown");
  });

  it("marks both localized hero headlines for word-level animation without changing their copy", () => {
    expect(homeSource).toContain('data-anime-hero-word');
    expect(arabicHomeSource).toContain('data-anime-hero-word');
  });
});
