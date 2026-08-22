import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const controllerSource = readFileSync(new URL("./NativeVisualEnhancements.tsx", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("native visual refinement", () => {
  it("keeps shared scroll reveals native while allowing a separate scoped motion layer", () => {
    expect(appSource).toContain("<NativeVisualEnhancements routeKey={location} />");
    expect(appSource).toContain("<AnimeVisualEnhancements routeKey={location} />");
  });

  it("keeps scroll reveals native, reduced-motion-safe, and route-aware", () => {
    expect(controllerSource).toContain("prefers-reduced-motion: reduce");
    expect(controllerSource).toContain("IntersectionObserver");
    expect(controllerSource).toContain('classList.add("is-visible")');
    expect(controllerSource).toContain("mobileSectionSelector");
    expect(controllerSource).toContain('classList.add("mobile-section-reveal-target")');
    expect(controllerSource).toContain("[routeKey]");
  });

  it("defines restrained CSS-only polish for reveals, premium pricing, live status, and touch feedback", () => {
    expect(styleSource).toContain("translateY(10px)");
    expect(styleSource).toContain("300ms");
    expect(styleSource).toContain("live-status-breathe");
    expect(styleSource).toContain(".plan-featured");
    expect(styleSource).toContain(".drop-zone:active");
  });

  it("limits whole-section entry motion to phones without reintroducing deferred section rendering", () => {
    expect(styleSource).toContain("@media (max-width: 680px) and (prefers-reduced-motion: no-preference)");
    expect(styleSource).toContain(".mobile-section-reveal-target");
    expect(styleSource).toContain("translateY(8px)");
    expect(styleSource).toContain(".below-fold-section { content-visibility: visible; contain-intrinsic-size: auto; }");
  });
});
