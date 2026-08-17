import { describe, expect, it, vi } from "vitest";
import { analyzeAts } from "./ats";
import { invokeLLM } from "./_core/llm";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify({
            score: 82,
            summary: "Strong alignment with tech roles in Jeddah.",
            strengths: ["Clear technical stack", "Relevant regional experience"],
            gaps: ["Add Quantifiable metrics"],
            optimizedBullets: ["Engineered robust backend solutions."],
            disclaimer: "AI guidance only, not a guarantee.",
          }),
        },
      },
    ],
  })),
}));

describe("ATS backend analysis", () => {
  it("successfully parses and validates analyzeAts response", async () => {
    const res = await analyzeAts({ cvText: "A".repeat(130), targetRole: "Software Engineer" });
    expect(res.score).toBe(82);
    expect(res.strengths.length).toBeGreaterThan(0);
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-5-mini",
      max_completion_tokens: 1000,
      reasoning: { effort: "minimal" },
    }));
    const request = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    const schema = request?.response_format?.type === "json_schema" ? request.response_format.json_schema.schema : undefined;
    expect(schema).toMatchObject({
      properties: {
        strengths: { maxItems: 4 },
        gaps: { maxItems: 4 },
        optimizedBullets: { maxItems: 5 },
      },
    });
  });
});
