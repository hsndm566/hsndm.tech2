import { useQuery } from "@tanstack/react-query";
import { getSupabaseToken } from "./auth";

export type ApplicationEmailInput = {
  toEmail: string;
  companyName: string;
  roleTitle: string;
  city: string;
  candidateName: string;
  candidateEmail: string;
  message: string;
  cvSummary?: string;
};

export type RecommendedJob = {
  id: string;
  companyName: string;
  roleTitle: string;
  city: string;
  source: string;
  url: string;
  summary: string;
  matchReason: string;
  freshness: string;
};

export type RecommendedJobsResult = {
  jobs: RecommendedJob[];
  mode: "live" | "curated";
  checkedAt: string;
};

export function getApiBaseUrl(origin = typeof window === "undefined" ? "" : window.location.origin) {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    const host = new URL(origin).hostname;
    if (["hsndm.tech", "www.hsndm.tech", "dashboard.hsndm.tech", "app.hsndm.tech"].includes(host)) return "https://api.hsndm.tech";
  } catch {
    return "";
  }
  return "";
}

export function apiUrl(path: string) {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function checkBackendHealth(fetchImpl: typeof fetch = fetch) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 4000);
  try {
    for (const path of ["/health", "/healthz"]) {
      const response = await fetchImpl(apiUrl(path), { signal: controller.signal, credentials: "include" });
      if (response.ok || response.status !== 404) return { ok: response.ok, status: response.status };
    }
    return { ok: false, status: 404 };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function sendApplicationEmail(input: ApplicationEmailInput, fetchImpl: typeof fetch = fetch) {
  const token = await getSupabaseToken();
  if (!token) return { ok: false, status: 401, error: "sign-in-required" };
  const response = await fetchImpl(apiUrl("/api/v2/applications/send-email"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (response.ok) return { ok: true, status: response.status, error: "" };
  let error = response.status === 404 ? "application-email-endpoint-missing" : "application-email-failed";
  try {
    const body = await response.json();
    if (typeof body?.error === "string") error = body.error;
  } catch {}
  return { ok: false, status: response.status, error };
}

export async function checkApplicationDeliveryReadiness(fetchImpl: typeof fetch = fetch) {
  const token = await getSupabaseToken();
  if (!token) return { ok: false, status: 401, error: "sign-in-required" };
  try {
    const response = await fetchImpl(apiUrl("/api/v2/applications/readiness"), {
      method: "GET",
      credentials: "include",
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.ok) return { ok: true, status: response.status, error: "" };
    let error = response.status === 404 ? "application-readiness-endpoint-missing" : "application-delivery-not-ready";
    try {
      const body = await response.json();
      if (typeof body?.error === "string") error = body.error;
    } catch {}
    return { ok: false, status: response.status, error };
  } catch {
    return { ok: false, status: 0, error: "application-delivery-not-ready" };
  }
}

export function useApplicationDeliveryReadiness() {
  return useQuery({
    queryKey: ["v2", "application-delivery-readiness"],
    queryFn: () => checkApplicationDeliveryReadiness(),
    staleTime: 60_000,
    refetchInterval: 3 * 60_000,
    refetchIntervalInBackground: true,
    retry: 1,
  });
}

export function getFallbackRecommendedJobs(params: { city?: string | null; role?: string | null }, checkedAt = new Date().toISOString()): RecommendedJobsResult {
  const city = params.city?.trim() || "Riyadh";
  const role = params.role?.trim() || "Operations";
  const query = (roleTitle: string, location = city) => new URLSearchParams({
    keywords: roleTitle,
    location: location === "Remote" ? "Saudi Arabia" : `${location}, Saudi Arabia`,
  }).toString();
  const jobs = [
    { companyName: "LinkedIn Jobs", roleTitle: `${role} roles`, city, source: "LinkedIn", summary: "Review active Saudi listings before applying.", freshness: "Search link refreshed now" },
    { companyName: "Indeed Saudi", roleTitle: `${role} openings`, city, source: "Indeed", summary: "Check employer-posted roles and save relevant ones.", freshness: "Search link refreshed now" },
    { companyName: "Company career pages", roleTitle: `${role} search`, city: "Saudi Arabia", source: "Career pages", summary: "Use this as a manual review lane for direct applications.", freshness: "Manual review lane" },
  ].map((job) => ({
    id: `${job.source}-${job.roleTitle}-${job.city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    ...job,
    url: job.source === "Indeed"
      ? `https://sa.indeed.com/jobs?${new URLSearchParams({ q: job.roleTitle, l: city }).toString()}`
      : job.source === "LinkedIn"
        ? `https://www.linkedin.com/jobs/search/?${query(job.roleTitle, job.city)}`
        : `https://www.google.com/search?${new URLSearchParams({ q: `${role} careers ${city} Saudi Arabia` }).toString()}`,
    matchReason: `Based on your ${role} direction and ${city} preference.`,
  }));
  return { jobs, mode: "curated", checkedAt };
}

export async function fetchRecommendedJobs(params: { city?: string | null; role?: string | null }, fetchImpl: typeof fetch = fetch) {
  const token = await getSupabaseToken();
  if (!token) return getFallbackRecommendedJobs(params);
  const query = new URLSearchParams();
  if (params.city) query.set("city", params.city);
  if (params.role) query.set("role", params.role);
  try {
    const response = await fetchImpl(apiUrl(`/api/v2/jobs/recommended?${query.toString()}`), {
      credentials: "include",
      headers: { authorization: `Bearer ${token}` },
    });
    if (!response.ok) return getFallbackRecommendedJobs(params);
    return response.json() as Promise<RecommendedJobsResult>;
  } catch {
    return getFallbackRecommendedJobs(params);
  }
}

export function useRecommendedJobs(params: { city?: string | null; role?: string | null; enabled?: boolean }) {
  return useQuery({
    queryKey: ["v2", "recommended-jobs", params.city, params.role],
    enabled: params.enabled !== false,
    queryFn: () => fetchRecommendedJobs(params),
    staleTime: 5 * 60_000,
    refetchInterval: 12 * 60_000,
    refetchIntervalInBackground: true,
    retry: 1,
  });
}

export function useBackendHealth() {
  return useQuery({
    queryKey: ["v2", "backend-health"],
    queryFn: () => checkBackendHealth(),
    staleTime: 60_000,
    refetchInterval: 8 * 60_000,
    refetchIntervalInBackground: true,
    retry: 1,
  });
}
