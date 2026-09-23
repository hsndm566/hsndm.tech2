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

export function getApiBaseUrl(origin = typeof window === "undefined" ? "" : window.location.origin) {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    const host = new URL(origin).hostname;
    if (host === "hsndm.tech" || host === "www.hsndm.tech") return "https://api.hsndm.tech";
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
  const timeout = window.setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetchImpl(apiUrl("/health"), { signal: controller.signal, credentials: "include" });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    window.clearTimeout(timeout);
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
  let error = "application-email-failed";
  try {
    const body = await response.json();
    if (typeof body?.error === "string") error = body.error;
  } catch {}
  return { ok: false, status: response.status, error };
}

export async function fetchRecommendedJobs(params: { city?: string | null; role?: string | null }, fetchImpl: typeof fetch = fetch) {
  const token = await getSupabaseToken();
  if (!token) return { jobs: [] as RecommendedJob[], mode: "unavailable" as const, checkedAt: new Date().toISOString() };
  const query = new URLSearchParams();
  if (params.city) query.set("city", params.city);
  if (params.role) query.set("role", params.role);
  const response = await fetchImpl(apiUrl(`/api/v2/jobs/recommended?${query.toString()}`), {
    credentials: "include",
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("job-discovery-failed");
  return response.json() as Promise<{ jobs: RecommendedJob[]; mode: "live" | "curated"; checkedAt: string }>;
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
