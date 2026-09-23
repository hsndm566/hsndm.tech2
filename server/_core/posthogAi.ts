import { randomUUID } from "node:crypto";

import type { InvokeResult } from "./llm";

type AiCapturePayload = {
  requestPayload: Record<string, unknown>;
  response?: InvokeResult;
  error?: unknown;
  startedAt: number;
  provider: string;
};

const redactContent = () => {
  const privacyMode = process.env.POSTHOG_PRIVACY_MODE;
  const captureContent = process.env.POSTHOG_AI_CAPTURE_CONTENT;

  if (captureContent?.toLowerCase() === "true") return false;
  if (privacyMode?.toLowerCase() === "false") return false;
  return true;
};

const posthogKey = () =>
  process.env.POSTHOG_API_KEY?.trim() ||
  process.env.POSTHOG_PROJECT_API_KEY?.trim() ||
  process.env.VITE_POSTHOG_KEY?.trim() ||
  "";

const posthogHost = () =>
  (process.env.POSTHOG_HOST?.trim() ||
    process.env.VITE_POSTHOG_HOST?.trim() ||
    "https://app.posthog.com").replace(/\/$/, "");

const distinctId = () =>
  process.env.POSTHOG_DISTINCT_ID?.trim() ||
  process.env.AUTOAPPLY_SERVICE_NAME?.trim() ||
  "autoapply-sa-server";

const serializableError = (error: unknown) => {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export async function captureAiGeneration({
  requestPayload,
  response,
  error,
  startedAt,
  provider,
}: AiCapturePayload) {
  const apiKey = posthogKey();
  if (!apiKey) return;

  const latencySeconds = Math.max(0, Date.now() - startedAt) / 1000;
  const traceId = randomUUID();
  const spanId = randomUUID();
  const isPrivate = redactContent();
  const firstChoice = response?.choices?.[0];
  const usage = response?.usage;
  const eventError = serializableError(error);

  const properties: Record<string, unknown> = {
    "$ai_trace_id": traceId,
    "$ai_span_id": spanId,
    "$ai_session_id": "autoapply-sa-v2",
    "$ai_provider": provider,
    "$ai_model": response?.model || requestPayload.model || "default",
    "$ai_latency": latencySeconds,
    "$ai_input_tokens": usage?.prompt_tokens,
    "$ai_output_tokens": usage?.completion_tokens,
    "$ai_total_tokens": usage?.total_tokens,
    "$ai_stop_reason": firstChoice?.finish_reason || (eventError ? "error" : undefined),
    "$ai_is_error": Boolean(eventError),
    "$ai_error": eventError,
    "$ai_input": isPrivate ? null : requestPayload.messages,
    "$ai_output_choices": isPrivate ? null : response?.choices,
    "$ai_tools": isPrivate ? null : requestPayload.tools,
    app: "autoapply-sa-v2",
    runtime: "server",
  };

  try {
    await fetch(`${posthogHost()}/capture/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event: "$ai_generation",
        distinct_id: distinctId(),
        properties,
      }),
    });
  } catch {
    // AI observability must never interrupt customer-facing LLM features.
  }
}