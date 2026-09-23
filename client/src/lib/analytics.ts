/** Lightweight client-side engagement tracking that safely becomes a no-op if analytics is unavailable. */
type EngagementProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    umami?: { track: (eventName: string, properties?: EngagementProperties) => void };
  }
}

const CONSENT_COOKIE = "autoapply_optional_consent";
const DISTINCT_ID_KEY = "autoapply_distinct_id";

function optionalAnalyticsAllowed() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((entry) => entry === `${CONSENT_COOKIE}=accepted`);
}

function posthogKey() {
  return (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
}

function posthogHost() {
  return ((import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim() || "https://app.posthog.com").replace(/\/$/, "");
}

function distinctId() {
  try {
    const existing = window.localStorage.getItem(DISTINCT_ID_KEY);
    if (existing) return existing;
    const generated = crypto.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(DISTINCT_ID_KEY, generated);
    return generated;
  } catch {
    return "anonymous-browser";
  }
}

function sendPostHog(eventName: string, properties: EngagementProperties = {}) {
  const key = posthogKey();
  if (!key || !optionalAnalyticsAllowed()) return;
  try {
    const body = JSON.stringify({
      api_key: key,
      event: eventName,
      distinct_id: distinctId(),
      properties: {
        ...properties,
        app: "autoapply-sa-v2",
        path: window.location.pathname,
        url: window.location.href,
        referrer: document.referrer || undefined,
        title: document.title,
      },
    });
    const endpoint = `${posthogHost()}/capture/`;
    if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }))) return;
    void fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  } catch {
    // Analytics can fail silently; customer actions should never depend on it.
  }
}

export function trackEngagement(eventName: string, properties: EngagementProperties = {}) {
  try {
    window.dispatchEvent(new CustomEvent("autoapply:conversion", { detail: { eventName, properties } }));
    window.umami?.track(eventName, properties);
    sendPostHog(eventName, properties);
  } catch {
    // Navigation and campaign actions must remain reliable even if analytics is blocked.
  }
}

export function trackPageView(path: string, properties: EngagementProperties = {}) {
  trackEngagement("page_view", { path, ...properties });
}
