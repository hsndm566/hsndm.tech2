import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createCampaignReadiness: vi.fn(),
  getCandidateProfile: vi.fn(),
  getJobApplications: vi.fn(),
  insertJobApplication: vi.fn(),
  updateCandidateProfile: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";

function makeContext(openId: string | null, role: "user" | "admin" = "user"): TrpcContext {
  const user = openId
    ? {
        id: 1,
        openId,
        name: openId,
        email: `${openId}@example.test`,
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

describe("application access control and authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getJobApplications.mockImplementation(async (openId?: string) => {
      if (openId === "candidate-a") return [{ id: 101, candidateOpenId: "candidate-a", companyName: "A Co" }];
      if (openId === "candidate-b") return [{ id: 202, candidateOpenId: "candidate-b", companyName: "B Co" }];
      return [
        { id: 101, candidateOpenId: "candidate-a", companyName: "A Co" },
        { id: 202, candidateOpenId: "candidate-b", companyName: "B Co" },
      ];
    });
  });

  it("keeps two candidate feeds isolated through the real applications router", async () => {
    const candidateA = appRouter.createCaller(makeContext("candidate-a"));
    const candidateB = appRouter.createCaller(makeContext("candidate-b"));

    const [aApplications, bApplications] = await Promise.all([
      candidateA.campaign.applications.list(),
      candidateB.campaign.applications.list(),
    ]);

    expect(aApplications).toEqual([{ id: 101, candidateOpenId: "candidate-a", companyName: "A Co" }]);
    expect(bApplications).toEqual([{ id: 202, candidateOpenId: "candidate-b", companyName: "B Co" }]);
    expect(aApplications).not.toContainEqual(expect.objectContaining({ candidateOpenId: "candidate-b" }));
    expect(bApplications).not.toContainEqual(expect.objectContaining({ candidateOpenId: "candidate-a" }));
    expect(mocks.getJobApplications).toHaveBeenCalledWith("candidate-a");
    expect(mocks.getJobApplications).toHaveBeenCalledWith("candidate-b");
  });

  it("allows an administrator to retrieve the full operational feed", async () => {
    const admin = appRouter.createCaller(makeContext("owner", "admin"));
    const applications = await admin.campaign.applications.list();

    expect(applications).toHaveLength(2);
    expect(mocks.getJobApplications).toHaveBeenCalledWith();
  });

  it("rejects unauthenticated application-list access", async () => {
    const anonymous = appRouter.createCaller(makeContext(null));
    await expect(anonymous.campaign.applications.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("persists bounded resume metadata only against the authenticated candidate profile", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await candidate.campaign.applications.profile.update({
      resumeFileName: "candidate-a-cv.pdf",
      resumeSummary: "Requested a human ATS follow-up for Riyadh finance roles.",
    });

    expect(mocks.updateCandidateProfile).toHaveBeenCalledWith("candidate-a", expect.objectContaining({
      resumeFileName: "candidate-a-cv.pdf",
      resumeSummary: "Requested a human ATS follow-up for Riyadh finance roles.",
    }));
  });

  it("rejects an oversized resume note rather than accepting CV text", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.applications.profile.update({ resumeSummary: "x".repeat(501) })).rejects.toBeTruthy();
  });
});
