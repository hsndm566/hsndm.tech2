import { describe, expect, it, vi } from "vitest";
import { analyzeAts } from "./ats";
import { invokeLLM } from "./_core/llm";
import { invokeGroqJson, isGroqConfigured } from "./groq";

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

vi.mock("./groq", () => ({
  isGroqConfigured: vi.fn(() => false),
  invokeGroqJson: vi.fn(),
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

  it("uses Groq when configured and preserves the fallback provider for resilience", async () => {
    vi.mocked(isGroqConfigured).mockReturnValue(true);
    vi.mocked(invokeGroqJson).mockResolvedValue(JSON.stringify({
      score: 76,
      summary: "Groq review completed.",
      strengths: ["Relevant analysis skills"],
      gaps: ["Add quantified outcomes"],
      optimizedBullets: ["Analysed operational data with SQL."],
      disclaimer: "Guidance only.",
    }));

    const result = await analyzeAts({ cvText: "B".repeat(130), targetRole: "Analyst" });

    expect(result.score).toBe(76);
    expect(invokeGroqJson).toHaveBeenCalledWith(expect.objectContaining({ maxCompletionTokens: 1000 }));
  });
});
