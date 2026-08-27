import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const arabicSource = readFileSync(new URL("./ArabicEnquire.tsx", import.meta.url), "utf8");
const englishSource = readFileSync(new URL("./Enquire.tsx", import.meta.url), "utf8");

describe("bilingual enquiry handoff", () => {
  it("keeps the dedicated Arabic enquiry route fully localized", () => {
    expect(arabicSource).toContain("مرحباً AutoApply SA، أرغب في بدء حملة تقديم.");
    expect(arabicSource).toContain("راجع خيارات التواصل");
    expect(arabicSource).toContain("تفويض خطة الحملة");
  });

  it("shows an explicit pre-handoff preview and authorization in both journeys", () => {
    expect(arabicSource).toContain("لن تُرسل السيرة الذاتية إلا إذا أرفقتها بنفسك");
    expect(englishSource).toContain("Your CV will");
    expect(englishSource).toContain("Nothing is submitted until you approve the campaign plan.");
    expect(arabicSource).toContain("لن يُرسل أي طلب حتى توافق على خطة الحملة");
  });

  it("labels the consent-preserving review state as the second bilingual journey stage", () => {
    expect(englishSource).toContain('className="enquiry-review-stage" role="status"');
    expect(englishSource).toContain("02 / Private review");
    expect(englishSource).toContain("You remain in control of contact.");
    expect(arabicSource).toContain('className="enquiry-review-stage" role="status"');
    expect(arabicSource).toContain("02 / مراجعة خاصة");
    expect(arabicSource).toContain("تبقى خطوة التواصل تحت تحكمك.");
  });

  it("includes canonical Saudi city and industry selections in both campaign handoffs", () => {
    expect(arabicSource).toContain("saudiCities");
    expect(arabicSource).toContain("saudiIndustries");
    expect(arabicSource).toContain("المدينة المستهدفة");
    expect(arabicSource).toContain("المجال المستهدف");
    expect(englishSource).toContain("Target role");
    expect(englishSource).toContain("Industry");
  });

  it("reports only a blocked WhatsApp handoff route without sending campaign form fields", () => {
    expect(englishSource).toContain('reportBlockedHandoff.mutate({ route: "/enquire" })');
    expect(arabicSource).toContain('reportBlockedHandoff.mutate({ route: "/ar/enquire" })');
  });

  it("offers alternate contact and pause/delete paths instead of a forced WhatsApp-only handoff", () => {
    expect(englishSource).toContain("handoffBlocked");
    expect(englishSource).toContain("Secure web enquiry");
    expect(englishSource).toContain("pause or delete this contact request");
    expect(arabicSource).toContain("handoffBlocked");
    expect(arabicSource).toContain("استفسار ويب آمن");
    expect(arabicSource).toContain("إيقاف أو حذف طلب التواصل");
    expect(arabicSource).toContain('className="skip-link" href="#campaign-brief"');
  });

  it("keeps a selected plan visible and in the bilingual WhatsApp handoff context", () => {
    expect(englishSource).toContain("You selected");
    expect(englishSource).toContain("Selected plan:");
    expect(englishSource).toContain("Continue to WhatsApp with my brief");
    expect(englishSource).toContain("You control whether to send it.");
    expect(arabicSource).toContain("اخترت");
    expect(arabicSource).toContain("الباقة المختارة:");
    expect(arabicSource).toContain("المتابعة إلى واتساب مع تفاصيل طلبي");
    expect(arabicSource).toContain("أنت تتحكم في إرساله.");
  });
});
