// @vitest-environment jsdom
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class CampaignAccessError extends Error {}
  class CampaignConnectionError extends Error {}
  return {
    fetchCampaignDashboard: vi.fn(),
    CampaignAccessError,
    CampaignConnectionError,
  };
});

vi.mock("@/lib/campaignDashboard", () => ({
  CampaignAccessError: mocks.CampaignAccessError,
  CampaignConnectionError: mocks.CampaignConnectionError,
  fetchCampaignDashboard: mocks.fetchCampaignDashboard,
  formatCampaignTime: (value?: number) => value ? `Time ${value}` : "Not available",
  humanCampaignStatus: () => ({ label: "Active", detail: "Discovery and drafting are active." }),
  readCampaignLink: () => ({ campaignId: "campaign-1", accessToken: "private-token" }),
  verifiedApplicationCompanies: (campaign: { verified_applications?: Array<{ company?: string | null }> }) => {
    const seen = new Set<string>();
    return (campaign.verified_applications || []).filter((application) => {
      const company = application.company?.trim();
      if (!company || seen.has(company)) return false;
      seen.add(company);
      return true;
    });
  },
  verifiedEvidenceCount: (campaign: { evidence_count?: number }) => Math.max(0, Number(campaign.evidence_count) || 0),
}));

describe("private campaign status page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.fetchCampaignDashboard.mockReset();
    window.history.replaceState({}, "", "/campaign/campaign-1#access=private-token");
  });

  it("shows a loading state before the campaign API resolves", async () => {
    mocks.fetchCampaignDashboard.mockReturnValue(new Promise(() => undefined));
    const { default: CampaignStatus } = await import("./CampaignStatus");
    const screen = render(<CampaignStatus />);

    expect(screen.getByText(/loading your campaign update/i)).toBeTruthy();
    expect(screen.getByText(/does not treat activity notes as application proof/i)).toBeTruthy();
  });

  it("shows a safe access-link recovery state when the campaign token is rejected", async () => {
    mocks.fetchCampaignDashboard.mockRejectedValue(new mocks.CampaignAccessError("This campaign link is invalid."));
    const { default: CampaignStatus } = await import("./CampaignStatus");
    const screen = render(<CampaignStatus />);

    await waitFor(() => expect(screen.getByText(/campaign link needed/i)).toBeTruthy());
    expect(screen.getByText(/this campaign link is invalid/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /contact autoapply sa/i }).getAttribute("href")).toContain("wa.me/966571448656");
  });

  it("shows a service-recovery state when the campaign API cannot be reached", async () => {
    mocks.fetchCampaignDashboard.mockRejectedValue(new mocks.CampaignConnectionError("AutoApply SA could not reach the campaign update service."));
    const { default: CampaignStatus } = await import("./CampaignStatus");
    const screen = render(<CampaignStatus />);

    await waitFor(() => expect(screen.getByText(/campaign updates unavailable/i)).toBeTruthy());
    expect(screen.getByText(/could not reach the campaign update service/i)).toBeTruthy();
  });

  it("uses evidence totals and keeps activity language separate from application proof", async () => {
    mocks.fetchCampaignDashboard.mockResolvedValue({
      campaign: {
        id: "campaign-1",
        target_role: "Operations Analyst",
        city: "Jeddah",
        evidence_count: 2,
        email_send_count: 1,
        created_at: 10,
        updated_at: 20,
        last_application_at: 15,
        verified_applications: [
          { id: "proof-1", evidence_type: "email_smtp_accepted", company: "Verified Company", title: "Operations Analyst", created_at: 15 },
          { id: "proof-2", evidence_type: "greenhouse_submit_confirmation", company: "Verified Company", title: "Operations Analyst", created_at: 14 },
        ],
      },
      events: [{ id: 1, campaign_id: "campaign-1", event_type: "campaign_activated", level: "info", message: "Discovery started.", created_at: 20 }],
    });
    const { default: CampaignStatus } = await import("./CampaignStatus");
    const screen = render(<CampaignStatus />);

    await waitFor(() => expect(screen.getAllByText("Operations Analyst").length).toBeGreaterThan(0));
    expect(screen.getByText("Verified application evidence").closest("[data-slot='card']")?.textContent).toContain("2");
    expect(screen.getByText("Emails sent").closest("[data-slot='card']")?.textContent).toContain("1");
    expect(screen.getByText("Verified Company")).toBeTruthy();
    expect(screen.getByText(/activity is shown below for context and is never presented as proof/i)).toBeTruthy();
    expect(screen.getByText("Discovery started.")).toBeTruthy();
  });
});
