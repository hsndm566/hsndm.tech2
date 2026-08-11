import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const arabicSource = readFileSync(new URL("./ArabicEnquire.tsx", import.meta.url), "utf8");
const englishSource = readFileSync(new URL("./Enquire.tsx", import.meta.url), "utf8");

describe("bilingual enquiry handoff", () => {
  it("keeps the dedicated Arabic enquiry route fully localized", () => {
    expect(arabicSource).toContain("مرحباً AutoApply SA، أرغب في بدء حملة تقديم.");
    expect(arabicSource).toContain("المتابعة إلى WhatsApp");
    expect(arabicSource).toContain("/ar/thank-you");
  });

  it("shows staged WhatsApp feedback in both language journeys", () => {
    expect(arabicSource).toContain("handoffSteps");
    expect(englishSource).toContain("handoffSteps");
    expect(englishSource).toContain("Opening WhatsApp");
  });
});
