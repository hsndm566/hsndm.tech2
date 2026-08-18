import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createCampaignReadiness: vi.fn(),
  getCandidateCampaignApproval: vi.fn(),
  getCandidateProfile: vi.fn(),
  getCandidateApplicationEvidence: vi.fn(),
  getAllJobApplications: vi.fn(),
  getCandidateJobApplications: vi.fn(),
  getJobApplicationById: vi.fn(),
  insertJobApplication: vi.fn(),
  recordApplicationEvidence: vi.fn(),
  upsertCandidateCampaignApproval: vi.fn(),
  updateJobApplication: vi.fn(),
  deleteJobApplication: vi.fn(),
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
    mocks.updateJobApplication.mockResolvedValue({ id: 101, candidateOpenId: "candidate-a", companyName: "A Co", roleTitle: "Analyst", city: "Jeddah", status: "interview", notes: "Interview confirmed" });
    mocks.deleteJobApplication.mockResolvedValue(true);
    mocks.updateCandidateProfile.mockImplementation(async (openId: string) => ({ id: 1, openId }));
    mocks.getCandidateJobApplications.mockImplementation(async (openId: string) => {
      if (openId === "candidate-a") return [{ id: 101, candidateOpenId: "candidate-a", companyName: "A Co" }];
      if (openId === "candidate-b") return [{ id: 202, candidateOpenId: "candidate-b", companyName: "B Co" }];
      return [];
    });
    mocks.getAllJobApplications.mockResolvedValue([
        { id: 101, candidateOpenId: "candidate-a", companyName: "A Co" },
        { id: 202, candidateOpenId: "candidate-b", companyName: "B Co" },
    ]);
    mocks.getCandidateApplicationEvidence.mockImplementation(async (openId: string) => {
      if (openId === "candidate-a") return [{ id: 1, applicationId: 101, candidateOpenId: "candidate-a", evidenceType: "portal_confirmation" }];
      return [];
    });
    mocks.getJobApplicationById.mockResolvedValue({ id: 101, candidateOpenId: "candidate-a", companyName: "A Co", roleTitle: "Analyst" });
    mocks.recordApplicationEvidence.mockResolvedValue({ id: 1, applicationId: 101, candidateOpenId: "candidate-a", evidenceType: "portal_confirmation" });
    mocks.getCandidateCampaignApproval.mockResolvedValue(null);
    mocks.upsertCandidateCampaignApproval.mockImplementation(async (input: Record<string, unknown>) => ({ id: 1, ...input, approvedAt: new Date() }));
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
    expect(mocks.getCandidateJobApplications).toHaveBeenCalledWith("candidate-a");
    expect(mocks.getCandidateJobApplications).toHaveBeenCalledWith("candidate-b");
    expect(mocks.getAllJobApplications).not.toHaveBeenCalled();
  });

  it("allows an administrator to retrieve the full operational feed", async () => {
    const admin = appRouter.createCaller(makeContext("owner", "admin"));
    const applications = await admin.campaign.applications.list();

    expect(applications).toHaveLength(2);
    expect(mocks.getAllJobApplications).toHaveBeenCalledWith();
    expect(mocks.getCandidateJobApplications).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated application-list access", async () => {
    const anonymous = appRouter.createCaller(makeContext(null));
    await expect(anonymous.campaign.applications.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns only candidate-owned evidence through the protected evidence feed", async () => {
    const candidateA = appRouter.createCaller(makeContext("candidate-a"));
    const candidateB = appRouter.createCaller(makeContext("candidate-b"));

    await expect(candidateA.campaign.applications.evidence.list()).resolves.toEqual([
      expect.objectContaining({ applicationId: 101, candidateOpenId: "candidate-a" }),
    ]);
    await expect(candidateB.campaign.applications.evidence.list()).resolves.toEqual([]);
    expect(mocks.getCandidateApplicationEvidence).toHaveBeenCalledWith("candidate-a");
    expect(mocks.getCandidateApplicationEvidence).toHaveBeenCalledWith("candidate-b");
  });

  it("does not allow a candidate to record proof for any application", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.applications.evidence.record({ applicationId: 101, evidenceType: "portal_confirmation" })).rejects.toThrow("Only an authorized operator");
    expect(mocks.getJobApplicationById).not.toHaveBeenCalled();
    expect(mocks.recordApplicationEvidence).not.toHaveBeenCalled();
  });

  it("binds operator-recorded evidence to the application owner rather than request input", async () => {
    const admin = appRouter.createCaller(makeContext("owner", "admin"));
    await expect(admin.campaign.applications.evidence.record({ applicationId: 101, evidenceType: "email_accepted" })).resolves.toMatchObject({ success: true });
    expect(mocks.getJobApplicationById).toHaveBeenCalledWith(101, { kind: "admin" });
    expect(mocks.recordApplicationEvidence).toHaveBeenCalledWith({
      applicationId: 101,
      candidateOpenId: "candidate-a",
      evidenceType: "email_accepted",
    });
  });

  it("persists campaign approval only against the authenticated candidate account", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.approval.confirm({
      targetRoles: ["Data Analyst"],
      targetCity: "Jeddah",
      targetIndustry: "Technology & Engineering",
      seniority: "Mid-level",
      preferredLanguage: "English",
      openToRemote: false,
      authorizationConfirmed: true,
    })).resolves.toMatchObject({ success: true });
    expect(mocks.upsertCandidateCampaignApproval).toHaveBeenCalledWith(expect.objectContaining({
      openId: "candidate-a",
      targetRoles: ["Data Analyst"],
      authorizationConfirmed: true,
    }));
  });

  it("requires explicit campaign authorization before storing a targeting plan", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.approval.confirm({
      targetRoles: ["Data Analyst"],
      targetCity: "Jeddah",
      targetIndustry: "Technology & Engineering",
      seniority: "Mid-level",
      preferredLanguage: "English",
      openToRemote: false,
      authorizationConfirmed: false,
    } as never)).rejects.toBeTruthy();
    expect(mocks.upsertCandidateCampaignApproval).not.toHaveBeenCalled();
  });

  it("surfaces application-data failures instead of presenting a false empty campaign", async () => {
    mocks.getCandidateJobApplications.mockRejectedValueOnce(new Error("Application data is temporarily unavailable."));
    const candidate = appRouter.createCaller(makeContext("candidate-a"));

    await expect(candidate.campaign.applications.list()).rejects.toThrow("Application data is temporarily unavailable.");
  });

  it("rejects unavailable profile reads and updates instead of reporting false success", async () => {
    mocks.getCandidateProfile.mockResolvedValueOnce(null);
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.applications.profile.get()).rejects.toThrow("Candidate profile is temporarily unavailable.");

    mocks.updateCandidateProfile.mockResolvedValueOnce(null);
    await expect(candidate.campaign.applications.profile.update({ targetCity: "Jeddah" })).rejects.toThrow("Candidate profile could not be updated right now.");
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

  it("accepts personal information and matching preferences only for the authenticated candidate", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await candidate.campaign.applications.profile.update({
      fullName: "Hasan Adam",
      phone: "+966 500000000",
      preferredSeniority: "Senior",
      preferredLanguage: "Arabic",
      openToRemote: true,
      targetCity: "Jeddah",
      targetIndustry: "Artificial Intelligence",
      notifyWhatsApp: false,
    });

    expect(mocks.updateCandidateProfile).toHaveBeenCalledWith("candidate-a", expect.objectContaining({
      fullName: "Hasan Adam",
      phone: "+966 500000000",
      preferredSeniority: "Senior",
      preferredLanguage: "Arabic",
      openToRemote: true,
      targetCity: "Jeddah",
      targetIndustry: "Artificial Intelligence",
      notifyWhatsApp: false,
    }));
  });

  it("rejects an oversized resume note rather than accepting CV text", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.applications.profile.update({ resumeSummary: "x".repeat(501) })).rejects.toBeTruthy();
  });

  it("updates only the selected application through the authenticated candidate ownership boundary", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    const result = await candidate.campaign.applications.update({
      id: 101,
      status: "interview",
      notes: "Interview confirmed",
    });

    expect(result).toMatchObject({ success: true, updated: { id: 101, status: "interview" } });
    expect(mocks.updateJobApplication).toHaveBeenCalledWith(101, { kind: "candidate", candidateOpenId: "candidate-a" }, {
      status: "interview",
      notes: "Interview confirmed",
    });
  });

  it("passes administrative scope explicitly for operational application changes", async () => {
    const admin = appRouter.createCaller(makeContext("owner", "admin"));
    await admin.campaign.applications.update({ id: 202, city: "Riyadh" });

    expect(mocks.updateJobApplication).toHaveBeenCalledWith(202, { kind: "admin" }, { city: "Riyadh" });
  });

  it("deletes an application only through the protected candidate procedure", async () => {
    const candidate = appRouter.createCaller(makeContext("candidate-a"));
    await expect(candidate.campaign.applications.delete({ id: 101 })).resolves.toEqual({ success: true });
    expect(mocks.deleteJobApplication).toHaveBeenCalledWith(101, { kind: "candidate", candidateOpenId: "candidate-a" });

    const anonymous = appRouter.createCaller(makeContext(null));
    await expect(anonymous.campaign.applications.delete({ id: 101 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
