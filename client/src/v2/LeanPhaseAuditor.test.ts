import { describe, expect, it } from "vitest";
import { auditLeanPhases } from "./LeanPhaseAuditor";

const profile = {
  fullName: "Candidate",
  targetCity: "Jeddah",
  targetIndustry: "Industrial Engineer",
  resumeFileName: "cv.pdf",
};

describe("Lean phase auditor", () => {
  it("locks later phases until phase one passes", () => {
    const audit = auditLeanPhases({ profile: null, applications: [], deliveryReady: false });
    expect(audit.phases.map((phase) => phase.status)).toEqual(["active", "locked", "locked", "locked", "locked"]);
    expect(audit.canTrack).toBe(false);
    expect(audit.canSend).toBe(false);
  });

  it("opens the delivery phase only after a real opportunity is tracked", () => {
    const audit = auditLeanPhases({
      profile,
      applications: [{ status: "queued", appliedAt: null }],
      deliveryReady: false,
    });
    expect(audit.phases.map((phase) => phase.status)).toEqual(["passed", "passed", "active", "locked", "locked"]);
  });

  it("unlocks sending after phases one through three pass", () => {
    const audit = auditLeanPhases({
      profile,
      applications: [{ status: "queued", appliedAt: null }],
      deliveryReady: true,
    });
    expect(audit.canSend).toBe(true);
    expect(audit.currentPhase).toBe(4);
  });

  it("requires five sent applications before the first batch passes", () => {
    const applications = Array.from({ length: 5 }, () => ({ status: "applied" as const, appliedAt: new Date().toISOString() }));
    const audit = auditLeanPhases({ profile, applications, deliveryReady: true });
    expect(audit.complete).toBe(true);
    expect(audit.phases.every((phase) => phase.status === "passed")).toBe(true);
  });
});
