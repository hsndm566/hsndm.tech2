export function isDashboardSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.startsWith("dashboard.") || hostname === "dashboard.hsndm.tech";
}

type DashboardRedirectInput = {
  hostname: string;
  pathname: string;
  search?: string;
  hash?: string;
};

/**
 * Keeps the public website canonical at www while sending protected dashboard
 * paths to the first-party host configured for Clerk's FAPI origin policy.
 */
export function getDashboardHostRedirect({ hostname, pathname, search = "", hash = "" }: DashboardRedirectInput): string | null {
  const isPublicCanonicalHost = hostname.toLowerCase() === "www.hsndm.tech";
  const isDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  if (!isPublicCanonicalHost || !isDashboardPath) return null;
  return `https://dashboard.hsndm.tech${pathname}${search}${hash}`;
}
