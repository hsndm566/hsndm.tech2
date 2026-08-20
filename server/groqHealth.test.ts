import { describe, expect, it } from "vitest";
import { invokeGroqJson } from "./groq";

// This requires a live third-party credential. Keep it opt-in while the approved
// production posture is fallback-only, so deterministic local/release tests do
// not depend on external provider availability.
describe.runIf(process.env.RUN_EXTERNAL_GROQ_HEALTH === "true")("Groq credential", () => {
  it("can list available models without exposing the API key", async () => {
    const apiKey = process.env.GROQ_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    const body = (await response.json()) as { data?: Array<{ id?: string }> };
    expect(body.data?.some(model => model.id === "openai/gpt-oss-20b")).toBe(true);
  }, 30_000);

  it("returns a structured response for a minimal non-personal completion", async () => {
    const content = await invokeGroqJson({
      maxCompletionTokens: 128,
      messages: [
        { role: "system", content: "Return only a JSON object with one boolean property named ok." },
        { role: "user", content: "Confirm the service is available." },
      ],
    });

    expect(JSON.parse(content)).toMatchObject({ ok: true });
  }, 30_000);
});
