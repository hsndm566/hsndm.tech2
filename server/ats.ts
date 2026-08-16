import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const atsInput = z.object({ cvText: z.string().min(120).max(18000), targetRole: z.string().max(120).optional() });
export const atsOutput = z.object({ score: z.number().min(0).max(100), summary: z.string().max(600), strengths: z.array(z.string().max(180)).max(4), gaps: z.array(z.string().max(180)).max(4), optimizedBullets: z.array(z.string().max(240)).max(5), disclaimer: z.string().max(240) });

export async function analyzeAts(input: z.infer<typeof atsInput>) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    max_tokens: 1200,
    response_format: { type: "json_schema", json_schema: { name: "ats_result", strict: true, schema: { type: "object", properties: { score: { type: "number" }, summary: { type: "string" }, strengths: { type: "array", items: { type: "string" } }, gaps: { type: "array", items: { type: "string" } }, optimizedBullets: { type: "array", items: { type: "string" } }, disclaimer: { type: "string" } }, required: ["score", "summary", "strengths", "gaps", "optimizedBullets", "disclaimer"], additionalProperties: false } } },
    messages: [{ role: "system", content: "You are a careful ATS advisor for Saudi Arabia job seekers. Analyse only the supplied CV text. Do not invent qualifications, employers, metrics, or job outcomes. Give concise actionable feedback and state that this is guidance, not a hiring prediction." }, { role: "user", content: `Target role: ${input.targetRole || "Not specified"}\n\nCV text:\n${input.cvText}` }],
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
