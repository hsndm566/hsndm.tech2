import { Laptop } from "lucide-react";
import { Link, useLocation } from "wouter";

export function DashboardBrowserHelperCta() {
  const [location] = useLocation();
  if (!location.startsWith("/dashboard") || location === "/dashboard/browser-helper") return null;

  return (
    <Link
      href="/dashboard/browser-helper"
      className="fixed bottom-5 right-5 z-[65] inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#151515] px-4 py-3 text-sm font-extrabold !text-[#f5f2eb] shadow-xl transition hover:bg-[#e5482a] hover:!text-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]"
      aria-label="Set up AutoApply local browser helper"
    >
      <Laptop className="size-4" /> Browser helper
    </Link>
  );
}
