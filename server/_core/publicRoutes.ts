const exactPublicRoutes = new Set([
  "/",
  "/ar",
  "/ar/enquire",
  "/ar/thank-you",
  "/enquire",
  "/dashboard",
  "/dashboard/settings",
  "/thank-you",
  "/ats",
  "/pricing",
  "/services",
  "/ar/pricing",
  "/ar/services",
  "/how-it-works",
  "/support",
  "/case-studies",
  "/campaign-report-sample",
  "/privacy",
  "/terms",
  "/ar/how-it-works",
  "/ar/support",
  "/ar/case-studies",
  "/ar/campaign-report-sample",
  "/ar/privacy",
  "/ar/terms",
  "/404",
]);

function normalizePathname(pathname: string) {
  if (!pathname.startsWith("/")) return "";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/**
 * Mirrors client/src/App.tsx so direct navigation to a legitimate SPA route
 * receives the application shell, while a typo remains a real HTTP 404.
 */
export function isKnownPublicRoute(pathname: string) {
  const normalized = normalizePathname(pathname);
  return exactPublicRoutes.has(normalized) || /^\/campaign\/[^/]+$/.test(normalized);
}

export function getPathnameFromRequestUrl(requestUrl: string) {
  if (!requestUrl.startsWith("/") && !/^https?:\/\//.test(requestUrl)) return "/";
  try {
    return new URL(requestUrl, "http://localhost").pathname;
  } catch {
    return "/";
  }
}
