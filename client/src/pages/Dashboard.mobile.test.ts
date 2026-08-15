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
