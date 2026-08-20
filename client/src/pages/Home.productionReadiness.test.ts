import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const englishHome = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const heroMedia = readFileSync(new URL("../components/HeroMedia.tsx", import.meta.url), "utf8");
const deferredExplainer = readFileSync(new URL("../components/DeferredExplainerVideo.tsx", import.meta.url), "utf8");
const homepageMediaImage = readFileSync(new URL("../components/HomepageMediaImage.tsx", import.meta.url), "utf8");

describe("public homepage production-readiness contract", () => {
  it("keeps one clear primary campaign CTA and an explanatory secondary CTA in each language", () => {
    expect(englishHome).toContain("Start your campaign");
    expect(englishHome).toContain("See how it works");
    expect(arabicHome).toContain("ابدأ حملتك");
    expect(arabicHome).toContain("شاهد كيف يعمل");
  });

  it("shows only factual bilingual trust boundaries near the hero CTA", () => {
    expect(englishHome).toContain("You approve role targets");
    expect(englishHome).toContain("Set volume &amp; dates");
    expect(englishHome).toContain("Every application is logged");
    expect(arabicHome).toContain("توافق على الوظائف المستهدفة");
    expect(arabicHome).toContain("تحدد الحجم والتواريخ");
    expect(arabicHome).toContain("كل طلب مسجّل");
  });

  it("avoids eagerly downloading decorative media while preserving a visual hero fallback", () => {
    expect(heroMedia).toContain("poster={HERO_POSTER_URL}");
    expect(heroMedia).toContain('preload="metadata"');
    expect(englishHome).toContain("HomepageMediaImage");
    expect(homepageMediaImage).toContain('loading="lazy"');
    expect(englishHome).toContain("DeferredExplainerVideo");
    expect(arabicHome).toContain("DeferredExplainerVideo");
    expect(deferredExplainer).toContain('preload="metadata"');
    expect(deferredExplainer).toContain('rootMargin: "360px 0px"');
  });
});
