import { useQuery } from "@tanstack/react-query";
import { getSupabaseToken } from "./auth";

export type ApplicationEmailInput = {
  toEmail: string;
  jobId: string;
};

export type ApplicationSendResult = {
  ok: boolean;
  status: number;
  error: string;
  messageId?: string;
  application?: Record<string, unknown>;
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
  mode: "live" | "unavailable";
  checkedAt: string;
};

export function getApiBaseUrl(origin = typeof window === "undefined" ? "" : window.location.origin) {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, "");
  try {
    const host = new URL(origin).hostname;
    if (["hsndm.tech", "www.hsndm.tech", "dashboard.hsndm.tech", "app.hsndm.tech"].includes(host)) {
      return "https://api.hsndm.tech";
    }
  } catch {}
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
    for (const path of ["/api/v2/health", "/healthz/auth", "/health"]) {
      const response = await fetchImpl(apiUrl(path), { signal: controller.signal, credentials: "include" });
      if (response.ok) return { ok: true, status: response.status, path };
      if (response.status !== 404) return { ok: false, status: response.status, path };
    }
    return { ok: false, status: 404, path: "" };
  } catch {
    return { ok: false, status: 0, path: "" };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function sendApplicationEmail(
  input: ApplicationEmailInput,
  fetchImpl: typeof fetch = fetch,
): Promise<ApplicationSendResult> {
  const token = await getSupabaseToken();
  if (!token) return { ok: false, status: 401, error: "sign-in-required" };

  try {
    const response = await fetchImpl(apiUrl("/api/v2/applications/send-email"), {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    let body: any = null;
    try {
      body = await response.json();
    } catch {}

    if (response.ok && body?.ok === true && typeof body?.messageId === "string") {
      return {
        ok: true,
        status: response.status,
        error: "",
        messageId: body.messageId,
        application: body.application,
      };
    }

    const error =
      typeof body?.error === "string"
        ? body.error
        : response.status === 404
          ? "application-email-endpoint-missing"
          : "application-email-failed";
    return { ok: false, status: response.status, error };
  } catch {
    return { ok: false, status: 0, error: "application-email-failed" };
  }
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

export function getFallbackRecommendedJobs(
  _params: { city?: string | null; role?: string | null },
  checkedAt = new Date().toISOString(),
): RecommendedJobsResult {
  return { jobs: [], mode: "unavailable", checkedAt };
}

export async function fetchRecommendedJobs(
  params: { city?: string | null; role?: string | null },
  fetchImpl: typeof fetch = fetch,
): Promise<RecommendedJobsResult> {
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
    const body = await response.json();
    if (!Array.isArray(body?.jobs) || body?.mode !== "live") return getFallbackRecommendedJobs(params);
    return body as RecommendedJobsResult;
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
