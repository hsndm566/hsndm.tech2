export function isDashboardSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.startsWith("dashboard.") || hostname === "dashboard.hsndm.tech";
}
