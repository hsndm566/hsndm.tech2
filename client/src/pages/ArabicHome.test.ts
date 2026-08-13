import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Arabic readiness experience", () => {
  it("provides an Arabic WhatsApp handoff and localized completion feedback", () => {
    expect(source).toContain("مرحباً AutoApply SA، أكملت فحص جاهزية الحملة السعودية.");
    expect(source).toContain("ملخص الحملة جاهز.");
    expect(source).toContain("لغة التقديم: العربية");
  });

  it("includes the Arabic-ready CV preferences and a route-aware language toggle", () => {
    expect(source).toContain("تفضيلات المطابقة");
    expect(source).toContain("language-toggle is-arabic");
    expect(source).toContain("roleTranslations");
    expect(source).toContain("ArabicMarketSelector");
    expect(source).toContain("toMatchIndustry");
  });

  it("uses scoped Arabic typography with normal script spacing and readable leading", () => {
    expect(styles).toContain('.site-shell[lang="ar"]');
    expect(styles).toContain('"Noto Sans Arabic"');
    expect(styles).toContain("word-spacing: .08em");
    expect(styles).toContain("line-height: 1.95");
    expect(styles).toContain("#upload .preferences-grid > label:nth-child(1)");
  });

  it("reports only a route when local CV extraction throws", () => {
    const englishSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
    const atsSource = readFileSync(new URL("./Ats.tsx", import.meta.url), "utf8");
    expect(englishSource).toContain('reportCvExtractionFailure.mutate({ route: "/" })');
    expect(englishSource).toContain('reportBlockedHandoff.mutate({ route: "/" })');
    expect(source).toContain('reportCvExtractionFailure.mutate({ route: "/ar" })');
    expect(source).toContain('reportBlockedHandoff.mutate({ route: "/ar" })');
    expect(atsSource).toContain("extractAtsCvText");
  });
});
