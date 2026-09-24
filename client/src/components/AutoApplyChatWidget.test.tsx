import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AutoApplyChatWidget.tsx", import.meta.url), "utf8");

describe("AutoApplyChatWidget readiness gate", () => {
  it("fails closed until the server-side Hermes readiness endpoint is healthy", () => {
    expect(source).toContain('fetch("/api/chat/health"');
    expect(source).toContain("if (!ready) return null");
    expect(source).not.toContain("herokuapp.com");
    expect(source).not.toContain("HERMES_CHAT_API_KEY");
  });

  it("sends chat messages only through the same-origin server proxy", () => {
    expect(source).toContain('fetch("/api/chat"');
    expect(source).toContain('method: "POST"');
    expect(source).toContain("Ask AutoApply");
    expect(source).toContain("مساعد AutoApply SA");
  });
});
