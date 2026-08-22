import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentSource = (fileName: string) => readFileSync(resolve(process.cwd(), "client/src/components", fileName), "utf8");

describe("mobile fixed controls", () => {
  it("keeps persisted cookie settings compact while avoiding a duplicate page-level campaign bar", () => {
    const cookieConsent = componentSource("CookieConsent.tsx");
    const whatsapp = componentSource("WhatsAppBusinessCta.tsx");

    expect(cookieConsent).toContain("cookie-settings-trigger");
    expect(cookieConsent).toContain("bottom-[max(.75rem,env(safe-area-inset-bottom))]");
    expect(whatsapp).toContain("fixed bottom-4 left-4");
    expect(cookieConsent).toContain("sm:bottom-4");
  });
});
