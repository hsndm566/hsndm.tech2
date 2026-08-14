import { describe, expect, it, vi } from "vitest";
import {
  CampaignAccessError,
  fetchCampaignDashboard,
  humanCampaignStatus,
  preferredCampaignLink,
  readCampaignLink,
  verifiedApplicationCompanies,
  verifiedEvidenceCount,
} from "./campaignDashboard";

describe("campaign dashboard contract", () => {
  it("reads a campaign ID from the path and keeps the bearer token in the URL fragment", () => {
    expect(readCampaignLink("/campaign/campaign-123", "", "#access=private-token")).toEqual({
      campaignId: "campaign-123",
      accessToken: "private-token",
    });
    expect(preferredCampaignLink("campaign 123", "private token")).toBe("/campaign/campaign%20123#access=private%20token");
  });

  it("uses the current summary evidence count instead of treating activity events as application proof", () => {
    expect(verifiedEvidenceCount({ id: "campaign-1", evidence_count: 2 })).toBe(2);
    expect(verifiedEvidenceCount({ id: "campaign-1", evidence_count: -3 })).toBe(0);
    expect(verifiedApplicationCompanies({
      id: "campaign-1",
      verified_applications: [
        { id: "proof-1", evidence_type: "confirmation_url", company: "Company A", created_at: 10 },
        { id: "proof-2", evidence_type: "email_smtp_accepted", company: "Company A", created_at: 9 },
      ],
    })).toHaveLength(1);
    expect(humanCampaignStatus("active_readonly").label).toBe("Active");
  });

  it("uses only existing summary and event endpoints with the campaign token header", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, campaign: { id: "campaign-1", evidence_count: 1 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, events: [] }), { status: 200 }));

    await expect(fetchCampaignDashboard({ campaignId: "campaign-1", accessToken: "token-1" }, fetcher)).resolves.toEqual({
      campaign: { id: "campaign-1", evidence_count: 1 },
      events: [],
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://autoapply-sa-production.up.railway.app/v1/campaigns/campaign-1",
      { headers: { "X-Campaign-Token": "token-1" } },
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://autoapply-sa-production.up.railway.app/v1/campaigns/campaign-1/events?limit=100",
      { headers: { "X-Campaign-Token": "token-1" } },
    );
  });

  it("reports a rejected bearer link without exposing data", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403 }));
    await expect(fetchCampaignDashboard({ campaignId: "campaign-1", accessToken: "wrong-token" }, fetcher)).rejects.toBeInstanceOf(CampaignAccessError);
  });
});
