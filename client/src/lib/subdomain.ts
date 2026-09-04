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
 * and customer-auth paths to the first-party host configured for Clerk.
 */
export function getDashboardHostRedirect({ hostname, pathname, search = "", hash = "" }: DashboardRedirectInput): string | null {
  const isPublicCanonicalHost = hostname.toLowerCase() === "www.hsndm.tech";
  const isCustomerPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/sign-in" || pathname === "/sign-up";
  if (!isPublicCanonicalHost || !isCustomerPath) return null;
  return `https://dashboard.hsndm.tech${pathname}${search}${hash}`;
}
