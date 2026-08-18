// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveSentryDsn, sanitizeSentryText } from "./sentryTelemetry";

describe("Sentry privacy scrubbing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes URLs, contact details, and long identifiers from client messages", () => {
    const message = sanitizeSentryText("CV error for sara@example.com at https://hsndm.tech/enquire?phone=+966571448656 id 1234567890");

    expect(message).toContain("[email]");
    expect(message).toContain("[url]");
    expect(message).toContain("[number]");
    expect(message).not.toContain("sara@example.com");
    expect(message).not.toContain("571448656");
    expect(message).not.toContain("1234567890");
  });

  it("bounds unexpected client error text before it can be sent", () => {
    expect(sanitizeSentryText("x".repeat(500))).toHaveLength(180);
  });

  it("resolves a runtime DSN only from the public client configuration endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ dsn: "https://public@example.ingest.sentry.io/123" }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveSentryDsn()).resolves.toBe("https://public@example.ingest.sentry.io/123");
    expect(fetchMock).toHaveBeenCalledWith("/api/client-config/sentry", expect.objectContaining({ credentials: "same-origin" }));
  });
});
