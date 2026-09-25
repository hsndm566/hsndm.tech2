/** Lightweight client-side engagement tracking. Analytics never controls customer actions. */
type EngagementProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    umami?: { track: (eventName: string, properties?: Record<string, string | number | boolean | null>) => void };
  }
}

const CONSENT_COOKIE = "autoapply_optional_consent";

function optionalAnalyticsAllowed() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((entry) => entry === `${CONSENT_COOKIE}=accepted`);
}

function cleanProperties(properties: EngagementProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean | null>;
}

export function trackEngagement(eventName: string, properties: EngagementProperties = {}) {
  try {
    window.dispatchEvent(new CustomEvent("autoapply:conversion", { detail: { eventName, properties } }));
    if (!optionalAnalyticsAllowed()) return;
    window.umami?.track(eventName.slice(0, 50), cleanProperties(properties));
  } catch {
    // Analytics failures must never interrupt customer-facing actions.
  }
}
