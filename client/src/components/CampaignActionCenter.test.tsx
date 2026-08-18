// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampaignActionCenter } from "./CampaignActionCenter";

describe("CampaignActionCenter", () => {
  afterEach(() => cleanup());

  it("requires a candidate to approve targeting before implying campaign work can proceed", () => {
    render(<CampaignActionCenter hasCandidateApproval={false} verifiedEvidenceCount={0} />);
    expect(screen.getByText("Review and approve your targeting plan")).toBeTruthy();
    expect(screen.getByText(/does not send job applications/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /review targeting plan/i }).getAttribute("href")).toBe("#campaign-approval-title");
  });

  it("shows awaiting-team-review rather than fabricating activity after approval", () => {
    render(<CampaignActionCenter hasCandidateApproval verifiedEvidenceCount={0} />);
    expect(screen.getByText("No candidate action is needed right now")).toBeTruthy();
    expect(screen.getByText("0 recorded")).toBeTruthy();
    expect(screen.getByText(/saved for team review/i)).toBeTruthy();
  });

  it("surfaces a recorded interview or offer milestone as a review action", () => {
    render(<CampaignActionCenter applicationStatuses={["applied", "interview"]} hasCandidateApproval verifiedEvidenceCount={2} />);
    expect(screen.getByText("Review your recorded application update")).toBeTruthy();
    expect(screen.getByText("2 recorded")).toBeTruthy();
    expect(screen.getByRole("link", { name: /review activity update/i }).getAttribute("href")).toBe("#recent-activity");
  });

  it("renders Arabic action guidance when requested", () => {
    render(<CampaignActionCenter hasCandidateApproval={false} isArabic verifiedEvidenceCount={0} />);
    expect(screen.getByText("خطوتك التالية في الحملة")).toBeTruthy();
    expect(screen.getByText("راجع واعتمد خطة الاستهداف")).toBeTruthy();
  });
});
