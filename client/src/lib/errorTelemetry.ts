/** Privacy-conscious browser reliability telemetry sent only through the optional analytics provider. */
import { trackEngagement } from "@/lib/analytics";

function compactMessage(value: unknown) {
  return String(value || "unknown error").replace(/https?:\/\/\S+/g, "[url]").replace(/\s+/g, " ").slice(0, 160);
}

function monitorBlankMain() {
  let recorded = false;
  const check = () => {
    if (recorded) return;
    const main = document.querySelector("#root main");
    const rect = main?.getBoundingClientRect();
    if (!main || !rect || rect.height < 24 || rect.width < 24) {
      recorded = true;
      trackEngagement("client_blank_content", { page: window.location.pathname, type: "missing_or_zero_height_main" });
    }
  };
  window.setTimeout(check, 1600);
  window.setTimeout(check, 5000);
}

export function installErrorTelemetry() {
  let errorCount = 0;
  const recordError = (type: string, message: unknown) => {
    errorCount += 1;
    trackEngagement("client_error", {
      page: window.location.pathname,
      type,
      message: compactMessage(message),
    });
    if (errorCount === 3) trackEngagement("client_sustained_errors", { page: window.location.pathname, type: "three_or_more_errors" });
  };

  window.addEventListener("error", (event) => {
    const target = event.target as HTMLElement | null;
    const assetType = target?.tagName === "SCRIPT" || target?.tagName === "LINK" || target?.tagName === "IMG" ? `asset_${target.tagName.toLowerCase()}_error` : "error";
    recordError(assetType, event.message || target?.tagName);
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    recordError("unhandled_rejection", event.reason?.message || event.reason);
  });

  monitorBlankMain();
}
