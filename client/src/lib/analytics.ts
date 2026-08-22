/** Lightweight client-side engagement tracking that safely becomes a no-op if analytics is unavailable. */
type EngagementProperties = Record<string, string>;

declare global {
  interface Window {
    umami?: { track: (eventName: string, properties?: EngagementProperties) => void };
  }
}

export function trackEngagement(eventName: string, properties: EngagementProperties = {}) {
  try {
    window.dispatchEvent(new CustomEvent("autoapply:conversion", { detail: { eventName, properties } }));
    window.umami?.track(eventName, properties);
  } catch {
    // Navigation and campaign actions must remain reliable even if analytics is blocked.
  }
}
