import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const dashboardShell = readFileSync(new URL("./components/ClerkDashboardShell.tsx", import.meta.url), "utf8");
const dashboardEntry = readFileSync(new URL("./routes/DashboardEntry.tsx", import.meta.url), "utf8");
const viteConfig = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

describe("dashboard-only Clerk loading", () => {
  it("loads the Clerk provider only from the lazy dashboard shell", () => {
    expect(appSource).toContain('lazy(() => import("@/routes/DashboardEntry"))');
    expect(appSource).not.toContain('from "@/components/ClerkSessionBoundary"');
    expect(appSource).not.toContain("ClerkDashboardShell");
    expect(dashboardShell).toContain("ClerkSessionBoundary");
    expect(dashboardShell).toContain("canUseClerkOnCurrentOrigin");
    expect(dashboardEntry).toContain("ClerkDashboardShell");
    expect(dashboardEntry).toContain('path="/dashboard"');
    expect(viteConfig).toContain('if (id.includes("/node_modules/@clerk/clerk-react/")) return "clerk-auth"');
    expect(viteConfig).not.toContain('dependency.includes("clerk-auth")');
    expect(appSource).toContain("function DashboardHostRedirectGate");
    expect(appSource.indexOf("<DashboardHostRedirectGate>")).toBeLessThan(appSource.indexOf("<Suspense fallback="));
  });
});
