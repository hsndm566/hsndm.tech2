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

  it("includes canonical Saudi city and industry selections in both campaign handoffs", () => {
    expect(arabicSource).toContain("saudiCities");
    expect(arabicSource).toContain("saudiIndustries");
    expect(arabicSource).toContain("المدينة المستهدفة");
    expect(arabicSource).toContain("المجال المستهدف");
    expect(englishSource).toContain("Target city:");
    expect(englishSource).toContain("Target industry:");
  });

  it("reports only a blocked WhatsApp handoff route without sending campaign form fields", () => {
    expect(englishSource).toContain('reportBlockedHandoff.mutate({ route: "/enquire" })');
    expect(arabicSource).toContain('reportBlockedHandoff.mutate({ route: "/ar/enquire" })');
  });

  it("offers an explicit manual recovery path when a browser blocks the WhatsApp popup", () => {
    expect(englishSource).toContain("handoffBlocked");
    expect(englishSource).toContain("Open WhatsApp manually");
    expect(arabicSource).toContain("handoffBlocked");
    expect(arabicSource).toContain("فتح WhatsApp يدوياً");
    expect(arabicSource).toContain('className="skip-link" href="#campaign-brief"');
  });
});
