import { describe, expect, it } from "vitest";
import { getWhatsAppFallbackMessage } from "./WhatsAppBusinessCta";

describe("page-aware WhatsApp fallback messages", () => {
  it("uses a concise relevant public-page prompt in English", () => {
    expect(getWhatsAppFallbackMessage("/ats")).toContain("ATS review");
    expect(getWhatsAppFallbackMessage("/enquire")).toContain("campaign brief");
    expect(getWhatsAppFallbackMessage("/pricing")).toContain("plans and pricing");
    expect(getWhatsAppFallbackMessage("/campaign/opaque-token?source=portal")).toContain("campaign tracking");
  });

  it("uses Arabic prompts for Arabic public routes", () => {
    expect(getWhatsAppFallbackMessage("/ar/enquire")).toContain("ملخص الحملة");
    expect(getWhatsAppFallbackMessage("/ar/pricing")).toContain("باقات الحملة");
    expect(getWhatsAppFallbackMessage("/ar/privacy")).toContain("الخصوصية");
  });

  it("never places a route parameter or query string in the generated message", () => {
    const message = getWhatsAppFallbackMessage("/campaign/private-id-123?email=person@example.com");
    expect(message).not.toContain("private-id-123");
    expect(message).not.toContain("person@example.com");
  });
});
