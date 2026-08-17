import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const controllerSource = readFileSync(new URL("./NativeVisualEnhancements.tsx", import.meta.url), "utf8");
const htmlSource = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("native visual refinement", () => {
  it("uses one shared native controller and no animation-library runtime", () => {
    expect(htmlSource).not.toContain("animejs");
    expect(appSource).toContain("<NativeVisualEnhancements routeKey={location} />");
  });

  it("keeps scroll reveals native, reduced-motion-safe, and route-aware", () => {
    expect(controllerSource).toContain("prefers-reduced-motion: reduce");
    expect(controllerSource).toContain("IntersectionObserver");
    expect(controllerSource).toContain('classList.add("is-visible")');
    expect(controllerSource).toContain("[routeKey]");
  });

  it("defines restrained CSS-only polish for reveals, premium pricing, live status, and touch feedback", () => {
    expect(styleSource).toContain("translateY(10px)");
    expect(styleSource).toContain("300ms");
    expect(styleSource).toContain("live-status-breathe");
    expect(styleSource).toContain(".plan-featured");
    expect(styleSource).toContain(".drop-zone:active");
  });
});
