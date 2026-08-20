import { describe, expect, it } from "vitest";
import { buildCandidateOnboardingSteps, calculateCandidateAnalytics } from "./candidateInsights";

describe("candidate insights", () => {
  it("calculates rates only from the candidate records supplied to it", () => {
    expect(calculateCandidateAnalytics(
      [{ status: "interview" }, { status: "applied" }],
      [{ applicationId: 1, evidenceType: "portal_confirmation" }],
    )).toMatchObject({ tracked: 2, evidenceCovered: 1, verifiedSubmitted: 1, positiveResponses: 1, evidenceCoverageRate: 50, positiveResponseRate: 50 });
  });

  it("does not fabricate a rate before a candidate has tracked applications", () => {
    expect(calculateCandidateAnalytics([], [])).toMatchObject({ evidenceCoverageRate: null, positiveResponseRate: null });
  });

  it("marks onboarding progress only from saved profile, approval, applications, and evidence", () => {
    const steps = buildCandidateOnboardingSteps({
      profile: { targetCity: "Jeddah", targetIndustry: "Technology", preferredSeniority: "Mid-level" },
      approval: { authorizationConfirmed: true },
      applications: [{ status: "applied" }],
      evidence: [],
    });
    expect(steps.map((step) => step.complete)).toEqual([true, true, true, false]);
  });
});
