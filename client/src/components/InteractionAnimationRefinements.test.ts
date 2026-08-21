import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const onboardingSource = readFileSync(new URL("./CandidateOnboardingChecklist.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../pages/Dashboard.tsx", import.meta.url), "utf8");

describe("interaction animation refinements", () => {
  it("adds a reduced-motion-safe approval sweep to primary ink CTAs", () => {
    expect(css).toContain(".button-ink { background: linear-gradient(102deg");
    expect(css).toContain("background-position .42s");
    expect(css).toContain("@media (prefers-reduced-motion: no-preference)");
  });

  it("only marks onboarding feedback targets when a step newly completes", () => {
    expect(onboardingSource).toContain("previousCompletionState");
    expect(onboardingSource).toContain("previous.get(step.id) === false && step.complete");
    expect(onboardingSource).toContain("data-onboarding-complete-feedback");
    expect(onboardingSource).toContain("data-onboarding-completion-check");
  });

  it("animates dashboard result cards only after status or sort controls change", () => {
    expect(dashboardSource).toContain("filterTransitionInitialized");
    expect(dashboardSource).toContain("[statusFilter, sortBy]");
    expect(dashboardSource).toContain("data-dashboard-filtering");
    expect(dashboardSource).toContain("dashboard-application-card");
    expect(css).toContain("dashboard-filter-card-in");
  });

  it("provides a compact, truthful, and accessible results-count update", () => {
    expect(dashboardSource).toContain('aria-live="polite"');
    expect(dashboardSource).toContain("data-dashboard-filter-count");
    expect(dashboardSource).toContain("dashboard-filter-count-value");
    expect(dashboardSource).toContain("dashboard-filter-count-note");
    expect(css).toContain("dashboard-filter-count-pop");
    expect(css).toContain("dashboard-filter-note-in");
  });
});
