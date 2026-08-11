import { describe, expect, it } from "vitest";
import { campaignReadinessInputSchema } from "./campaignReadiness.schema";

const validBrief = {
  city: "Jeddah",
  industry: "technology-data",
  seniority: "Mid level",
  language: "English",
  targetRoles: ["Software Engineer", "Backend Developer"],
  primaryField: "Software & Engineering",
  cvReadable: true,
  consent: true,
  source: "landing-readiness-check" as const,
};

describe("campaign readiness input", () => {
  it("accepts a voluntary, no-CV campaign brief", () => {
    expect(campaignReadinessInputSchema.parse(validBrief)).toEqual(validBrief);
  });

  it("rejects unsupported locations and briefs without consent", () => {
    expect(() => campaignReadinessInputSchema.parse({ ...validBrief, city: "Dubai" })).toThrow();
    expect(() => campaignReadinessInputSchema.parse({ ...validBrief, consent: false })).toThrow();
  });
});
