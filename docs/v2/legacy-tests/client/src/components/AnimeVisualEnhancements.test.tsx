import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AnimeVisualEnhancements.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("./DashboardAnimeVisualEnhancements.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

describe("Anime.js visual enhancements", () => {
  it("loads Anime.js only after a public landing route has committed", () => {
    expect(source).toContain('void import("animejs")');
    expect(source).toContain('const landingRoutes = new Set(["/", "/ar"])');
    expect(source).toContain('window.matchMedia("(max-width: 680px), (prefers-reduced-motion: reduce)").matches');
    expect(appSource).toContain("<AnimeVisualEnhancements routeKey={location} />");
  });

  it("keeps public and dashboard motion reduced-motion-safe and reversible", () => {
    expect(source).toContain("createScope");
    expect(source).toContain('mediaQueries: { reducedMotion: "(prefers-reduced-motion)" }');
    expect(source).toContain("data-anime-hero-word");
    expect(source).toContain(".hero-ledger .ledger-route > div");
    expect(source).toContain("createTimeline");
    expect(source).toContain("onScroll");
    expect(source).toContain("--workflow-path-progress");
    expect(source).toContain("animation.revert()");
    expect(dashboardSource).toContain("createScope");
    expect(dashboardSource).toContain("ctx?.matches.reducedMotion");
    expect(dashboardSource).toContain("data-anime-dashboard-metric");
    expect(dashboardSource).toContain("data-anime-dashboard-analytics-card");
    expect(dashboardSource).toContain("data-anime-dashboard-onboarding-step");
    expect(dashboardSource).toContain("delay: stagger(60");
  });
});
