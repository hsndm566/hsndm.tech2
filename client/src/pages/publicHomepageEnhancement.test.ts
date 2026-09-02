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
    expect(arabicHome).toContain("لا يتم إرسال أي طلب أو دفع اليوم.");
    expect(arabicHome).toContain("الوصول إلى لوحة التحكم محمي بتسجيل الدخول عبر بريدك الإلكتروني.");
  });

  it("keeps conversion reassurance, plan continuity, and crawlable support links on the public homepage", () => {
    expect(home).toContain("No payment or application is sent today.");
    expect(home).toContain('href={`/enquire?plan=${plan.name.toLowerCase()}`}');
    expect(home).toContain('href="/how-it-works/"');
    expect(home).toContain('href="/pricing/"');
    expect(home).toContain('href="/services/"');
    expect(home).toContain('href="/ats/"');
    expect(home).toContain('trackEngagement("hero_start_campaign_click"');
    expect(home).toContain('trackEngagement("hero_see_plans_click"');
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
    expect(home).toContain('className="hero-stats-grid"');
    expect(home).toContain('className="hero-activity" aria-live="polite"');
    expect(arabicHome).toContain('className="hero-stats-grid"');
    expect(home).toContain("BklitShimmeringStatus");
    expect(arabicHome).toContain("BklitShimmeringStatus");
    expect(styles).toContain(".hero-ledger::after");
    expect(styles).toContain(".proof-grid > div::after");
    expect(styles).toContain(".process-item::before");
    expect(styles).toContain(".bklit-shimmer-status");
    expect(styles).toContain(".hero-stats-grid > div::before");
    expect(styles).toContain(".plan-card::before");
    expect(styles).toContain(".brand::after");
    expect(styles).toContain(".proof-step");
    expect(home).toContain('className="proof-step">01');
    expect(arabicHome).toContain('className="proof-step">01');
    expect(styles).toContain("prefers-reduced-motion");
    expect(styles).toContain("var(--signal)");
  });
});

