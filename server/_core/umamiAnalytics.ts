import type { InvokeResult } from "./llm";

type AiCapturePayload = {
  requestPayload: Record<string, unknown>;
  response?: InvokeResult;
  error?: unknown;
  startedAt: number;
  provider: string;
};

const websiteId = () =>
  process.env.UMAMI_WEBSITE_ID?.trim() ||
  process.env.VITE_UMAMI_WEBSITE_ID?.trim() ||
  "";

const hostUrl = () =>
  (process.env.UMAMI_HOST_URL?.trim() ||
    process.env.VITE_UMAMI_HOST_URL?.trim() ||
    "https://cloud.umami.is").replace(/\/$/, "");

const serializableError = (error: unknown) => {
  if (!error) return undefined;
  if (error instanceof Error) return error.message.slice(0, 240);
  return String(error).slice(0, 240);
};

export async function captureAiGeneration({
  requestPayload,
  response,
  error,
  startedAt,
  provider,
}: AiCapturePayload) {
  const website = websiteId();
  if (!website) return;

  const firstChoice = response?.choices?.[0];
  const usage = response?.usage;
  const eventError = serializableError(error);

  const data = {
    provider,
    model: String(response?.model || requestPayload.model || "default"),
    latency_ms: Math.max(0, Date.now() - startedAt),
    input_tokens: usage?.prompt_tokens ?? 0,
    output_tokens: usage?.completion_tokens ?? 0,
    total_tokens: usage?.total_tokens ?? 0,
    stop_reason: firstChoice?.finish_reason || (eventError ? "error" : "unknown"),
    is_error: Boolean(eventError),
    error: eventError || "",
    runtime: "server",
  };

  try {
    await fetch(`${hostUrl()}/api/send`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "AutoApply-SA/1.0",
      },
      body: JSON.stringify({
        type: "event",
        payload: {
          website,
          hostname: "api.hsndm.tech",
          language: "en-US",
          url: "/api/llm",
          title: "AutoApply SA AI",
          name: "ai-generation",
          data,
        },
      }),
    });
  } catch {
    // Analytics must never interrupt customer-facing LLM features.
  }
}
