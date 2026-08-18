import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");

describe("candidate dashboard responsive contract", () => {
  it("stacks the dashboard header on small screens instead of allowing title and auth controls to overlap", () => {
    expect(dashboardSource).toContain("flex flex-col gap-3 md:flex-row");
    expect(dashboardSource).toContain("min-w-0 truncate text-base");
  });

  it("exposes an accessible activity notification badge and target anchor", () => {
    expect(dashboardSource).toContain("ActivityNotificationButton");
    expect(dashboardSource).toContain('id="recent-activity"');
    expect(dashboardSource).toContain("autoapply_activity_seen_at");
    expect(dashboardSource).toContain("Mark all as read");
    expect(dashboardSource).toContain("unreadActivityCount");
  });
  it("includes date sorting and status filtering controls in the dashboard feed", () => {
    expect(dashboardSource).toContain("sortBy");
    expect(dashboardSource).toContain("Newest first");
    expect(dashboardSource).toContain("Oldest first");
    expect(dashboardSource).toContain("Company name");
    expect(dashboardSource).toContain("Role title");
  });
  it("includes a New Application button and form fields for manual job entries", () => {
    expect(dashboardSource).toContain("New Application");
    expect(dashboardSource).toContain("Add New Job Application");
    expect(dashboardSource).toContain("companyName");
    expect(dashboardSource).toContain("roleTitle");
  });

  it("provides concise edit and deliberate deletion controls for every application entry", () => {
    expect(dashboardSource).toContain("Edit Job Application");
    expect(dashboardSource).toContain("Delete this application?");
    expect(dashboardSource).toContain("updateAppMutation");
    expect(dashboardSource).toContain("deleteAppMutation");
    expect(dashboardSource).toContain("onClick={(event) => event.stopPropagation()}");
  });

  it("renders a data-error recovery state before considering an authenticated dashboard empty", () => {
    expect(dashboardSource).toContain("isError: appsError");
    expect(dashboardSource).toContain("isError: profileError");
    expect(dashboardSource).toContain("We could not load your campaign data");
    expect(dashboardSource.indexOf("We could not load your campaign data")).toBeLessThan(dashboardSource.indexOf("applications.length === 0"));
  });

  it("uses Clerk identity for manual applications when the dashboard runs in Clerk mode", () => {
    expect(dashboardSource).toContain("const candidateIdentity = clerkDashboardEnabled");
    expect(dashboardSource).toContain("clerkAuth.user?.fullName?.trim()");
    expect(dashboardSource).toContain("clerkAuth.user?.primaryEmailAddress?.emailAddress");
    expect(dashboardSource).toContain("candidateName: candidateIdentity.name");
    expect(dashboardSource).toContain("candidateEmail: candidateIdentity.email");
  });
});
