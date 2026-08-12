export type Campaign = {
  id: string;
  candidate_name: string;
  candidate_email: string;
  target_role: string;
  city?: string;
  industry?: string;
  seniority?: string;
  language?: string;
  status: string;
  created_at: number;
  external_execution_enabled: boolean;
  job_counts: Record<string, number>;
  outbox_counts: Record<string, number>;
  evidence_count: number;
};

export type CampaignEvent = {
  id: number;
  event_type: string;
  level: "info" | "warning" | "error";
  message: string;
  created_at: number;
  metadata: Record<string, unknown>;
};

export type CampaignSession = {
  campaignId: string;
  token: string;
};

const STORAGE_KEY = "autoapply-campaign-session";
const baseUrl = (import.meta.env.VITE_AUTOPPLY_API_URL || "").replace(/\/$/, "");

function endpoint(path: string) {
  if (!baseUrl) throw new Error("Campaign platform is being configured. Please try again shortly.");
  return `${baseUrl}${path}`;
}

async function decode<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data?.error === "string" ? data.error.replace(/_/g, " ") : "Request failed";
    throw new Error(detail);
  }
  return data as T;
}

export function saveCampaignSession(session: CampaignSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadCampaignSession(): CampaignSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw);
    return item?.campaignId && item?.token ? item : null;
  } catch {
    return null;
  }
}

export async function createCampaign(fields: {
  candidateName: string;
  candidateEmail: string;
  targetRole: string;
  city?: string;
  industry?: string;
  seniority?: string;
  language?: string;
  cv?: File | null;
}): Promise<{ campaign: Campaign; session: CampaignSession }> {
  const form = new FormData();
  form.set("candidate_name", fields.candidateName);
  form.set("candidate_email", fields.candidateEmail);
  form.set("target_role", fields.targetRole);
  form.set("city", fields.city || "");
  form.set("industry", fields.industry || "");
  form.set("seniority", fields.seniority || "");
  form.set("language", fields.language || "");
  if (fields.cv) form.set("cv", fields.cv);

  const data = await decode<{ campaign: Campaign; campaign_access_token: string }>(
    await fetch(endpoint("/v1/campaigns"), { method: "POST", body: form }),
  );
  const session = { campaignId: data.campaign.id, token: data.campaign_access_token };
  saveCampaignSession(session);
  return { campaign: data.campaign, session };
}

export async function getCampaign(session: CampaignSession): Promise<Campaign> {
  const data = await decode<{ campaign: Campaign }>(
    await fetch(endpoint(`/v1/campaigns/${session.campaignId}`), { headers: { "X-Campaign-Token": session.token } }),
  );
  return data.campaign;
}

export async function getCampaignEvents(session: CampaignSession): Promise<CampaignEvent[]> {
  const data = await decode<{ events: CampaignEvent[] }>(
    await fetch(endpoint(`/v1/campaigns/${session.campaignId}/events`), { headers: { "X-Campaign-Token": session.token } }),
  );
  return data.events;
}

export async function startCampaign(session: CampaignSession): Promise<Campaign> {
  const data = await decode<{ campaign: Campaign }>(
    await fetch(endpoint(`/v1/campaigns/${session.campaignId}/start`), {
      method: "POST",
      headers: { "X-Campaign-Token": session.token },
    }),
  );
  return data.campaign;
}
