import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const preferencesSource = readFileSync(new URL("../components/arabic/ArabicPreferencesPanel.tsx", import.meta.url), "utf8");
const matchedResultsSource = readFileSync(new URL("../components/arabic/ArabicMatchedResults.tsx", import.meta.url), "utf8");

describe("Arabic readiness experience", () => {
  it("provides an Arabic WhatsApp handoff and localized completion feedback", () => {
    expect(source).toContain("مرحباً AutoApply SA، أكملت فحص جاهزية الحملة السعودية.");
    expect(matchedResultsSource).toContain("ملخص الحملة جاهز.");
    expect(source).toContain("لغة التقديم: العربية");
  });

  it("includes the Arabic-ready CV preferences and a route-aware language toggle", () => {
    expect(preferencesSource).toContain("تفضيلات المطابقة");
    expect(source).toContain("language-toggle is-arabic");
    expect(source).toContain("roleTranslations");
    expect(preferencesSource).toContain("ArabicMarketSelector");
    expect(source).toContain("toMatchIndustry");
  });

  it("keeps the user-approved reviewed Arabic copy in the primary public sections", () => {
    expect(source).toContain("دعم حملات التقديم للوظائف");
    expect(source).toContain("الأسئلة الشائعة");
    expect(source).toContain("ضع بحثك <i>في نظام واضح.</i>");
    expect(source).toContain("الإعلانات المتاحة في السعودية");
    expect(source).toContain("تمت مراجعتها");
    expect(source).toContain("تُرتَّب الوظائف ذات الصلة حسب الأولوية");
    expect(source).toContain("reviewedArabicCopy");
    expect(source).toContain("ولا يبقى خارج هذه الصفحة سوى ما تختار مشاركته");
    expect(source).toContain("وضوح الحملة");
    expect(source).toContain("من دون وعود مصطنعة");
    expect(source).not.toContain("ثلاث مراجعات مُشارَكة مباشرة من عملاء AutoApply SA.");
    expect(styles).not.toContain(".privacy-note::after");
  });

  it("uses scoped Arabic typography with normal script spacing and readable leading", () => {
    expect(styles).toContain('.site-shell[lang="ar"]');
    expect(styles).toContain('"Noto Sans Arabic"');
    expect(styles).toContain("word-spacing: .08em");
    expect(styles).toContain("line-height: 1.95");
    expect(styles).toContain("arabic-canonical-preference");
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

  it("mounts the canonical Arabic market selector into the upload preference grid", () => {
    expect(source).toContain("ArabicIntakeSection");
    expect(preferencesSource).toContain("ArabicMarketSelector");
    expect(preferencesSource).toContain('className="preferences-grid"');
    const selectorSource = readFileSync(new URL("../components/ArabicMarketSelector.tsx", import.meta.url), "utf8");
    expect(selectorSource).toContain("SearchableSaudiSelect");
    expect(selectorSource).not.toContain("createPortal");
  });
});
