import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const englishThankYou = readFileSync(new URL("./ThankYou.tsx", import.meta.url), "utf8");
const arabicThankYou = readFileSync(new URL("./ArabicThankYou.tsx", import.meta.url), "utf8");
const campaignStatus = readFileSync(new URL("./CampaignStatus.tsx", import.meta.url), "utf8");
const updatesStyles = readFileSync(new URL("../updates.css", import.meta.url), "utf8");

describe("campaign and confirmation state hierarchy", () => {
  it("keeps the bilingual confirmation next step explicit without removing user control", () => {
    expect(englishThankYou).toContain('className="thanks-stages" aria-label="What happens next"');
    expect(englishThankYou).toContain("You control the next message");
    expect(arabicThankYou).toContain('className="thanks-stages" aria-label="ماذا يحدث بعد ذلك"');
    expect(arabicThankYou).toContain("أنت من يقرر الإرسال");
  });

  it("keeps external contact routes isolated and makes private loading feedback announced", () => {
    expect(englishThankYou).toContain('rel="noopener noreferrer"');
    expect(englishThankYou).toContain('style={{ color: "#f5f2eb" }}');
    expect(arabicThankYou).toContain('rel="noopener noreferrer"');
    expect(arabicThankYou).toContain('style={{ color: "#f5f2eb" }}');
    expect(campaignStatus).toContain('role="status" aria-live="polite"');
    expect(campaignStatus).toContain('style={{ color: "#fbf9f5" }}');
    expect(campaignStatus).toContain('target="_blank" rel="noopener noreferrer"');
  });

  it("keeps the confirmation receipt constrained to the available inline width in RTL phone layouts", () => {
    expect(updatesStyles).toContain(".thanks-card { width: 100%; box-sizing: border-box; margin-inline: auto; }");
  });
});
