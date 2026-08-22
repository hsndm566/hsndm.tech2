import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const heroMedia = readFileSync(new URL("../components/HeroMedia.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public homepage technical polish", () => {
  it("reserves intrinsic hero media space before the poster or video decodes", () => {
    expect(heroMedia).toContain("width={1920}");
    expect(heroMedia).toContain("height={1080}");
    expect(styles).toContain("aspect-ratio: 16 / 9");
    expect(heroMedia).toContain('preload="none"');
    expect(heroMedia).not.toContain("autoPlay");
    expect(heroMedia).toContain("videoRequested && HERO_VIDEO_URL");
  });

  it("contains hero, final CTA, footer, and Arabic FAQ failures at public section scope", () => {
    expect(home).toContain('name="hero"');
    expect(home).toContain('name="final-cta"');
    expect(home).toContain('name="marketing-footer"');
    expect(arabicHome).toContain('name="arabic-hero"');
    expect(arabicHome).toContain('name="arabic-faq"');
    expect(arabicHome).toContain('name="arabic-final-cta"');
    expect(arabicHome).toContain('name="arabic-marketing-footer"');
  });

  it("uses logical layout properties for shared public navigation, FAQ, and RTL-sensitive rules", () => {
    expect(styles).toContain("inset-inline-start");
    expect(styles).toContain("margin-inline-start");
    expect(styles).toContain("padding-inline");
    expect(styles).toContain("border-inline-start");
    expect(styles).toContain("text-align: start");
  });
});
