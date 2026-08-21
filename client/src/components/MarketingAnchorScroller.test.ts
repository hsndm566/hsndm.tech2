import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const componentSource = readFileSync(new URL("./MarketingAnchorScroller.tsx", import.meta.url), "utf8");
const englishHomeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const arabicHomeSource = readFileSync(new URL("../pages/ArabicHome.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public marketing navigation refinements", () => {
  it("uses scoped smooth in-page scrolling while honoring reduced motion and standard link modifiers", () => {
    expect(componentSource).toContain("a[href^=\"#\"]");
    expect(componentSource).toContain('behavior: prefersReducedMotion() ? "auto" : "smooth"');
    expect(componentSource).toContain("event.metaKey || event.ctrlKey || event.shiftKey || event.altKey");
    expect(componentSource).toContain("window.history.pushState(null, \"\", href)");
  });

  it("mounts the existing-anchor behavior on both public marketing homepages", () => {
    expect(englishHomeSource).toContain('import { MarketingAnchorScroller } from "@/components/MarketingAnchorScroller"');
    expect(arabicHomeSource).toContain('import { MarketingAnchorScroller } from "@/components/MarketingAnchorScroller"');
    expect(englishHomeSource).toContain("<MarketingAnchorScroller />");
    expect(arabicHomeSource).toContain("<MarketingAnchorScroller />");
  });

  it("keeps feature-card feedback subtle, keyboard-reachable, and reduced-motion compatible", () => {
    expect(styles).toContain(".capability-card:hover");
    expect(styles).toContain(".capability-card:focus-within");
    expect(styles).toContain(".capability-card:hover .card-rule");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
