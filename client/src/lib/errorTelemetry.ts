/** Privacy-conscious browser error telemetry sent through the existing analytics provider. */
import { trackEngagement } from "@/lib/analytics";

function compactMessage(value: unknown) {
  return String(value || "unknown error").replace(/https?:\/\/\S+/g, "[url]").replace(/\s+/g, " ").slice(0, 160);
}

export function installErrorTelemetry() {
  window.addEventListener("error", (event) => {
    trackEngagement("client_error", {
      page: window.location.pathname,
      type: "error",
      message: compactMessage(event.message),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEngagement("client_error", {
      page: window.location.pathname,
      type: "unhandled_rejection",
      message: compactMessage(event.reason?.message || event.reason),
    });
  });
}
