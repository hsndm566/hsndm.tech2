import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCampaignReadiness: vi.fn(),
  insertJobApplication: vi.fn(),
  notifyOperationalFailure: vi.fn(),
}));

vi.mock("./db", () => ({
  createCampaignReadiness: mocks.createCampaignReadiness,
  getJobApplications: vi.fn(),
  insertJobApplication: mocks.insertJobApplication,
  getCandidateProfile: vi.fn(),
  updateCandidateProfile: vi.fn(),
}));

vi.mock("./operationalAlerts", () => ({
  notifyClientCvExtractionFailure: vi.fn(),
  notifyClientWorkflowFallback: vi.fn(),
  notifyOperationalFailure: mocks.notifyOperationalFailure,
}));

const readinessInput = {
  city: "Jeddah",
  industry: "technology-data",
  seniority: "Mid level",
  language: "English",
  targetRoles: ["Software Engineer"],
  primaryField: "Software & Engineering",
  cvReadable: true,
  consent: true,
  source: "landing-readiness-check" as const,
};

describe("operational failure routing", () => {
  beforeEach(() => {
    mocks.createCampaignReadiness.mockReset();
    mocks.insertJobApplication.mockReset();
    mocks.notifyOperationalFailure.mockReset().mockResolvedValue(undefined);
  });

  it("notifies the owner when campaign readiness cannot be persisted", async () => {
    mocks.createCampaignReadiness.mockResolvedValue(false);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({ user: null } as never);

    await expect(caller.campaign.readiness.record(readinessInput)).rejects.toThrow("campaign readiness record was not persisted");
    expect(mocks.notifyOperationalFailure).toHaveBeenCalledWith("campaign readiness", expect.any(Error));
  });

  it("notifies the owner when an application insert returns no record", async () => {
    mocks.insertJobApplication.mockResolvedValue(null);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({ user: { openId: "candidate-a", role: "user" } } as never);

    await expect(caller.campaign.applications.create({
      candidateName: "Candidate A",
      candidateEmail: "candidate@example.com",
      companyName: "Example Co",
      roleTitle: "Operations Coordinator",
      city: "Jeddah",
    })).rejects.toThrow("application record was not persisted");
    expect(mocks.notifyOperationalFailure).toHaveBeenCalledWith("application creation", expect.any(Error));
  });
});
