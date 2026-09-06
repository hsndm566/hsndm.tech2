import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const englishHome = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const heroMedia = readFileSync(new URL("../components/HeroMedia.tsx", import.meta.url), "utf8");
const deferredExplainer = readFileSync(new URL("../components/DeferredExplainerVideo.tsx", import.meta.url), "utf8");
const homepageMediaImage = readFileSync(new URL("../components/HomepageMediaImage.tsx", import.meta.url), "utf8");

describe("public homepage production-readiness contract", () => {
  it("keeps one clear primary campaign CTA and an explanatory secondary CTA in each language", () => {
    const hero = readFileSync(new URL("../components/SaudiHero.tsx", import.meta.url), "utf8");
    expect(hero).toContain("Start an enquiry");
    expect(hero).toContain("See how it works");
    expect(hero).toContain("ابدأ الطلب");
    expect(hero).toContain("شاهد كيف تعمل");
  });

  it("shows only factual bilingual trust boundaries near the hero CTA", () => {
    const hero = readFileSync(new URL("../components/SaudiHero.tsx", import.meta.url), "utf8");
    expect(hero).toContain("Built for focused candidates across Saudi Arabia");
    expect(hero).toContain("مصمّم للمرشحين المركّزين في أنحاء السعودية");
    expect(englishHome).toContain("Nothing is submitted without your go-ahead");
    expect(arabicHome).toContain("لا يُقدَّم شيء دون موافقتك");
  });

  it("avoids eagerly downloading decorative media while preserving a visual hero fallback", () => {
    expect(heroMedia).toContain("poster={HERO_POSTER_URL}");
    expect(heroMedia).toContain('preload="none"');
    expect(heroMedia).toContain("videoRequested && HERO_VIDEO_URL");
    expect(heroMedia).not.toContain("autoPlay");
    expect(englishHome).toContain("HomepageMediaImage");
    expect(homepageMediaImage).toContain('loading="lazy"');
    expect(englishHome).toContain("DeferredExplainerVideo");
    expect(arabicHome).toContain("DeferredExplainerVideo");
    expect(deferredExplainer).toContain('preload="metadata"');
    expect(deferredExplainer).toContain('rootMargin: "360px 0px"');
  });
});
