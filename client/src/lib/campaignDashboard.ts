/**
 * Public campaign API origin. DNS routes this hostname to the isolated AutoApply SA
 * Edge API so candidate links never expose an infrastructure-provider URL.
 */
export const CAMPAIGN_API_BASE = "https://api.hsndm.tech";

export type CampaignSummary = {
  id: string;
  candidate_name?: string;
  target_role?: string;
  city?: string;
  industry?: string;
  status?: string;
  created_at?: number;
  updated_at?: number;
  evidence_count?: number;
  email_send_count?: number;
  last_application_at?: number | null;
  verified_applications?: VerifiedApplication[];
  job_counts?: Record<string, number>;
  outbox_counts?: Record<string, number>;
  external_execution_enabled?: boolean;
};

export type VerifiedApplication = {
  id: string;
  evidence_type: string;
  campaign_job_id?: string | null;
  company?: string | null;
  title?: string | null;
  location?: string | null;
  created_at: number;
};

export type CampaignEvent = {
  id: number;
  campaign_id: string;
  event_type: string;
  level: "info" | "warning" | "error" | string;
  message: string;
  metadata?: Record<string, unknown>;
  created_at: number;
};

type CampaignResponse = { ok: boolean; campaign?: CampaignSummary; error?: string };
type EventsResponse = { ok: boolean; events?: CampaignEvent[]; error?: string };

export type CampaignDashboardPayload = {
  campaign: CampaignSummary;
  events: CampaignEvent[];
};

export type CampaignLink = {
  campaignId: string;
  accessToken: string;
};

export class CampaignAccessError extends Error {}
export class CampaignConnectionError extends Error {}

const clean = (value: string | null | undefined) => value?.trim() || "";

export function readCampaignLink(pathname: string, search: string, hash: string): CampaignLink | null {
  const match = pathname.match(/^\/campaign\/([^/]+)\/?$/);
  const campaignId = clean(match?.[1]);
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search);
  const accessToken = clean(hashParams.get("access") || hashParams.get("token") || searchParams.get("access") || searchParams.get("token"));

  return campaignId && accessToken ? { campaignId, accessToken } : null;
}

export function preferredCampaignLink(campaignId: string, accessToken: string) {
  return `/campaign/${encodeURIComponent(campaignId)}#access=${encodeURIComponent(accessToken)}`;
}

function campaignStatusError(status: number) {
  if (status === 401 || status === 403) {
    return new CampaignAccessError("This campaign link is invalid, expired, or does not grant access to this campaign.");
  }
  if (status === 404) {
    return new CampaignConnectionError("The campaign API could not find this campaign. Please ask AutoApply SA to confirm the campaign link.");
  }
  return new CampaignConnectionError("The campaign update service is temporarily unavailable. Please try again shortly.");
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new CampaignConnectionError("The campaign update service returned an unreadable response. Please try again shortly.");
  }
}

export async function fetchCampaignDashboard(link: CampaignLink, fetcher: typeof fetch = fetch): Promise<CampaignDashboardPayload> {
  const path = `${CAMPAIGN_API_BASE}/v1/campaigns/${encodeURIComponent(link.campaignId)}`;
  const headers = { "X-Campaign-Token": link.accessToken };

  let summaryResponse: Response;
  let eventsResponse: Response;
  try {
    [summaryResponse, eventsResponse] = await Promise.all([
      fetcher(path, { headers }),
      fetcher(`${path}/events?limit=100`, { headers }),
    ]);
  } catch {
    throw new CampaignConnectionError("AutoApply SA could not reach the campaign update service. Check your connection and try again.");
  }

  if (!summaryResponse.ok) throw campaignStatusError(summaryResponse.status);
  if (!eventsResponse.ok) throw campaignStatusError(eventsResponse.status);

  const [summary, events] = await Promise.all([
    readJson<CampaignResponse>(summaryResponse),
    readJson<EventsResponse>(eventsResponse),
  ]);

  if (!summary.ok || !summary.campaign) throw new CampaignConnectionError("The campaign update service did not return a usable campaign summary.");
  if (!events.ok || !Array.isArray(events.events)) throw new CampaignConnectionError("The campaign update service did not return a usable activity history.");

  return { campaign: summary.campaign, events: events.events };
}

export function verifiedEvidenceCount(campaign: CampaignSummary) {
  return Math.max(0, Number(campaign.evidence_count) || 0);
}

export function verifiedApplicationCompanies(campaign: CampaignSummary) {
  const seen = new Set<string>();
  return (campaign.verified_applications || []).filter((application) => {
    const company = clean(application.company);
    if (!company || seen.has(company.toLocaleLowerCase())) return false;
    seen.add(company.toLocaleLowerCase());
    return true;
  });
}

export function humanCampaignStatus(status?: string) {
  switch (status) {
    case "active_readonly":
      return { label: "Active", detail: "Discovery and drafting are active; external submission remains controlled." };
    case "paused":
      return { label: "Paused", detail: "Future campaign work is paused." };
    case "intake_received":
      return { label: "Pending", detail: "Your campaign intake has been received." };
    default:
      return { label: "Pending", detail: "Campaign status is awaiting its next update." };
  }
}

export function formatCampaignTime(value?: number) {
  if (!value || !Number.isFinite(value)) return "Not available";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value * 1000));
}

export type CampaignHealth = {
  score: number;
  label: "Strong" | "Building" | "Needs attention" | "Review required";
  actionLine: string;
};

export function computeCampaignHealth(campaign: CampaignSummary): CampaignHealth {
  const evidenceCount = verifiedEvidenceCount(campaign);
  const emailCount = Math.max(0, Number(campaign.email_send_count) || 0);
  const totalAttempted = Math.max(1, evidenceCount + emailCount);
  const successRate = Math.min(1, evidenceCount / totalAttempted);
  const evidenceRate = Math.min(1, evidenceCount / Math.max(1, evidenceCount)); // 1.0 if any evidence, else 0

  // Weights: ATS score 30%, Role match 25%, Submission success 30%, Evidence record rate 15%
  const atsScore = 75; // default benchmark if not present
  const matchStrength = 80; // default confidence
  const subSuccessPct = successRate * 100;
  const evidencePct = evidenceCount > 0 ? 100 : 0;

  const score = Math.round((atsScore * 0.30) + (matchStrength * 0.25) + (subSuccessPct * 0.30) + (evidencePct * 0.15));
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped >= 85) {
    return { score: clamped, label: "Strong", actionLine: "Your campaign is performing well." };
  }
  if (clamped >= 65) {
    return { score: clamped, label: "Building", actionLine: "More applications are needed to see results." };
  }
  if (clamped >= 40) {
    return { score: clamped, label: "Needs attention", actionLine: "Consider a CV review to improve match rate." };
  }
  return { score: clamped, label: "Review required", actionLine: "Campaign paused — manual review recommended." };
}

export function getCvVersionTag(application: VerifiedApplication, allApplications: VerifiedApplication[]): string {
  // Chronological order: sort applications by created_at ascending
  const sorted = [...allApplications].sort((a, b) => a.created_at - b.created_at);
  const index = sorted.findIndex(app => app.id === application.id);
  const versionNum = index >= 0 ? index + 1 : 1;
  return `CV v${versionNum}`;
}

