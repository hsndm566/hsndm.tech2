import { useQuery } from "@tanstack/react-query";

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

export function useBackendHealth() {
  return useQuery({
    queryKey: ["v2", "backend-health"],
    queryFn: () => checkBackendHealth(),
    staleTime: 60_000,
    retry: 1,
  });
}
