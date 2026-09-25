import { afterEach, describe, expect, it, vi } from "vitest";

import { captureAiGeneration } from "./umamiAnalytics";

const originalEnv = process.env;
const originalFetch = globalThis.fetch;

describe("Umami AI observability", () => {
  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("is a no-op when no Umami website id is configured", async () => {
    process.env = { ...originalEnv, UMAMI_WEBSITE_ID: "", VITE_UMAMI_WEBSITE_ID: "" };
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await captureAiGeneration({
      requestPayload: { messages: [{ role: "user", content: "hello" }] },
      startedAt: Date.now(),
      provider: "test-provider",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("captures a privacy-safe server event when configured", async () => {
    process.env = {
      ...originalEnv,
      UMAMI_WEBSITE_ID: "website-test-id",
      UMAMI_HOST_URL: "https://cloud.umami.is/",
    };
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await captureAiGeneration({
      requestPayload: {
        model: "gpt-test",
        messages: [{ role: "user", content: "sensitive cv text" }],
      },
      response: {
        id: "chatcmpl_1",
        created: 1,
        model: "gpt-test",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "answer" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      },
      startedAt: Date.now() - 200,
      provider: "test-provider",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://cloud.umami.is/api/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "user-agent": "AutoApply-SA/1.0" }),
      })
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.type).toBe("event");
    expect(body.payload).toMatchObject({
      website: "website-test-id",
      name: "ai-generation",
      data: {
        provider: "test-provider",
        model: "gpt-test",
        input_tokens: 10,
        output_tokens: 5,
        total_tokens: 15,
        is_error: false,
      },
    });
    expect(JSON.stringify(body)).not.toContain("sensitive cv text");
    expect(JSON.stringify(body)).not.toContain('"answer"');
  });
});
