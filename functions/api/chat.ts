type Env = {
  HERMES_CHAT_API_URL?: string;
  HERMES_CHAT_API_KEY?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });

const SYSTEM_PROMPT = `You are the public AutoApply SA assistant for the Saudi job market.
Help visitors understand AutoApply SA, CV preparation, job-search organisation, onboarding, pricing pages, and application workflow.
Reply in the user's language; Arabic should be natural Saudi-friendly Modern Standard Arabic and English should be concise.
Never claim a job application was submitted, an employer was contacted, a payment was completed, or a user account was changed unless the website explicitly provides verified evidence in the conversation.
Never request passwords, verification codes, API keys, national IDs, bank/card details, or other secrets.
Do not execute administrative, terminal, file, browser, email, messaging, payment, account-management, or deployment actions for public website visitors.
For actions that require an authenticated account, tell the visitor to sign in and use the dashboard.
If you are unsure about AutoApply SA product behavior, say so instead of inventing a feature.`;

function validMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 16) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 4_000) return null;
    messages.push({ role, content: trimmed });
  }
  if (messages[messages.length - 1]?.role !== "user") return null;
  return messages;
}

function extractReply(payload: unknown): string | null {
  const content = (payload as any)?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .map((part) => (part && typeof part.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
    return text || null;
  }
  return null;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const baseUrl = context.env.HERMES_CHAT_API_URL?.trim().replace(/\/$/, "");
  const apiKey = context.env.HERMES_CHAT_API_KEY?.trim();
  if (!baseUrl || !apiKey) {
    return json({ error: "Chat is not configured." }, 503);
  }

  let body: unknown;
  try {
    const declaredLength = Number(context.request.headers.get("content-length") || 0);
    if (declaredLength > 70_000) return json({ error: "Request too large." }, 413);
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const messages = validMessages((body as { messages?: unknown })?.messages);
  if (!messages) {
    return json({ error: "Invalid chat messages." }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "hermes-agent",
        stream: false,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return json({ error: "Chat is temporarily unavailable." }, 502);
    }

    const upstream = await response.json();
    const reply = extractReply(upstream);
    if (!reply) return json({ error: "Chat returned an empty response." }, 502);
    return json({ reply });
  } catch {
    return json({ error: "Chat is temporarily unavailable." }, 502);
  } finally {
    clearTimeout(timeout);
  }
};

export const onRequest = async (context: { request: Request; env: Env }) => {
  if (context.request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  return onRequestPost(context);
};
