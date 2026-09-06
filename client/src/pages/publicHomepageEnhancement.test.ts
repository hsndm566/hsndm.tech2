import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("public homepage enhancement contracts", () => {
  it("keeps the approval-led promise and the fixed public prices visible in English", () => {
    expect(home).toContain("We prepare");
    expect(home).toContain("Nothing is submitted without your go-ahead");
    expect(home).toContain('price: "99"');
    expect(home).toContain('price: "149"');
    expect(home).toContain('price: "249"');
  });

  it("keeps Arabic approval-led copy and matching FAQ coverage", () => {
    expect(arabicHome).toContain("لا يُقدَّم شيء دون موافقتك");
    expect(arabicHome).toContain("هل تضمنون حصولي على وظيفة؟");
    expect(arabicHome).toContain("الخصوصية والأمان");
    expect(arabicHome).toContain("لا يُرسل أي شيء حتى توافق");
    expect(arabicHome).toContain("الوصول إلى لوحة التحكم محمي بتسجيل الدخول عبر بريدك الإلكتروني.");
  });

  it("keeps conversion reassurance, plan continuity, and crawlable support links on the public homepage", () => {
    expect(home).toContain("Nothing goes out until you say yes.");
    expect(home).toContain('href={`/enquire?plan=${plan.name.toLowerCase()}`}');
    expect(home).toContain('href="/how-it-works/"');
    expect(home).toContain('href="/pricing/"');
    expect(home).toContain('href="/services/"');
    expect(home).toContain('href="/ats/"');
    expect(home).toContain('trackEngagement("plan_selected"');
  });

  it("routes bilingual account actions to the Cloudflare-hosted portal", () => {
    expect(home).toContain('href="https://app.hsndm.tech/sign-in"');
    expect(home).toContain('href="https://app.hsndm.tech/sign-up"');
    expect(home).toContain("Create account");
    expect(arabicHome).toContain('href="https://app.hsndm.tech/sign-in"');
    expect(arabicHome).toContain('href="https://app.hsndm.tech/sign-up"');
    expect(arabicHome).toContain("إنشاء حساب");
  });

  it("uses route-derived document direction, visible-by-default public sections, and static FAQ metadata", () => {
    expect(app).toContain('root.dir = isArabicRoute ? "rtl" : "ltr"');
    expect(home).toContain("<LazyMount>");
    expect(styles).not.toContain("content-visibility:");
    expect(styles).not.toContain("contain-intrinsic-size:");
    expect(html).toContain("Do you guarantee I'll get hired?");
    expect(html).toContain('hreflang="ar"');
  });

  it("keeps the source-informed enhancement layer theme-preserving and bilingual", () => {
    const hero = readFileSync(new URL("../components/SaudiHero.tsx", import.meta.url), "utf8");
    const heroStyles = readFileSync(new URL("../saudi-redesign.css", import.meta.url), "utf8");

    // Shared redesigned dark hero, rendered in both languages.
    expect(home).toContain("<SaudiHero />");
    expect(arabicHome).toContain("<SaudiHero arabic />");
    expect(hero).toContain("A smarter way to run your job search in");
    expect(hero).toContain("طريقة أذكى لإدارة بحثك عن عمل في");
    expect(heroStyles).toContain(".saudi-hero");

    // Retained shimmering status + numbered proof steps, in both languages.
    expect(home).toContain("BklitShimmeringStatus");
    expect(arabicHome).toContain("BklitShimmeringStatus");
    expect(home).toContain('className="proof-step">01');
    expect(arabicHome).toContain('className="proof-step">01');
    expect(styles).toContain(".proof-step");
    expect(styles).toContain("prefers-reduced-motion");
    expect(styles).toContain("var(--signal)");
  });
});

