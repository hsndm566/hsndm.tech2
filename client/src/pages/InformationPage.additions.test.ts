import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./InformationPage.tsx", import.meta.url), "utf8");

describe("InformationPage additive trust content", () => {
  it("keeps bilingual privacy and terms working-draft notice plus data-rights boundaries", () => {
    expect(source).toContain("Working draft — review with a qualified Saudi privacy professional");
    expect(source).toContain("مسودة عمل — يُرجى مراجعتها مع مختص سعودي مؤهل في الخصوصية");
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
});
