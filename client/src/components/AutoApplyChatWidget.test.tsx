import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AutoApplyChatWidget.tsx", import.meta.url), "utf8");

describe("AutoApplyChatWidget Chatwoot bootstrap", () => {
  it("uses the official Chatwoot SDK and fails closed when unconfigured", () => {
    expect(source).toContain("VITE_CHATWOOT_BASE_URL");
    expect(source).toContain("VITE_CHATWOOT_WEBSITE_TOKEN");
    expect(source).toContain("/packs/js/sdk.js");
    expect(source).toContain("if (!CONFIGURED) return");
    expect(source).not.toContain("/api/chat");
    expect(source).not.toContain("HERMES_CHAT");
  });

  it("passes only the public website inbox token to the browser SDK", () => {
    expect(source).toContain("websiteToken: WEBSITE_TOKEN");
    expect(source).toContain("baseUrl: BASE_URL");
    expect(source).toContain('locale === "ar"');
    expect(source).not.toContain("API_KEY");
    expect(source).not.toContain("Authorization");
  });
});
