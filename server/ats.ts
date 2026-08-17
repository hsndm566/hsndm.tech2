import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const atsInput = z.object({ cvText: z.string().min(120).max(18000), targetRole: z.string().max(120).optional() });
export const atsOutput = z.object({ score: z.number().min(0).max(100), summary: z.string().max(600), strengths: z.array(z.string().max(180)).max(4), gaps: z.array(z.string().max(180)).max(4), optimizedBullets: z.array(z.string().max(240)).max(5), disclaimer: z.string().max(240) });

const atsResponseSchema = {
  type: "object",
  properties: {
    score: { type: "number", minimum: 0, maximum: 100 },
    summary: { type: "string", maxLength: 600 },
    strengths: { type: "array", maxItems: 4, items: { type: "string", maxLength: 180 } },
    gaps: { type: "array", maxItems: 4, items: { type: "string", maxLength: 180 } },
    optimizedBullets: { type: "array", maxItems: 5, items: { type: "string", maxLength: 240 } },
    disclaimer: { type: "string", maxLength: 240 },
  },
  required: ["score", "summary", "strengths", "gaps", "optimizedBullets", "disclaimer"],
  additionalProperties: false,
} as const;

export async function analyzeAts(input: z.infer<typeof atsInput>) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    max_completion_tokens: 1000,
    reasoning: { effort: "minimal" },
    response_format: { type: "json_schema", json_schema: { name: "ats_result", strict: true, schema: atsResponseSchema } },
    messages: [{ role: "system", content: "You are a careful ATS advisor for Saudi Arabia job seekers. Analyse only the supplied CV text. Do not invent qualifications, employers, metrics, or job outcomes. Return complete JSON only. Keep the review concise: no more than 4 strengths, 4 gaps, and 5 optimized bullets; keep each item under 18 words. State that this is guidance, not a hiring prediction." }, { role: "user", content: `Target role: ${input.targetRole || "Not specified"}\n\nCV text:\n${input.cvText}` }],
  });
  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("ATS analysis returned no structured text");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    parsed = JSON.parse(cleaned);
  }
  return atsOutput.parse(parsed);
}
