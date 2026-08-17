const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

type GroqMessage = { role: "system" | "user"; content: string };

export const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY?.trim());

export async function invokeGroqJson(params: {
  messages: GroqMessage[];
  maxCompletionTokens: number;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("Groq is not configured");

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
      temperature: 0,
      max_completion_tokens: params.maxCompletionTokens,
      messages: params.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned no JSON content");
  }
  return content;
}
