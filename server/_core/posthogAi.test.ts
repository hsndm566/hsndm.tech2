import { afterEach, describe, expect, it, vi } from "vitest";

import { captureAiGeneration } from "./posthogAi";

const originalEnv = process.env;
const originalFetch = globalThis.fetch;

describe("PostHog AI observability", () => {
  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("is a no-op when no PostHog key is configured", async () => {
    process.env = { ...originalEnv, POSTHOG_API_KEY: "", POSTHOG_PROJECT_API_KEY: "", VITE_POSTHOG_KEY: "" };
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await captureAiGeneration({
      requestPayload: { messages: [{ role: "user", content: "hello" }] },
      startedAt: Date.now(),
      provider: "test-provider",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("captures a privacy-safe $ai_generation event when configured", async () => {
    process.env = {
      ...originalEnv,
      POSTHOG_API_KEY: "phc_test",
      POSTHOG_HOST: "https://eu.posthog.com/",
      POSTHOG_PRIVACY_MODE: "true",
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
      "https://eu.posthog.com/capture/",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.event).toBe("$ai_generation");
    expect(body.properties).toMatchObject({
      "$ai_provider": "test-provider",
      "$ai_model": "gpt-test",
      "$ai_input_tokens": 10,
      "$ai_output_tokens": 5,
      "$ai_total_tokens": 15,
      "$ai_is_error": false,
      "$ai_input": null,
      "$ai_output_choices": null,
    });
  });
});