import { describe, expect, it, vi } from "vitest";
import { analyzeAts } from "./ats";

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
  });
});
