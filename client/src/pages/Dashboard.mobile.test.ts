import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");

describe("candidate dashboard responsive contract", () => {
  it("stacks the dashboard header on small screens instead of allowing title and auth controls to overlap", () => {
    expect(dashboardSource).toContain("flex flex-col gap-3 md:flex-row");
    expect(dashboardSource).toContain("min-w-0 truncate text-base");
  });
});
