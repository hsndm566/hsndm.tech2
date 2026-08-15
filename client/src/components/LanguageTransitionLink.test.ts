import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./LanguageTransitionLink.tsx", import.meta.url), "utf8");

describe("LanguageTransitionLink", () => {
  it("uses a short navigation transition while respecting reduced-motion settings", () => {
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain('document.documentElement.dataset.localeTransition = "out"');
    expect(source).toContain("window.location.assign(href)");
    expect(source).toContain("event.metaKey || event.ctrlKey");
  });
});
