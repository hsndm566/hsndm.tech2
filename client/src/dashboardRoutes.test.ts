import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("dashboard route graph", () => {
  it("keeps the browser helper reachable on the dashboard host", () => {
    expect(app).toContain('"/dashboard/browser-helper"');
    expect(app).toContain("DashboardBrowserHelperCta");
  });
});
