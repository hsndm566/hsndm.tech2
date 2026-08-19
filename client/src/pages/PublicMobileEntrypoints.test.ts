import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const arabicHome = readFileSync(new URL("./ArabicHome.tsx", import.meta.url), "utf8");
const whatsAppFallback = readFileSync(new URL("../components/WhatsAppBusinessCta.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

describe("public mobile entrypoints", () => {
  it("keeps the working ATS route discoverable through English and Arabic mobile navigation", () => {
    expect(home).toContain('Link href="/ats"');
    expect(home).toContain("Free ATS review");
    expect(home).toContain('className="mobile-ats-link"');
    expect(arabicHome).toContain('Link href="/ats"');
    expect(arabicHome).toContain("فحص ATS المجاني");
    expect(arabicHome).toContain('className="mobile-ats-link"');
  });

  it("keeps a clearly labelled WhatsApp chat fallback mounted globally while the AI widget remains disabled", () => {
    expect(whatsAppFallback).toContain("Chat on WhatsApp");
    expect(whatsAppFallback).toContain("تحدث عبر WhatsApp");
    expect(app).toContain("<WhatsAppBusinessCta />");
    expect(app).not.toContain("<AutoApplyChatWidget");
  });
});
