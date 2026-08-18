import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentSource = (fileName: string) => readFileSync(resolve(process.cwd(), "client/src/components", fileName), "utf8");

describe("mobile fixed controls", () => {
  it("keeps persisted cookie settings vertically separated from the bottom-left WhatsApp CTA", () => {
    const cookieConsent = componentSource("CookieConsent.tsx");
    const whatsapp = componentSource("WhatsAppBusinessCta.tsx");

    expect(cookieConsent).toContain("bottom-[calc(max(.75rem,env(safe-area-inset-bottom))+4rem)]");
    expect(whatsapp).toContain("fixed bottom-4 left-4");
    expect(cookieConsent).toContain("sm:bottom-4");
  });
});
