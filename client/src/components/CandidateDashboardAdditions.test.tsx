import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CandidateAnalyticsSummary } from "./CandidateAnalyticsSummary";
import { CandidateOnboardingChecklist } from "./CandidateOnboardingChecklist";

describe("candidate dashboard additions", () => {
  it("labels analytics as candidate-private and avoids fabricated rates for an empty workspace", () => {
    const markup = renderToStaticMarkup(<CandidateAnalyticsSummary applications={[]} evidence={[]} />);
    expect(markup).toContain("Evidence-first analytics");
    expect(markup).toContain("Private to your workspace");
    expect((markup.match(/—/g) || [])).toHaveLength(2);
    expect(markup).toContain("not a benchmark, prediction, or comparison");
    expect((markup.match(/data-anime-dashboard-analytics-card/g) || [])).toHaveLength(4);
  });

  it("shows only the next incomplete onboarding action for a new candidate", () => {
    const markup = renderToStaticMarkup(<CandidateOnboardingChecklist applications={[]} evidence={[]} profile={null} approval={null} />);
    expect(markup).toContain("Your onboarding checklist");
    expect(markup).toContain("0 / 4 complete");
    expect(markup).toContain("Next step");
    expect(markup).toContain('href="/dashboard/settings"');
    expect((markup.match(/data-anime-dashboard-onboarding-step/g) || [])).toHaveLength(4);
  });
});
