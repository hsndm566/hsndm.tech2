import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./InformationPage.tsx", import.meta.url), "utf8");
const layoutSource = readFileSync(new URL("../components/InformationPageLayout.tsx", import.meta.url), "utf8");

describe("InformationPage additive trust content", () => {
  it("renders finalized bilingual privacy wording with factual data-rights and approval boundaries", () => {
    expect(source).toContain("AutoApply SA, a Jeddah-based service");
    expect(source).toContain("لا تُشارك معلومات المرشح مع صاحب عمل أو قناة تقديم إلا بعد اعتماد المرشح لاتجاه الحملة");
    expect(source).toContain("apply@hsndm.tech");
    expect(source).toContain("Your rights and contact");
    expect(source).toContain("حقوقك والتواصل");
    expect(source).toContain("Fees, cancellation, and refunds");
    expect(source).toContain("الرسوم والإلغاء والاسترداد");
  });

  it("labels the KAIA figures as owner-supplied rather than a guaranteed outcome", () => {
    expect(source).toContain("Owner-reported outcome");
    expect(source).toContain("النتيجة التي أفاد بها مالك الموقع");
    expect(source).toContain("not a promise of a repeatable result");
  });

  it("adds bilingual section landmarks and retains an approval-forward campaign CTA", () => {
    expect(layoutSource).toContain("READING GUIDE");
    expect(layoutSource).toContain("دليل القراءة");
    expect(layoutSource).toContain("aria-label={readingGuideLabel}");
    expect(layoutSource).toContain("information-${language}-${index + 1}");
    expect(layoutSource).toContain("Your next step remains yours");
    expect(layoutSource).toContain("الخطوة التالية تبقى بيدك");
  });
});
