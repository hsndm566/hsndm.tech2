type Env = {
  HERMES_CHAT_API_URL?: string;
  HERMES_CHAT_API_KEY?: string;
};

const reply = (status: "ready" | "unavailable", code: number) =>
  new Response(JSON.stringify({ status }), {
    status: code,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });

export const onRequestGet = async (context: { env: Env }) => {
  const baseUrl = context.env.HERMES_CHAT_API_URL?.trim().replace(/\/$/, "");
  const apiKey = context.env.HERMES_CHAT_API_KEY?.trim();
  if (!baseUrl || !apiKey) return reply("unavailable", 503);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (!response.ok) return reply("unavailable", 503);
    const payload = (await response.json()) as { status?: unknown };
    return payload.status === "ok" ? reply("ready", 200) : reply("unavailable", 503);
  } catch {
    return reply("unavailable", 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const onRequest = async (context: { request: Request; env: Env }) => {
  if (context.request.method !== "GET") return reply("unavailable", 405);
  return onRequestGet(context);
};
